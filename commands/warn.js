'use strict';
const { targetFromMention, mentionLabel, reply } = require('./helpers');
module.exports = async (ctx) => {
  const { message, args, config, moderation, actorName } = ctx;
  const target = await targetFromMention(message);
  if (!target) return message.reply(`Uso: ${config.prefixo}warn @usuário motivo`);
  const reason = args.slice(1).join(' ').trim();
  if (!reason) return message.reply('Informe o motivo da advertência.');
  const record = await moderation.warn({ userId: target.id, reason, responsible: actorName, automatic: false });
  await reply(message, `⚠️ ${mentionLabel(target.contact)} recebeu uma advertência.\n📊 Advertências: ${record.warnings}/${config.maxWarnings}`, [target.contact]);
};
