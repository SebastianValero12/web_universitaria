// ============================================================
// VALIDADORES: User
// Universidad de Pamplona SIU
// Reglas de validación para creación y actualización de usuarios
// ============================================================

'use strict';

const { body } = require('express-validator');

/** Campos base obligatorios para crear/actualizar */
const baseUserValidators = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('El nombre es requerido.')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres.'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('El apellido es requerido.')
    .isLength({ max: 100 }).withMessage('El apellido no puede superar los 100 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido.')
    .isEmail().withMessage('Ingresa un correo electrónico válido.')
    .normalizeEmail(),

  body('role')
    .notEmpty().withMessage('El rol es requerido.')
    .isIn(['STUDENT', 'TEACHER', 'ADMIN', 'SUPERUSER'])
    .withMessage('El rol debe ser STUDENT, TEACHER, ADMIN o SUPERUSER.'),
];

/** Validadores adicionales solo para creación (requiere contraseña) */
const createUserValidators = [
  ...baseUserValidators,

  body('password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/).withMessage('La contraseña debe incluir al menos una letra mayúscula.')
    .matches(/[0-9]/).withMessage('La contraseña debe incluir al menos un número.'),
];

/** Validadores para actualización (sin contraseña obligatoria) */
const updateUserValidators = [
  ...baseUserValidators,

  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres si se provee.'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Estado inválido.'),
];

module.exports = { baseUserValidators, createUserValidators, updateUserValidators };
