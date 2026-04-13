// ============================================================
// SERVICIO: Teacher
// Universidad de Pamplona SIU
// Lógica de negocio para el rol TEACHER
// ============================================================

'use strict';

const TeacherRepository = require('../../persistence/repositories/TeacherRepository');
const AuditRepository   = require('../../persistence/repositories/AuditRepository');

/**
 * Retorna el resumen del dashboard del docente.
 * @param {number} userId
 * @returns {Promise<object>}
 */
async function getDashboard(userId) {
  const groups       = await TeacherRepository.getGroups(userId);
  const studentCount = groups.reduce(function(sum, g) {
    return sum + (g._count ? g._count.enrollments : 0);
  }, 0);

  return {
    stats: {
      groups:        groups.length,
      students:      studentCount,
      gradesPending: 0,
      avgScore:      '—',
    },
    groups: groups.map(function(g) {
      return {
        id:           g.id,
        code:         g.groupCode,
        courseName:   g.course ? g.course.name : '',
        courseCode:   g.course ? g.course.code : '',
        studentCount: g._count ? g._count.enrollments : 0,
      };
    }),
  };
}

/**
 * Retorna los grupos asignados al docente.
 * @param {number} userId
 * @returns {Promise<object[]>}
 */
async function getGroups(userId) {
  return TeacherRepository.getGroups(userId);
}

/**
 * Retorna los estudiantes de un grupo (solo si el docente lo imparte).
 * @param {number} groupId
 * @param {number} userId
 * @returns {Promise<object[]|null>}
 */
async function getGroupStudents(groupId, userId) {
  const enrollments = await TeacherRepository.getGroupStudents(groupId, userId);
  if (!enrollments) return null;

  return enrollments.map(function(enr) {
    return {
      enrollmentId: enr.id,
      id:           enr.student.id,
      code:         enr.student.user.code,
      firstName:    enr.student.user.firstName,
      lastName:     enr.student.user.lastName,
      email:        enr.student.user.email,
      score:        enr.grades[0] ? Number(enr.grades[0].score) : null,
      remarks:      enr.grades[0] ? enr.grades[0].remarks      : null,
    };
  });
}

/**
 * Guarda o actualiza la calificación de una inscripción.
 * @param {number} enrollmentId
 * @param {number} score        - 0.0 a 5.0
 * @param {string|null} remarks
 * @param {object} actorInfo    - { userId, userName, ip }
 * @returns {Promise<object|null>}
 */
async function upsertGrade(enrollmentId, score, remarks, actorInfo) {
  if (score < 0 || score > 5) {
    throw new Error('La nota debe estar entre 0.0 y 5.0.');
  }

  const grade = await TeacherRepository.upsertGrade(enrollmentId, score, remarks);
  if (!grade) return null;

  await AuditRepository.log({
    userId:   actorInfo.userId,
    userName: actorInfo.userName,
    action:   'UPDATE',
    entity:   'Grade',
    entityId: String(grade.id),
    detail:   `Calificación actualizada para inscripción #${enrollmentId}: ${score}`,
    ip:       actorInfo.ip,
  });

  return grade;
}

module.exports = { getDashboard, getGroups, getGroupStudents, upsertGrade };
