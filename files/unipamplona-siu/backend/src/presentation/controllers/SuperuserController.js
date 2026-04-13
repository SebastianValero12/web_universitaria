// ============================================================
// SUPERUSER CONTROLLER — Gestión total del sistema
// Universidad de Pamplona SIU
// ============================================================

const { validationResult } = require('express-validator');
const SuperuserService = require('../../business/services/SuperuserService');
const R = require('../../utils/response');

const SuperuserController = {

  /** GET /api/v1/superuser/dashboard */
  async getDashboard(req, res) {
    try {
      const data = await SuperuserService.getDashboard();
      return R.ok(res, data);
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },

  /** GET /api/v1/superuser/users */
  async getUsers(req, res) {
    try {
      const { page, limit, role, status, search } = req.query;
      const result = await SuperuserService.getUsers({ page, limit, role, status, search });
      return R.paginated(res, result.users, result.total, result.page, result.limit);
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },

  /** GET /api/v1/superuser/users/:id */
  async getUser(req, res) {
    try {
      const user = await SuperuserService.getUser(req.params.id);
      return R.ok(res, user);
    } catch (err) {
      return R.error(res, err.message, 'NOT_FOUND', err.status || 404);
    }
  },

  /** POST /api/v1/superuser/users */
  async createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.validationError(res, errors.array());

    try {
      const ip   = req.ip || req.headers['x-forwarded-for'];
      const user = await SuperuserService.createUser(req.body, req.user.id, ip);
      return R.created(res, user, 'Usuario creado correctamente.');
    } catch (err) {
      return R.error(res, err.message, 'CREATE_ERROR', err.status || 400);
    }
  },

  /** PUT /api/v1/superuser/users/:id */
  async updateUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return R.validationError(res, errors.array());

    try {
      const ip   = req.ip || req.headers['x-forwarded-for'];
      const user = await SuperuserService.updateUser(req.params.id, req.body, req.user.id, ip);
      return R.ok(res, user, 'Usuario actualizado correctamente.');
    } catch (err) {
      return R.error(res, err.message, 'UPDATE_ERROR', err.status || 400);
    }
  },

  /** DELETE /api/v1/superuser/users/:id */
  async deleteUser(req, res) {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'];
      await SuperuserService.deleteUser(req.params.id, req.user.id, ip);
      return R.ok(res, null, 'Usuario eliminado correctamente.');
    } catch (err) {
      return R.error(res, err.message, 'DELETE_ERROR', err.status || 400);
    }
  },

  /** PATCH /api/v1/superuser/users/:id/toggle-status */
  async toggleStatus(req, res) {
    try {
      const ip   = req.ip || req.headers['x-forwarded-for'];
      const user = await SuperuserService.toggleStatus(req.params.id, req.user.id, ip);
      return R.ok(res, user, 'Estado del usuario actualizado.');
    } catch (err) {
      return R.error(res, err.message, 'STATUS_ERROR', err.status || 400);
    }
  },

  /** GET /api/v1/superuser/audit-logs */
  async getAuditLogs(req, res) {
    try {
      const { page, limit, userId, action } = req.query;
      const result = await SuperuserService.getAuditLogs({ page, limit, userId, action });
      return R.paginated(res, result.logs, result.total, result.page, result.limit);
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },
};

module.exports = SuperuserController;
