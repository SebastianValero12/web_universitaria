// ============================================================
// MODELO DE DOMINIO: User
// Universidad de Pamplona SIU
// Representa los campos de un usuario sin dependencias de BD
// ============================================================

'use strict';

/**
 * Crea un objeto de usuario inmutable a partir de datos crudos.
 * @param {object} data
 * @returns {Readonly<object>}
 */
function createUser(data) {
  return Object.freeze({
    id:           data.id           ?? null,
    code:         data.code         ?? '',
    firstName:    data.firstName    ?? '',
    lastName:     data.lastName     ?? '',
    email:        data.email        ?? '',
    passwordHash: data.passwordHash ?? '',
    role:         data.role         ?? 'STUDENT',
    status:       data.status       ?? 'ACTIVE',
    lastLogin:    data.lastLogin    ?? null,
    createdAt:    data.createdAt    ?? null,
    updatedAt:    data.updatedAt    ?? null,
  });
}

/**
 * Retorna el nombre completo del usuario.
 * @param {{ firstName: string, lastName: string }} user
 * @returns {string}
 */
function fullName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

/**
 * Retorna una representación segura (sin hash) para enviar al cliente.
 * @param {object} user
 * @returns {object}
 */
function toPublic(user) {
  const { passwordHash, ...rest } = user;    // immutable spread
  void passwordHash;                          // marcar como usada para linters
  return Object.freeze(rest);
}

module.exports = { createUser, fullName, toPublic };
