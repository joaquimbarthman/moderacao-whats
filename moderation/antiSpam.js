'use strict';

class AntiSpam {
  constructor(options) {
    this.maxMensagens = options.maxMensagens;
    this.intervalo = options.intervalo;
    this.cooldown = options.cooldown || 10000;
    this.users = new Map();
  }

  register(userId, now = Date.now()) {
    const state = this.users.get(userId) || { timestamps: [], cooldownUntil: 0 };
    state.timestamps = state.timestamps.filter((time) => now - time <= this.intervalo);
    state.timestamps.push(now);
    const triggered = state.timestamps.length >= this.maxMensagens && now >= state.cooldownUntil;
    if (triggered) {
      state.cooldownUntil = now + this.cooldown;
      state.timestamps = [];
    }
    this.users.set(userId, state);
    return triggered;
  }

  cleanup(now = Date.now()) {
    for (const [id, state] of this.users) {
      const last = state.timestamps.at(-1) || 0;
      if (now > state.cooldownUntil && now - last > this.intervalo) this.users.delete(id);
    }
  }

  clear() { this.users.clear(); }
}

module.exports = AntiSpam;
