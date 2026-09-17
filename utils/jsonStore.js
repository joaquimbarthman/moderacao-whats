'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

class JsonStore {
  constructor(file, defaults = {}) {
    this.file = file;
    this.defaults = defaults;
    this.data = structuredClone(defaults);
    this.writeQueue = Promise.resolve();
  }

  async load() {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    try {
      this.data = { ...structuredClone(this.defaults), ...JSON.parse(await fs.readFile(this.file, 'utf8')) };
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('[ERROR] Falha ao ler JSON:', this.file, error.message);
      await this.save();
    }
    return this.data;
  }

  async save() {
    const operation = this.writeQueue.catch(() => {}).then(async () => {
      const temp = `${this.file}.${process.pid}.tmp`;
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(temp, `${JSON.stringify(this.data, null, 2)}\n`, 'utf8');
      await fs.rename(temp, this.file);
    });
    this.writeQueue = operation.catch((error) => {
      console.error('[ERROR] Falha ao salvar JSON:', this.file, error.message);
    });
    return operation;
  }
}

module.exports = JsonStore;
