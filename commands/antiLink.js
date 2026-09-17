'use strict';
module.exports = async ({ message, args, settings, logger, actorName, config }) => {
  const value = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(value)) return message.reply(`Uso: ${config.prefixo}antilink on|off`);
  await settings.set('antiLink', value === 'on');
  await logger.logCommand(`antilink ${value}`, actorName);
  return message.reply(`🔗 Anti-Link ${value === 'on' ? 'ativado' : 'desativado'}.`);
};
