// ============================================================
// PASSWORD — Hashing y comparación con bcryptjs
// Universidad de Pamplona SIU
// ============================================================

const bcrypt   = require('bcryptjs');
const { env }  = require('../config/env');

const ROUNDS = env.BCRYPT_ROUNDS || 12;

/**
 * Hashea una contraseña en texto plano
 * @param {string} plainPassword - Contraseña en texto plano
 * @returns {Promise<string>} Hash bcrypt
 */
async function hash(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('La contraseña debe ser un texto no vacío.');
  }
  return bcrypt.hash(plainPassword, ROUNDS);
}

/**
 * Compara una contraseña en texto plano con un hash almacenado
 * @param {string} plainPassword - Contraseña ingresada por el usuario
 * @param {string} hashedPassword - Hash almacenado en la BD
 * @returns {Promise<boolean>} true si coinciden
 */
async function compare(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hash, compare };
