// ============================================================
// MODELO DE DOMINIO: CourseGroup
// Universidad de Pamplona SIU
// ============================================================

'use strict';

/**
 * Crea un objeto de grupo de curso inmutable.
 * @param {object} data
 * @returns {Readonly<object>}
 */
function createCourseGroup(data) {
  return Object.freeze({
    id:               data.id               ?? null,
    courseId:         data.courseId         ?? null,
    teacherId:        data.teacherId        ?? null,
    academicPeriodId: data.academicPeriodId ?? null,
    groupCode:        data.groupCode        ?? '',
    maxStudents:      data.maxStudents      ?? 35,
    isActive:         data.isActive         ?? true,
    createdAt:        data.createdAt        ?? null,
    updatedAt:        data.updatedAt        ?? null,
  });
}

/**
 * Determina si el grupo tiene cupo disponible.
 * @param {object} group  - Objeto con maxStudents
 * @param {number} enrolled - Número actual de inscritos
 * @returns {boolean}
 */
function hasCapacity(group, enrolled) {
  return enrolled < group.maxStudents;
}

module.exports = { createCourseGroup, hasCapacity };
