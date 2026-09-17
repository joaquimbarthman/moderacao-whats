'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const AntiSpam = require('../moderation/antiSpam');

test('conta por usuário e respeita cooldown', () => {
  const spam = new AntiSpam({ maxMensagens: 3, intervalo: 1000, cooldown: 2000 });
  assert.equal(spam.register('a', 0), false);
  assert.equal(spam.register('b', 1), false);
  assert.equal(spam.register('a', 2), false);
  assert.equal(spam.register('a', 3), true);
  assert.equal(spam.register('a', 4), false);
  assert.equal(spam.register('a', 5), false);
  assert.equal(spam.register('a', 6), false);
});
