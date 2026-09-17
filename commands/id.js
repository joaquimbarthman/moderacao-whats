'use strict';

module.exports = async ({ message }) => {
  const chatId = message.fromMe ? message.to : message.from;
  await message.reply(`ID deste grupo:\n${chatId}`);
};
