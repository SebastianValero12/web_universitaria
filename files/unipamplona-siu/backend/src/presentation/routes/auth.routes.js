// ============================================================
// AUTH ROUTES — /api/v1/auth
// Universidad de Pamplona SIU
// ============================================================

const express        = require('express');
const { body }       = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validadores comunes
const loginValidators = [
  body('email')
    .trim()
    .isEmail().withMessage('Ingresa un correo electrónico válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
];

/** POST /api/v1/auth/login/student */
router.post('/login/student', loginValidators, AuthController.loginStudent);

/** POST /api/v1/auth/login/admin */
router.post('/login/admin', loginValidators, AuthController.loginAdmin);

/** POST /api/v1/auth/logout (requiere autenticación) */
router.post('/logout', authenticate, AuthController.logout);

/** GET /api/v1/auth/me (requiere autenticación) */
router.get('/me', authenticate, AuthController.getProfile);

module.exports = router;
