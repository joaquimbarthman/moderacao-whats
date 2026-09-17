'use strict';

const EXPLICIT_URL = /\b(?:https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/)[^\s<>]+/iu;
const DOMAIN_URL = /(?:^|[\s(])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|gg|co|me|app|dev|info|biz|tv|br)(?::\d{2,5})?(?:\/[\w\-./?%&=+#~]*)?(?=$|[\s),.!?])/iu;

function containsLink(text) {
  if (typeof text !== 'string' || !text.trim()) return false;
  return EXPLICIT_URL.test(text) || DOMAIN_URL.test(text);
}

async function handleAntiLink({ message, userId, isUserAdmin, settings, onViolation, logger, dryRun }) {
  if (!settings.antiLink || isUserAdmin || !containsLink(message.body)) return false;
  console.log(`[MODERATION] Link detectado: ${userId}`);
  if (dryRun) console.log(`[DRY-RUN] Mensagem com link não foi apagada: ${userId}`);
  else {
    try { await message.delete(true); }
    catch (error) { await logger.logError('Não foi possível apagar mensagem com link', error); }
  }
  await onViolation('Link não permitido', 'link');
  return true;
}

module.exports = { containsLink, handleAntiLink };
