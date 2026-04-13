// ============================================================
// MODELO DE DOMINIO: Admin
// Universidad de Pamplona SIU
// ============================================================

'use strict';

/**
 * Crea un objeto de administrador inmutable.
 * @param {object} data
 * @returns {Readonly<object>}
 */
function createAdmin(data) {
  return Object.freeze({
    id:        data.id        ?? null,
    userId:    data.userId    ?? null,
    position:  data.position  ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  });
}

module.exports = { createAdmin };
