// ============================================================
// MODELO DE DOMINIO: Student
// Universidad de Pamplona SIU
// ============================================================

'use strict';

/**
 * Crea un objeto de estudiante inmutable.
 * @param {object} data
 * @returns {Readonly<object>}
 */
function createStudent(data) {
  return Object.freeze({
    id:              data.id              ?? null,
    userId:          data.userId          ?? null,
    programId:       data.programId       ?? null,
    currentSemester: data.currentSemester ?? 1,
    enrollmentYear:  data.enrollmentYear  ?? new Date().getFullYear(),
    createdAt:       data.createdAt       ?? null,
    updatedAt:       data.updatedAt       ?? null,
  });
}

/**
 * Calcula el progreso del estudiante como porcentaje (0–100).
 * @param {number} creditsCompleted
 * @param {number} totalCredits
 * @returns {number}
 */
function calcProgress(creditsCompleted, totalCredits) {
  if (!totalCredits || totalCredits <= 0) return 0;
  const pct = (creditsCompleted / totalCredits) * 100;
  return Math.min(Math.round(pct), 100);
}

module.exports = { createStudent, calcProgress };
