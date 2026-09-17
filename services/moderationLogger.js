'use strict';

const { formatDate } = require('../utils/date');
const { formatPhone } = require('../utils/phone');

class ModerationLogger {
  constructor({ getAdminChat, timezone, dryRun }) {
    this.getAdminChat = getAdminChat;
    this.timezone = timezone;
    this.dryRun = dryRun;
  }

  async send(text, mentions = []) {
    try {
      const chat = this.getAdminChat();
      if (!chat) throw new Error('Grupo ADM indisponível');
      await chat.sendMessage(text, { mentions });
      return true;
    } catch (error) {
      console.error('[ERROR] Falha ao enviar log ao grupo ADM:', error.message);
      return false;
    }
  }

  async logWarning({ name, userId, reason, warnings, maxWarnings, responsible }) {
    return this.send(`⚠️ MODERAÇÃO — ADVERTÊNCIA\n\n👤 Usuário: ${name}\n📱 Número: ${formatPhone(userId)}\n⚠️ Motivo: ${reason}\n📊 Advertências: ${warnings}/${maxWarnings}${responsible ? `\n👑 Responsável: ${responsible}` : ''}\n🕐 Data: ${formatDate(new Date(), this.timezone)}`);
  }
  async logLink(data) { return this.send(`🚫 LINK BLOQUEADO\n\n👤 Usuário: ${data.name}\n📱 Número: ${formatPhone(data.userId)}\n📊 Advertências: ${data.warnings}/${data.maxWarnings}\n🕐 Data: ${formatDate(new Date(), this.timezone)}`); }
  async logSpam(data) { return this.send(`🚨 SPAM / FLOOD DETECTADO\n\n👤 Usuário: ${data.name}\n📱 Número: ${formatPhone(data.userId)}\n📊 Advertências: ${data.warnings}/${data.maxWarnings}\n🕐 Data: ${formatDate(new Date(), this.timezone)}`); }
  async logKick({ name, userId, reason, warnings, maxWarnings, responsible, automatic, removed }) {
    const dry = this.dryRun ? '\n\n🧪 DRY RUN — nenhuma remoção foi executada.' : '';
    return this.send(`🚨 MODERAÇÃO — ${removed ? 'MEMBRO REMOVIDO' : 'REMOÇÃO NÃO EXECUTADA'}\n\n👤 Usuário: ${name}\n📱 Número: ${formatPhone(userId)}\n⚠️ Motivo: ${reason}${warnings != null ? `\n📊 Advertências: ${warnings}/${maxWarnings}` : ''}\n👮 Ação: ${removed ? 'Removido do grupo' : this.dryRun ? 'Simulada' : 'Falhou'}${responsible ? `\n👑 Responsável: ${responsible}` : ''}\n🤖 Origem: ${automatic ? 'Moderação automática' : 'Comando administrativo'}\n🕐 Data: ${formatDate(new Date(), this.timezone)}${dry}`);
  }
  async logCommand(command, actor) { return this.send(`🛠️ COMANDO ADMINISTRATIVO\n\nComando: ${command}\nResponsável: ${actor}\n🕐 Data: ${formatDate(new Date(), this.timezone)}`); }
  async logError(context, error) {
    console.error(`[ERROR] ${context}:`, error?.message || error);
    return this.send(`❌ ERRO DE MODERAÇÃO\n\nContexto: ${context}\nErro: ${error?.message || String(error)}\n🕐 Data: ${formatDate(new Date(), this.timezone)}`);
  }
  async test() { return this.send(`🧪 TESTE DO SISTEMA DE MODERAÇÃO\n\n✅ Comunicação com o grupo de administradores funcionando.\n\n🕐 ${formatDate(new Date(), this.timezone)}`); }
}

module.exports = ModerationLogger;
