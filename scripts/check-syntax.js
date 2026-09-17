'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const ignored = new Set(['node_modules', '.git', '.wwebjs_auth', '.wwebjs_cache']);

function jsFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? jsFiles(file) : entry.name.endsWith('.js') ? [file] : [];
  });
}

for (const file of jsFiles(root)) {
  const source = fs.readFileSync(file, 'utf8');
  new vm.Script(`(function (exports, require, module, __filename, __dirname) {\n${source}\n})`, { filename: file });
}
console.log('Sintaxe válida em todos os arquivos JavaScript.');
