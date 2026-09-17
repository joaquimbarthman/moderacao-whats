'use strict';

function digitsFromId(id = '') {
  return String(id).split('@')[0].replace(/\D/g, '');
}

function formatPhone(id) {
  const digits = digitsFromId(id);
  if (!digits) return 'Número desconhecido';
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.slice(2, 4);
    const local = digits.slice(4);
    return local.length === 9
      ? `+55 ${ddd} ${local.slice(0, 5)}-${local.slice(5)}`
      : `+55 ${ddd} ${local.slice(0, 4)}-${local.slice(4)}`;
  }
  return `+${digits}`;
}

module.exports = { digitsFromId, formatPhone };
