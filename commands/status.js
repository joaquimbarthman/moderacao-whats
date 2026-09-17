'use strict';
module.exports = async ({ message, settings, config }) => message.reply(`🛡️ STATUS DA MODERAÇÃO\n\n🔗 Anti-Link: ${settings.antiLink ? '✅ Ativado' : '❌ Desativado'}\n🚨 Anti-Spam: ${settings.antiSpam ? '✅ Ativado' : '❌ Desativado'}\n⚠️ Limite de warnings: ${config.maxWarnings}\n🤖 Bot: Online${config.dryRun ? '\n🧪 DRY RUN: Ativado' : ''}`);
