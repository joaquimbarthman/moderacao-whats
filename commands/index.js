'use strict';

const handlers = {
  ping: require('./ping'), status: require('./status'), help: require('./help'),
  warnings: require('./warnings'), warn: require('./warn'), unwarn: require('./unwarn'),
  kick: require('./kick'), antilink: require('./antiLink'), antispam: require('./antiSpam'),
  testelog: require('./testeLog'), id: require('./id')
};
const adminOnly = new Set(Object.keys(handlers));

async function handleCommand(context) {
  const body = context.message.body?.trim();
  if (!body?.startsWith(context.config.prefixo)) return false;
  const parts = body.slice(context.config.prefixo.length).trim().split(/\s+/);
  const command = parts.shift()?.toLowerCase();
  const handler = handlers[command];
  if (!handler) return false;
  if (adminOnly.has(command) && !context.isActorAdmin) {
    await context.message.reply('⛔ Comando permitido apenas para administradores.');
    return true;
  }
  await handler({ ...context, args: parts });
  return true;
}

module.exports = { handleCommand };
