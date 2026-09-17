'use strict';

async function targetFromMention(message) {
  const mentions = await message.getMentions();
  const contact = mentions[0];
  return contact ? { id: contact.id._serialized, contact, name: contact.pushname || contact.name || contact.id.user } : null;
}

function mentionLabel(contact, fallback = 'usuário') {
  return `@${contact?.id?.user || fallback}`;
}

async function reply(message, text, mentions = []) {
  return message.reply(text, undefined, { mentions });
}

module.exports = { targetFromMention, mentionLabel, reply };
