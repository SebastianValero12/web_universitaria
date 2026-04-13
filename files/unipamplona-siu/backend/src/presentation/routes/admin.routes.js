// ============================================================
// ADMIN ROUTES — /api/v1/admin
// Universidad de Pamplona SIU
// ============================================================

'use strict';

const express           = require('express');
const AdminController   = require('../controllers/AdminController');
const { authenticate }  = require('../middlewares/auth.middleware');
const { authorize }     = require('../middlewares/role.middleware');

const router = express.Router();

// Requiere ADMIN o SUPERUSER
router.use(authenticate, authorize('ADMIN', 'SUPERUSER'));

/** GET /api/v1/admin/dashboard */
router.get('/dashboard', AdminController.getDashboard);

/** GET /api/v1/admin/students */
router.get('/students', AdminController.getStudents);

/** GET /api/v1/admin/teachers */
router.get('/teachers', AdminController.getTeachers);

/** GET /api/v1/admin/course-groups */
router.get('/course-groups', AdminController.getCourseGroups);

module.exports = router;
