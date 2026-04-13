// ============================================================
// RESPONSE HELPERS — Respuestas estándar de la API
// Universidad de Pamplona SIU
// ============================================================

function ok(res, data, message, statusCode) {
  return res.status(statusCode || 200).json({
    ok:      true,
    data:    data,
    message: message || 'Operación exitosa',
  });
}

function created(res, data, message) {
  return ok(res, data, message || 'Recurso creado exitosamente', 201);
}

function error(res, message, code, statusCode) {
  return res.status(statusCode || 400).json({
    ok:    false,
    error: message,
    code:  code || 'ERROR',
  });
}

function notFound(res, message) {
  return error(res, message || 'Recurso no encontrado', 'NOT_FOUND', 404);
}

function unauthorized(res, message) {
  return error(res, message || 'No autorizado. Inicia sesión para continuar.', 'UNAUTHORIZED', 401);
}

function forbidden(res, message) {
  return error(res, message || 'Acceso denegado. No tienes permiso para esta acción.', 'FORBIDDEN', 403);
}

function serverError(res, message) {
  return error(res, message || 'Error interno del servidor.', 'SERVER_ERROR', 500);
}

function validationError(res, errors) {
  return res.status(422).json({
    ok:     false,
    error:  'Error de validación.',
    code:   'VALIDATION_ERROR',
    errors: errors,
  });
}

function paginated(res, data, total, page, limit, message) {
  return res.status(200).json({
    ok:   true,
    data: data,
    meta: {
      total: total,
      page:  page,
      limit: limit,
      pages: Math.ceil(total / limit),
    },
    message: message || 'Operación exitosa',
  });
}

module.exports = {
  ok,
  created,
  error,
  notFound,
  unauthorized,
  forbidden,
  serverError,
  validationError,
  paginated,
};
