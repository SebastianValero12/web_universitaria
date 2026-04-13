// ============================================================
// ROLE MIDDLEWARE — Guardia de roles para rutas protegidas
// Universidad de Pamplona SIU
// ============================================================

const { forbidden } = require('../../utils/response');

/**
 * Factory que retorna un middleware verificador de roles
 * @param {...string} roles - Roles permitidos para la ruta
 * @returns {Function} Middleware de Express
 *
 * Uso:
 *   router.get('/ruta', authenticate, authorize('ADMIN', 'SUPERUSER'), controller.accion)
 */
function authorize(...roles) {
  return function(req, res, next) {
    if (!req.user) {
      return forbidden(res, 'No autenticado.');
    }

    if (!roles.includes(req.user.role)) {
      return forbidden(res,
        'No tienes permiso para esta acción. Rol requerido: ' + roles.join(' o ') + '.'
      );
    }

    next();
  };
}

module.exports = { authorize };
