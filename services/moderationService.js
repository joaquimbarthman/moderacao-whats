'use strict';

const { findParticipant, isAdmin, isSelf } = require('../utils/permissions');

class ModerationService {
  constructor({ client, config, warnings, logger, getMainChat }) {
    Object.assign(this, { client, config, warnings, logger, getMainChat });
    this.locks = new Set();
  }

  async safeContact(userId) {
    let phoneId = userId;
    try {
      if (String(userId).endsWith('@lid')) {
        const mapping = await this.client.getContactLidAndPhone([userId]);
        if (mapping?.[0]?.pn) phoneId = mapping[0].pn;
      }
      const contact = await this.client.getContactById(phoneId);
      const candidates = [contact.pushname, contact.name, contact.shortName]
        .map((value) => String(value || '').trim())
        .filter((value) => value && value !== '.');
      return { contact, name: candidates[0] || phoneId.split('@')[0], phoneId };
    } catch (error) {
      console.error('[ERROR] Erro ao obter contato:', error.message);
      return { contact: null, name: phoneId.split('@')[0], phoneId };
    }
  }

  async warn({ userId, reason, responsible = null, automatic = true, source = 'warning' }) {
    const record = await this.warnings.add(userId, reason, responsible ? { responsavel: responsible } : {});
    const { name, phoneId } = await this.safeContact(userId);
    console.log(`[WARNING] ${name} agora possui ${record.warnings}/${this.config.maxWarnings}`);
    const data = { name, userId: phoneId, reason, warnings: record.warnings, maxWarnings: this.config.maxWarnings, responsible };
    await this.logger.logWarning(data);
    if (source === 'link') await this.logger.logLink(data);
    if (source === 'spam') await this.logger.logSpam(data);
    if (record.warnings >= this.config.maxWarnings) {
      await this.kick({ ...data, automatic });
    }
    return record;
  }

  async kick({ userId, reason, responsible = null, automatic = false, warnings = null, maxWarnings = this.config.maxWarnings }) {
    if (this.locks.has(userId)) return { ok: false, reason: 'Remoção já está em andamento' };
    this.locks.add(userId);
    let removed = false;
    try {
      const cachedChat = this.getMainChat();
      const chat = cachedChat?.id?._serialized
        ? await this.client.getChatById(cachedChat.id._serialized)
        : null;
      if (!chat?.isGroup) throw new Error('Grupo principal indisponível');
      if (!findParticipant(chat, userId)) throw new Error('Participante não pertence mais ao grupo');
      if (isAdmin(chat, userId)) throw new Error('Administradores não podem ser removidos');
      if (isSelf(this.client, userId)) throw new Error('A própria conta não pode ser removida');
      const ownId = this.client.info?.wid?._serialized;
      if (!ownId || !isAdmin(chat, ownId)) throw new Error('A conta conectada não possui permissão de administrador');
      const { name, phoneId } = await this.safeContact(userId);
      if (this.config.dryRun) console.log(`[DRY-RUN] ${name} seria removido.`);
      else { await chat.removeParticipants([userId]); removed = true; }
      await this.logger.logKick({ name, userId: phoneId, reason, warnings, maxWarnings, responsible, automatic, removed });
      return { ok: true, removed, dryRun: this.config.dryRun };
    } catch (error) {
      const { name, phoneId } = await this.safeContact(userId);
      await this.logger.logError(`Falha ao remover ${userId}`, error);
      await this.logger.logKick({ name, userId: phoneId, reason, warnings, maxWarnings, responsible, automatic, removed: false });
      return { ok: false, reason: error.message };
    } finally { this.locks.delete(userId); }
  }
}

module.exports = ModerationService;
