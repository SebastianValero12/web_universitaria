// ============================================================
// STUDENT CONTROLLER — Portal estudiantil
// Universidad de Pamplona SIU
// ============================================================

const StudentService = require('../../business/services/StudentService');
const R = require('../../utils/response');

const StudentController = {

  /** GET /api/v1/student/dashboard */
  async getDashboard(req, res) {
    try {
      const data = await StudentService.getDashboard(req.user.id);
      return R.ok(res, data);
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },

  /** GET /api/v1/student/schedule */
  async getSchedule(req, res) {
    try {
      const data = await StudentService.getSchedule(req.user.id);
      return R.ok(res, data);
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },

  /** GET /api/v1/student/grades */
  async getGrades(req, res) {
    try {
      const data = await StudentService.getGrades(req.user.id);
      return R.ok(res, data);
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },

  /** GET /api/v1/student/profile */
  async getProfile(req, res) {
    try {
      const data = await StudentService.getProfile(req.user.id);
      return R.ok(res, data);
    } catch (err) {
      return R.error(res, err.message, 'NOT_FOUND', err.status || 404);
    }
  },

  /** GET /api/v1/student/announcements */
  async getAnnouncements(req, res) {
    try {
      const data = await StudentService.getAnnouncements();
      return R.ok(res, data);
    } catch (err) {
      return R.serverError(res, err.message);
    }
  },
};

module.exports = StudentController;
