'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const WarningStore = require('../moderation/warnings');

test('persiste, recarrega e não gera valor negativo', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wa-mod-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'warnings.json');
  const first = await new WarningStore(file).init();
  await first.add('user@c.us', 'Spam');
  const second = await new WarningStore(file).init();
  assert.equal(second.get('user@c.us').warnings, 1);
  await second.remove('user@c.us');
  await second.remove('user@c.us');
  assert.equal(second.get('user@c.us').warnings, 0);
});
