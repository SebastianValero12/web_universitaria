// ============================================================
// STUDENT ROUTES — /api/v1/student
// Universidad de Pamplona SIU
// ============================================================

const express           = require('express');
const StudentController = require('../controllers/StudentController');
const { authenticate }  = require('../middlewares/auth.middleware');
const { authorize }     = require('../middlewares/role.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación y rol STUDENT
router.use(authenticate, authorize('STUDENT'));

/** GET /api/v1/student/dashboard */
router.get('/dashboard', StudentController.getDashboard);

/** GET /api/v1/student/schedule */
router.get('/schedule', StudentController.getSchedule);

/** GET /api/v1/student/grades */
router.get('/grades', StudentController.getGrades);

/** GET /api/v1/student/profile */
router.get('/profile', StudentController.getProfile);

/** GET /api/v1/student/announcements */
router.get('/announcements', StudentController.getAnnouncements);

module.exports = router;
