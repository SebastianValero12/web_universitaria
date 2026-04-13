// ============================================================
// TEACHER ROUTES — /api/v1/teacher
// Universidad de Pamplona SIU
// ============================================================

'use strict';

const express             = require('express');
const { body }            = require('express-validator');
const TeacherController   = require('../controllers/TeacherController');
const { authenticate }    = require('../middlewares/auth.middleware');
const { authorize }       = require('../middlewares/role.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación y rol TEACHER o ADMIN
router.use(authenticate, authorize('TEACHER', 'ADMIN'));

/** Validadores para actualizar calificación */
const gradeValidators = [
  body('score')
    .notEmpty().withMessage('La nota es requerida.')
    .isFloat({ min: 0, max: 5 }).withMessage('La nota debe estar entre 0.0 y 5.0.'),
  body('remarks')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('Las observaciones no pueden superar 255 caracteres.'),
];

/** GET /api/v1/teacher/dashboard */
router.get('/dashboard', TeacherController.getDashboard);

/** GET /api/v1/teacher/groups */
router.get('/groups', TeacherController.getGroups);

/** GET /api/v1/teacher/groups/:id/students */
router.get('/groups/:id/students', TeacherController.getGroupStudents);

/** PATCH /api/v1/teacher/grades/:id */
router.patch('/grades/:id', gradeValidators, TeacherController.upsertGrade);

module.exports = router;
