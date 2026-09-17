'use strict';

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');
const Settings = require('./services/settings');
const WarningStore = require('./moderation/warnings');
const AntiSpam = require('./moderation/antiSpam');
const { handleAntiLink } = require('./moderation/antiLink');
const ModerationLogger = require('./services/moderationLogger');
const ModerationService = require('./services/moderationService');
const { isAdmin, isAuthorizedNumber } = require('./utils/permissions');
const { handleCommand } = require('./commands');
const { authDirectory, dataDirectory } = require('./utils/storage');
const { startHealthServer } = require('./services/healthServer');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: authDirectory }),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

let mainChat = null;
let adminChat = null;
let enabled = false;
let settings;
let warnings;
let antiSpam;
let logger;
let moderation;
let whatsappConnected = false;
const processed = new Map();

function messageId(message) {
  return message.id?._serialized || `${message.from}:${message.timestamp}:${message.body}`;
}

function isDuplicate(message) {
  const id = messageId(message);
  if (processed.has(id)) return true;
  processed.set(id, Date.now());
  return false;
}

async function initializeServices() {
  settings = await new Settings(config).init();
  warnings = await new WarningStore().init();
  antiSpam = new AntiSpam(config.spam);
  logger = new ModerationLogger({ getAdminChat: () => adminChat, timezone: config.timezone, dryRun: config.dryRun });
  moderation = new ModerationService({ client, config, warnings, logger, getMainChat: () => mainChat });
  setInterval(() => {
    antiSpam.cleanup();
    const cutoff = Date.now() - 120000;
    for (const [id, time] of processed) if (time < cutoff) processed.delete(id);
  }, config.spam.limpezaIntervalo).unref();
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getChatsWithRetry({ attempts = 1, interval = 1000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const chats = await client.getChats();
      if (!Array.isArray(chats)) throw new Error('O WhatsApp retornou uma lista de conversas inválida');
      return chats;
    } catch (error) {
      lastError = error;
      console.warn(`[WARNING] Conversas ainda não disponíveis (${attempt}/${attempts}): ${error.message}`);
      if (attempt < attempts) await wait(interval);
    }
  }
  throw new Error(`Não foi possível carregar as conversas após ${attempts} tentativas: ${lastError?.message || 'erro desconhecido'}`, { cause: lastError });
}

async function discoverGroupIdsSafely() {
  console.warn('[WARNING] Usando descoberta simplificada de grupos como fallback.');
  return client.pupPage.evaluate(() => {
    const collection = window.require('WAWebCollections').Chat;
    return collection.getModelsArray().flatMap((chat) => {
      try {
        const id = chat?.id?._serialized;
        if (!id || !id.endsWith('@g.us')) return [];
        return [{
          id,
          name: chat.formattedTitle || chat.name || chat.contact?.formattedName || ''
        }];
      } catch (_) {
        return [];
      }
    });
  });
}

async function discoverGroups() {
  if (config.grupoPrincipalId && config.grupoAdmId) {
    mainChat = {
      id: { _serialized: config.grupoPrincipalId },
      name: config.grupoPrincipal,
      isGroup: true,
      participants: []
    };
    adminChat = {
      id: { _serialized: config.grupoAdmId },
      name: config.grupoAdm,
      isGroup: true,
      participants: [],
      sendMessage: (content, options) => client.sendMessage(config.grupoAdmId, content, options)
    };
  } else {
  // O evento "ready" pode ocorrer antes de o Store interno do WhatsApp terminar
  // de hidratar todas as conversas. A API pode lançar um erro opaco nesse intervalo.
  try {
    const chats = await getChatsWithRetry();
    mainChat = chats.find((chat) => chat.isGroup && chat.name === config.grupoPrincipal) || null;
    adminChat = chats.find((chat) => chat.isGroup && chat.name === config.grupoAdm) || null;
  } catch (error) {
    console.warn(`[WARNING] getChats() falhou: ${error.message}`);
    console.warn('[WARNING] Modo de captura ativado. Envie !id dentro de cada grupo.');
    mainChat = null;
    adminChat = null;
  }
  }
  console.log('\n✅ WhatsApp conectado\n\n🛡️ MODERADOR INICIADO');
  if (mainChat) console.log(`\n👥 Grupo principal:\nNome: ${mainChat.name}\nID: ${mainChat.id._serialized}`);
  else console.error(`\n[ERROR] Grupo principal não encontrado: "${config.grupoPrincipal}"`);
  if (adminChat) console.log(`\n👑 Grupo ADM:\nNome: ${adminChat.name}\nID: ${adminChat.id._serialized}`);
  else console.error(`\n[ERROR] Grupo ADM não encontrado: "${config.grupoAdm}"`);
  enabled = Boolean(mainChat && adminChat && mainChat.id._serialized !== adminChat.id._serialized);
  if (enabled) console.log('\n🟢 Sistema de moderação ativo.');
  else console.error('\n[ERROR] Moderação desativada. Corrija os nomes dos grupos e reinicie.');
}

function activateIfReady() {
  if (!enabled && mainChat && adminChat && mainChat.id._serialized !== adminChat.id._serialized) {
    enabled = true;
    console.log('\n[SUCCESS] Sistema de moderacao ativo.');
  }
}

async function learnGroupFromMessage(message) {
  let chat;
  try {
    chat = await message.getChat();
  } catch (error) {
    console.warn(`[WARNING] Nao foi possivel ler o grupo da mensagem: ${error.message}`);
    return null;
  }
  if (!chat?.isGroup) return chat;
  const id = chat.id?._serialized;
  if (id === config.grupoPrincipalId || (!mainChat && chat.name === config.grupoPrincipal)) {
    mainChat = chat;
    console.log(`\n[INFO] Grupo principal identificado por mensagem:\nNome: ${chat.name}\nID: ${id}`);
  }
  if (id === config.grupoAdmId || (!adminChat && chat.name === config.grupoAdm)) {
    adminChat = chat;
    console.log(`\n[INFO] Grupo ADM identificado por mensagem:\nNome: ${chat.name}\nID: ${id}`);
  }
  activateIfReady();
  return chat;
}

async function safeName(userId) {
  const { name } = await moderation.safeContact(userId);
  return name;
}

async function processMessage(message) {
  try {
    if (isDuplicate(message)) return;
    const chat = await learnGroupFromMessage(message);
    if (!enabled) return;
    const chatId = chat?.id?._serialized;
    if (!chat?.isGroup || chatId !== mainChat.id._serialized || chatId === adminChat.id._serialized) return;

    const userId = message.author || (message.fromMe ? client.info?.wid?._serialized : null);
    if (!userId) return;
    const actorIsGroupAdmin = isAdmin(chat, userId);
    const actorIsAdmin = await isAuthorizedNumber(client, userId, config.numerosAutorizados);
    const commandHandled = await handleCommand({
      message, client, config, settings, warnings, logger, moderation,
      isActorAdmin: actorIsAdmin,
      actorName: await safeName(userId)
    });
    if (commandHandled || message.fromMe || actorIsGroupAdmin) return;

    let warned = false;
    const onViolation = async (reason, source) => {
      if (warned) return;
      warned = true;
      const record = await moderation.warn({ userId, reason, automatic: true, source });
      const contact = await client.getContactById(userId).catch(() => null);
      const label = contact?.id?.user || userId.split('@')[0];
      await chat.sendMessage(`🚫 ${source === 'link' ? 'Link bloqueado.' : 'Spam detectado.'}\n\n👤 @${label}\n⚠️ ${reason}.\n📊 Advertências: ${record.warnings}/${config.maxWarnings}`, { mentions: contact ? [contact] : [] });
    };

    if (settings.antiLink) {
      await handleAntiLink({ message, userId, isUserAdmin: false, settings, onViolation, logger, dryRun: config.dryRun });
    }
    if (!warned && settings.antiSpam && antiSpam.register(userId)) {
      console.log(`[MODERATION] Spam detectado: ${userId}`);
      await onViolation('Spam / Flood', 'spam');
    }
  } catch (error) {
    console.error('[ERROR] Falha ao processar mensagem:', error);
    if (logger) await logger.logError('Falha ao processar mensagem', error);
  }
}

client.on('qr', (qr) => {
  console.log('[INFO] Escaneie o QR Code em WhatsApp > Aparelhos conectados > Conectar aparelho.');
  qrcode.generate(qr, { small: true });
});
client.on('authenticated', () => console.log('[INFO] Autenticação concluída.'));
client.on('auth_failure', (error) => console.error('[ERROR] Falha de autenticação:', error));
client.on('disconnected', (reason) => { whatsappConnected = false; enabled = false; console.error('[ERROR] WhatsApp desconectado:', reason); });
client.on('ready', async () => {
  whatsappConnected = true;
  try {
    console.log(`[INFO] Dados persistentes: ${dataDirectory}`);
    console.log(`[INFO] Sessão do WhatsApp: ${authDirectory}`);
    await initializeServices();
    await discoverGroups();
  }
  catch (error) {
    enabled = false;
    console.error('[ERROR] Falha na inicialização:', error.message);
    console.error('[INFO] A sessão continua salva. Reinicie com npm start; não é necessário apagar .wwebjs_auth.');
  }
});
client.on('message', processMessage);
client.on('message_create', processMessage);

process.on('unhandledRejection', (error) => console.error('[ERROR] Promise rejeitada:', error));
process.on('uncaughtException', (error) => console.error('[ERROR] Exceção não tratada:', error));

startHealthServer({
  getStatus: () => ({ ready: whatsappConnected && enabled, connected: whatsappConnected, enabled })
});

client.initialize().catch((error) => console.error('[ERROR] Não foi possível iniciar o cliente:', error));
