'use strict';

const JsonStore = require('../utils/jsonStore');
const { dataFile } = require('../utils/storage');

class Settings {
  constructor(config, file = dataFile('settings.json')) {
    this.store = new JsonStore(file, { antiLink: config.antiLink, antiSpam: config.antiSpam });
  }
  async init() { await this.store.load(); return this; }
  get antiLink() { return Boolean(this.store.data.antiLink); }
  get antiSpam() { return Boolean(this.store.data.antiSpam); }
  async set(key, value) {
    if (!['antiLink', 'antiSpam'].includes(key)) throw new Error('Configuração inválida');
    this.store.data[key] = Boolean(value);
    await this.store.save();
  }
}

module.exports = Settings;
