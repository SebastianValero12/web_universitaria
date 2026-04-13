// ============================================================
// AUTH CONTROLLER — Rutas de autenticación
// Universidad de Pamplona SIU
// ============================================================

const { validationResult } = require('express-validator');
const AuthService = require('../../business/services/AuthService');
const R = require('../../utils/response');

const AuthController = {

  /** POST /api/v1/auth/login/student */
  async loginStudent(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.validationError(res, errors.array());

    try {
      const { email, password } = req.body;
      const ip   = req.ip || req.headers['x-forwarded-for'];
      const result = await AuthService.login(email, password, ['STUDENT'], ip);
      return R.ok(res, result, 'Inicio de sesión exitoso.');
    } catch (err) {
      return R.error(res, err.message, 'AUTH_ERROR', err.status || 401);
    }
  },

  /** POST /api/v1/auth/login/admin */
  async loginAdmin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.validationError(res, errors.array());

    try {
      const { email, password } = req.body;
      const ip   = req.ip || req.headers['x-forwarded-for'];
      const result = await AuthService.login(email, password, ['TEACHER', 'ADMIN', 'SUPERUSER'], ip);
      return R.ok(res, result, 'Inicio de sesión exitoso.');
    } catch (err) {
      return R.error(res, err.message, 'AUTH_ERROR', err.status || 401);
    }
  },

  /** POST /api/v1/auth/logout */
  async logout(req, res) {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'];
      await AuthService.logout(req.user.id, ip);
      return R.ok(res, null, 'Sesión cerrada correctamente.');
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },

  /** GET /api/v1/auth/me */
  async getProfile(req, res) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      return R.ok(res, profile);
    } catch (err) {
      return R.error(res, err.message, 'NOT_FOUND', err.status || 404);
    }
  },
};

module.exports = AuthController;
