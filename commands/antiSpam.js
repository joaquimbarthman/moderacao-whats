'use strict';
module.exports = async ({ message, args, settings, logger, actorName, config }) => {
  const value = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(value)) return message.reply(`Uso: ${config.prefixo}antispam on|off`);
  await settings.set('antiSpam', value === 'on');
  await logger.logCommand(`antispam ${value}`, actorName);
  return message.reply(`🚨 Anti-Spam ${value === 'on' ? 'ativado' : 'desativado'}.`);
};
