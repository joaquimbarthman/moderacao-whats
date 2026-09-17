'use strict';
const { targetFromMention, mentionLabel, reply } = require('./helpers');
module.exports = async ({ message, warnings, logger, actorName, config }) => {
  const target = await targetFromMention(message);
  if (!target) return message.reply(`Uso: ${config.prefixo}unwarn @usuário`);
  const before = warnings.get(target.id).warnings;
  const record = await warnings.remove(target.id);
  if (!before) return message.reply('Esse usuário não possui advertências.');
  await logger.logCommand(`unwarn ${target.id}`, actorName);
  return reply(message, `✅ Uma advertência de ${mentionLabel(target.contact)} foi removida.\n📊 Advertências: ${record.warnings}/${config.maxWarnings}`, [target.contact]);
};
