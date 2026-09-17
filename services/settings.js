'use strict';

const path = require('node:path');
const JsonStore = require('../utils/jsonStore');

class Settings {
  constructor(config, file = path.join(__dirname, '..', 'data', 'settings.json')) {
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
