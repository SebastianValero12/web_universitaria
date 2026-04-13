// ============================================================
// VALIDADORES: Auth
// Universidad de Pamplona SIU
// Reglas de validación para rutas de autenticación
// ============================================================

'use strict';

const { body } = require('express-validator');

/**
 * Validadores para el endpoint POST /auth/login/student
 * y POST /auth/login/admin
 */
const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido.')
    .isEmail().withMessage('Ingresa un correo electrónico válido.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
];

module.exports = { loginValidators };
