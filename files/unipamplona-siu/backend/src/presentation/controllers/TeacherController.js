// ============================================================
// CONTROLADOR: Teacher
// Universidad de Pamplona SIU
// Endpoints para el rol TEACHER
// ============================================================

'use strict';

const { validationResult } = require('express-validator');
const TeacherService       = require('../../business/services/TeacherService');
const R                    = require('../../utils/response');

/**
 * GET /api/v1/teacher/dashboard
 * Resumen de grupos, estudiantes y calificaciones pendientes.
 */
async function getDashboard(req, res) {
  try {
    const data = await TeacherService.getDashboard(req.user.id);
    return R.ok(res, data);
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

/**
 * GET /api/v1/teacher/groups
 * Lista de grupos asignados al docente en el periodo activo.
 */
async function getGroups(req, res) {
  try {
    const groups = await TeacherService.getGroups(req.user.id);
    return R.ok(res, groups);
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

/**
 * GET /api/v1/teacher/groups/:id/students
 * Lista de estudiantes de un grupo (solo si el docente lo imparte).
 */
async function getGroupStudents(req, res) {
  try {
    const students = await TeacherService.getGroupStudents(
      parseInt(req.params.id),
      req.user.id
    );
    if (!students) return R.forbidden(res, 'No tienes acceso a este grupo.');
    return R.ok(res, students);
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

/**
 * PATCH /api/v1/teacher/grades/:id
 * Crea o actualiza la calificación de una inscripción.
 */
async function upsertGrade(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return R.validationError(res, errors.array());

  try {
    const { score, remarks } = req.body;

    if (score === undefined || score === null) {
      return R.error(res, 'La nota es requerida.');
    }

    const grade = await TeacherService.upsertGrade(
      parseInt(req.params.id),
      Number(score),
      remarks || null,
      {
        userId:   req.user.id,
        userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
        ip:       req.ip,
      }
    );

    if (!grade) return R.notFound(res, 'Inscripción no encontrada.');
    return R.ok(res, grade, 'Calificación guardada correctamente.');
  } catch (err) {
    return R.serverError(res, err.message);
  }
}

module.exports = { getDashboard, getGroups, getGroupStudents, upsertGrade };
