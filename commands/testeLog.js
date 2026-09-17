'use strict';
module.exports = async ({ message, logger }) => {
  const ok = await logger.test();
  return message.reply(ok ? '✅ Log de teste enviado.' : '❌ Não foi possível enviar o log de teste.');
};
