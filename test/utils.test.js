'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatPhone } = require('../utils/phone');
const { isAdmin, isSuperAdmin, isSelf, findParticipant, normalizeNumber, isAuthorizedNumber } = require('../utils/permissions');

test('formata números brasileiros e mantém fallback internacional', () => {
  assert.equal(formatPhone('5518999999999@c.us'), '+55 18 99999-9999');
  assert.equal(formatPhone('14155552671@c.us'), '+14155552671');
});
test('permissões usam IDs e flags do participante', () => {
  const chat = { participants: [{ id: { _serialized: 'admin@c.us' }, isAdmin: true, isSuperAdmin: false }, { id: { _serialized: 'owner@c.us' }, isSuperAdmin: true }] };
  assert.equal(isAdmin(chat, 'admin@c.us'), true);
  assert.equal(isAdmin(chat, 'owner@c.us'), true);
  assert.equal(isSuperAdmin(chat, 'owner@c.us'), true);
  assert.equal(findParticipant(chat, 'missing@c.us'), null);
  assert.equal(isSelf({ info: { wid: { _serialized: 'me@c.us' } } }, 'me@c.us'), true);
});
test('autorização administrativa compara números normalizados', async () => {
  assert.equal(normalizeNumber('+55 (18) 99999-9999'), '5518999999999');
  assert.equal(await isAuthorizedNumber({}, '5518999999999@c.us', ['+55 18 99999-9999']), true);
  assert.equal(await isAuthorizedNumber({}, '5518777777777@c.us', ['5518999999999']), false);
  assert.equal(await isAuthorizedNumber({}, '5518999999999@c.us', []), false);
});
