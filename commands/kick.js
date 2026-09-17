'use strict';
const { targetFromMention } = require('./helpers');
module.exports = async ({ message, args, config, moderation, actorName }) => {
  const target = await targetFromMention(message);
  if (!target) return message.reply(`Uso: ${config.prefixo}kick @usuário motivo`);
  const reason = args.slice(1).join(' ').trim();
  if (!reason) return message.reply('Informe o motivo da remoção.');
  const result = await moderation.kick({ userId: target.id, reason, responsible: actorName, automatic: false });
  if (!result.ok) return message.reply(`❌ Remoção não executada: ${result.reason}`);
  return message.reply(result.dryRun ? '🧪 DRY RUN — nenhuma remoção foi executada.' : '✅ Membro removido do grupo.');
};
