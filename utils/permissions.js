'use strict';

function participantId(participant) {
  return participant?.id?._serialized || participant?.id || '';
}

function findParticipant(chat, userId) {
  return chat?.participants?.find((p) => participantId(p) === userId) || null;
}

function isAdmin(chat, userId) {
  const participant = findParticipant(chat, userId);
  return Boolean(participant && (participant.isAdmin || participant.isSuperAdmin));
}

function isSuperAdmin(chat, userId) {
  return Boolean(findParticipant(chat, userId)?.isSuperAdmin);
}

function isSelf(client, userId) {
  const ownId = client?.info?.wid?._serialized;
  return Boolean(ownId && ownId === userId);
}

function getActorId(message) {
  if (message.fromMe) return message.client?.info?.wid?._serialized || null;
  return message.author || null;
}

function normalizeNumber(value = '') {
  return String(value).replace(/\D/g, '');
}

async function isAuthorizedNumber(client, userId, allowedNumbers = []) {
  const allowed = new Set(allowedNumbers.map(normalizeNumber).filter(Boolean));
  if (!allowed.size || !userId) return false;
  const direct = normalizeNumber(String(userId).split('@')[0]);
  if (allowed.has(direct)) return true;
  if (!String(userId).endsWith('@lid')) return false;
  try {
    const result = await client.getContactLidAndPhone([userId]);
    const phone = normalizeNumber(result?.[0]?.pn?.split('@')[0]);
    return allowed.has(phone);
  } catch (error) {
    console.error('[ERROR] Não foi possível validar o número autorizado:', error.message);
    return false;
  }
}

module.exports = { participantId, findParticipant, isAdmin, isSuperAdmin, isSelf, getActorId, normalizeNumber, isAuthorizedNumber };
