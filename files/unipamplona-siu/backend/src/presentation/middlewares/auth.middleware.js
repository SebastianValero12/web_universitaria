// ============================================================
// AUTH MIDDLEWARE — Verificar JWT y adjuntar req.user
// Universidad de Pamplona SIU
// ============================================================

const jwtUtil   = require('../../security/jwt');
const { unauthorized } = require('../../utils/response');
const { logger } = require('../../utils/logger');

/**
 * Middleware de autenticación
 * Verifica el Bearer token, adjunta el payload decodificado a req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token de acceso requerido. Inicia sesión para continuar.');
  }

  const token = authHeader.slice(7); // quitar "Bearer "

  try {
    const decoded = jwtUtil.verify(token);
    req.user = {
      id:    decoded.sub,
      email: decoded.email,
      role:  decoded.role,
      code:  decoded.code,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok:    false,
        error: 'Sesión expirada. Inicia sesión nuevamente.',
        code:  'TOKEN_EXPIRED',
      });
    }
    logger.warn('Token inválido: ' + err.message);
    return unauthorized(res, 'Token inválido. Inicia sesión nuevamente.');
  }
}

module.exports = { authenticate };
