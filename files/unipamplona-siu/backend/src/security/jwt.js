// ============================================================
// JWT — Utilidades de firma y verificación de tokens
// Universidad de Pamplona SIU
// ============================================================

const jwt    = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Firma un payload y retorna el token JWT
 * @param {object} payload - Datos a incluir en el token
 * @returns {string} Token JWT firmado
 */
function sign(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '8h',
    issuer:    'unipamplona-siu',
    audience:  'siu-users',
  });
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {object} Payload decodificado
 * @throws {JsonWebTokenError|TokenExpiredError} Si el token es inválido o expiró
 */
function verify(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer:   'unipamplona-siu',
    audience: 'siu-users',
  });
}

/**
 * Decodifica sin verificar (para debug o extraer datos sin validar firma)
 * @param {string} token
 * @returns {object|null}
 */
function decode(token) {
  return jwt.decode(token);
}

module.exports = { sign, verify, decode };
