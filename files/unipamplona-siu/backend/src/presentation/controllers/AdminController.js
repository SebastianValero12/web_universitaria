// ============================================================
// CONTROLADOR: Admin
// Universidad de Pamplona SIU
// Endpoints para el rol ADMIN (y SUPERUSER con acceso admin)
// ============================================================

'use strict';

const AdminService = require('../../business/services/AdminService');
const R            = require('../../utils/response');

/**
 * GET /api/v1/admin/dashboard
 */
async function getDashboard(req, res) {
  try {
    const data = await AdminService.getDashboard();
    return R.ok(res, data);
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

/**
 * GET /api/v1/admin/students
 * ?page=1&limit=20&search=<texto>
 */
async function getStudents(req, res) {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || null;

    const { data, total } = await AdminService.getStudents({ page, limit, search });
    return R.paginated(res, data, total, page, limit);
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

/**
 * GET /api/v1/admin/teachers
 * ?page=1&limit=20&search=<texto>
 */
async function getTeachers(req, res) {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || null;

    const { data, total } = await AdminService.getTeachers({ page, limit, search });
    return R.paginated(res, data, total, page, limit);
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

/**
 * GET /api/v1/admin/course-groups
 * Grupos del periodo activo.
 */
async function getCourseGroups(req, res) {
  try {
    const groups = await AdminService.getCourseGroups();
    return R.ok(res, groups);
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

module.exports = { getDashboard, getStudents, getTeachers, getCourseGroups };
