'use strict';
const { targetFromMention, mentionLabel, reply } = require('./helpers');
module.exports = async ({ message, warnings, config }) => {
  const target = await targetFromMention(message);
  if (!target) return message.reply(`Uso: ${config.prefixo}warnings @usuário`);
  const record = warnings.get(target.id);
  const reasons = record.motivos.length ? record.motivos.map((item) => `• ${item.motivo || item}`).join('\n') : '• Nenhuma';
  return reply(message, `⚠️ ADVERTÊNCIAS\n\n👤 ${mentionLabel(target.contact)}\n📊 ${record.warnings}/${config.maxWarnings} advertências\n\nMotivos:\n${reasons}`, [target.contact]);
};
