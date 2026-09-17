'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { containsLink } = require('../moderation/antiLink');

test('detecta links explícitos e domínios comuns', () => {
  for (const value of ['https://exemplo.com/x', 'www.site.net', 'chat.whatsapp.com/ABC', 'wa.me/5511', 'discord.gg/teste', 'youtube.com/video', 'exemplo.com']) {
    assert.equal(containsLink(value), true, value);
  }
});
test('não considera texto comum com ponto como link', () => {
  for (const value of ['Olá, tudo bem.', 'versão 1.2', 'Sr. João', 'arquivo.xyzabc']) assert.equal(containsLink(value), false, value);
});
