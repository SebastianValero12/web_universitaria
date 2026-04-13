// ============================================================
// SERVICIO: Admin
// Universidad de Pamplona SIU
// Lógica de negocio para el rol ADMIN
// ============================================================

'use strict';

const prisma            = require('../../config/prisma');
const AuditRepository   = require('../../persistence/repositories/AuditRepository');

/**
 * Retorna estadísticas generales para el dashboard del admin.
 * @returns {Promise<object>}
 */
async function getDashboard() {
  const [students, teachers, activeGroups, activePeriod] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'TEACHER', status: 'ACTIVE' } }),
    prisma.courseGroup.count({ where: { academicPeriod: { isActive: true } } }),
    prisma.academicPeriod.findFirst({ where: { isActive: true } }),
  ]);

  return {
    stats: {
      students,
      teachers,
      activeGroups,
      period: activePeriod ? activePeriod.label : 'Sin periodo activo',
    },
  };
}

/**
 * Retorna listado paginado de estudiantes con búsqueda opcional.
 * @param {object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} [params.search]
 * @returns {Promise<{ data: object[], total: number }>}
 */
async function getStudents({ page = 1, limit = 20, search }) {
  const skip  = (page - 1) * limit;
  const where = { role: 'STUDENT' };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
      { email:     { contains: search, mode: 'insensitive' } },
      { code:      { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        code:      true,
        firstName: true,
        lastName:  true,
        email:     true,
        status:    true,
        createdAt: true,
        student: {
          select: {
            currentSemester: true,
            enrollmentYear:  true,
            program: { select: { name: true } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, total };
}

/**
 * Retorna listado paginado de docentes con búsqueda opcional.
 * @param {object} params
 * @returns {Promise<{ data: object[], total: number }>}
 */
async function getTeachers({ page = 1, limit = 20, search }) {
  const skip  = (page - 1) * limit;
  const where = { role: 'TEACHER' };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
      { email:     { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        code:      true,
        firstName: true,
        lastName:  true,
        email:     true,
        status:    true,
        teacher: {
          select: {
            title:          true,
            specialization: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, total };
}

/**
 * Retorna los grupos del periodo activo con sus docentes e inscritos.
 * @returns {Promise<object[]>}
 */
async function getCourseGroups() {
  return prisma.courseGroup.findMany({
    where: { academicPeriod: { isActive: true } },
    include: {
      course:  { select: { name: true, code: true, credits: true } },
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      _count:  { select: { enrollments: true } },
    },
    orderBy: { course: { name: 'asc' } },
  });
}

/**
 * Registra una acción administrativa en el log de auditoría.
 * @param {object} actorInfo
 * @param {string} action
 * @param {string} detail
 */
async function logAdminAction(actorInfo, action, detail) {
  await AuditRepository.log({
    userId:   actorInfo.userId,
    userName: actorInfo.userName,
    action,
    entity:   'Admin',
    detail,
    ip:       actorInfo.ip,
  });
}

module.exports = { getDashboard, getStudents, getTeachers, getCourseGroups, logAdminAction };
