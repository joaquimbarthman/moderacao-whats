'use strict';

const JsonStore = require('../utils/jsonStore');
const { dataFile } = require('../utils/storage');

class WarningStore {
  constructor(file = dataFile('warnings.json')) {
    this.store = new JsonStore(file, {});
  }
  async init() { await this.store.load(); return this; }
  get(userId) { return this.store.data[userId] || { userId, warnings: 0, motivos: [], ultimaAdvertencia: null }; }
  async add(userId, reason, metadata = {}) {
    const current = this.get(userId);
    const at = new Date().toISOString();
    const next = {
      userId, warnings: current.warnings + 1,
      motivos: [...current.motivos, { motivo: reason, data: at, ...metadata }],
      ultimaAdvertencia: at
    };
    this.store.data[userId] = next;
    await this.store.save();
    return next;
  }
  async remove(userId) {
    const current = this.get(userId);
    if (current.warnings === 0) return current;
    current.warnings -= 1;
    current.motivos = current.motivos.slice(0, current.warnings);
    current.ultimaAdvertencia = new Date().toISOString();
    this.store.data[userId] = current;
    await this.store.save();
    return current;
  }
}

module.exports = WarningStore;
