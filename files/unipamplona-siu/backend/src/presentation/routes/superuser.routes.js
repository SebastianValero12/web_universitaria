// ============================================================
// SUPERUSER ROUTES — /api/v1/superuser
// Universidad de Pamplona SIU
// ============================================================

const express              = require('express');
const { body }             = require('express-validator');
const SuperuserController  = require('../controllers/SuperuserController');
const { authenticate }     = require('../middlewares/auth.middleware');
const { authorize }        = require('../middlewares/role.middleware');

const router = express.Router();

// Todas las rutas requieren SUPERUSER
router.use(authenticate, authorize('SUPERUSER'));

// Validadores para crear/actualizar usuario
const userValidators = [
  body('firstName').trim().notEmpty().withMessage('El nombre es requerido.'),
  body('lastName').trim().notEmpty().withMessage('El apellido es requerido.'),
  body('email').trim().isEmail().withMessage('Ingresa un correo electrónico válido.').normalizeEmail(),
  body('role').isIn(['STUDENT', 'TEACHER', 'ADMIN', 'SUPERUSER']).withMessage('Rol inválido.'),
];

const createValidators = [
  ...userValidators,
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
];

/** GET /api/v1/superuser/dashboard */
router.get('/dashboard', SuperuserController.getDashboard);

/** GET /api/v1/superuser/users */
router.get('/users', SuperuserController.getUsers);

/** GET /api/v1/superuser/users/:id */
router.get('/users/:id', SuperuserController.getUser);

/** POST /api/v1/superuser/users */
router.post('/users', createValidators, SuperuserController.createUser);

/** PUT /api/v1/superuser/users/:id */
router.put('/users/:id', userValidators, SuperuserController.updateUser);

/** DELETE /api/v1/superuser/users/:id */
router.delete('/users/:id', SuperuserController.deleteUser);

/** PATCH /api/v1/superuser/users/:id/toggle-status */
router.patch('/users/:id/toggle-status', SuperuserController.toggleStatus);

/** GET /api/v1/superuser/audit-logs */
router.get('/audit-logs', SuperuserController.getAuditLogs);

module.exports = router;
