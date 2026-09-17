'use strict';
module.exports = async ({ message, isActorAdmin, config }) => {
  if (!isActorAdmin) return;
  const commands = `${config.prefixo}ping\n${config.prefixo}status\n${config.prefixo}warnings @usuário\n${config.prefixo}warn @usuário motivo\n${config.prefixo}unwarn @usuário\n${config.prefixo}kick @usuário motivo\n${config.prefixo}antilink on|off\n${config.prefixo}antispam on|off\n${config.prefixo}testelog\n${config.prefixo}id\n${config.prefixo}help`;
  await message.reply(`📖 COMANDOS ADMINISTRATIVOS\n\n${commands}`);
};
