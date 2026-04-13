// ============================================================
// MODELO DE DOMINIO: Teacher
// Universidad de Pamplona SIU
// ============================================================

'use strict';

/**
 * Crea un objeto de docente inmutable.
 * @param {object} data
 * @returns {Readonly<object>}
 */
function createTeacher(data) {
  return Object.freeze({
    id:             data.id             ?? null,
    userId:         data.userId         ?? null,
    departmentId:   data.departmentId   ?? null,
    title:          data.title          ?? null,
    specialization: data.specialization ?? null,
    createdAt:      data.createdAt      ?? null,
    updatedAt:      data.updatedAt      ?? null,
  });
}

/**
 * Retorna el nombre con título si está disponible.
 * @param {{ title: string|null, firstName: string, lastName: string }} teacher
 * @returns {string}
 */
function displayName(teacher) {
  const base = `${teacher.firstName} ${teacher.lastName}`.trim();
  return teacher.title ? `${teacher.title} ${base}` : base;
}

module.exports = { createTeacher, displayName };
