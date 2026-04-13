// ============================================================
// MODELO DE DOMINIO: Schedule
// Universidad de Pamplona SIU
// ============================================================

'use strict';

// Orden canónico de los días para ordenamiento de horarios
const DAY_ORDER = {
  MONDAY:    1,
  TUESDAY:   2,
  WEDNESDAY: 3,
  THURSDAY:  4,
  FRIDAY:    5,
  SATURDAY:  6,
  SUNDAY:    7,
};

// Etiquetas en español para los días
const DAY_LABELS = {
  MONDAY:    'Lunes',
  TUESDAY:   'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY:  'Jueves',
  FRIDAY:    'Viernes',
  SATURDAY:  'Sábado',
  SUNDAY:    'Domingo',
};

/**
 * Crea un objeto de horario inmutable.
 * @param {object} data
 * @returns {Readonly<object>}
 */
function createSchedule(data) {
  return Object.freeze({
    id:            data.id            ?? null,
    courseGroupId: data.courseGroupId ?? null,
    classroomId:   data.classroomId   ?? null,
    dayOfWeek:     data.dayOfWeek     ?? 'MONDAY',
    startTime:     data.startTime     ?? '08:00',
    endTime:       data.endTime       ?? '10:00',
    createdAt:     data.createdAt     ?? null,
  });
}

/**
 * Retorna el número de orden para un día.
 * @param {string} day - Valor del enum DayOfWeek
 * @returns {number}
 */
function dayOrder(day) {
  return DAY_ORDER[day] ?? 99;
}

/**
 * Retorna la etiqueta en español para un día.
 * @param {string} day
 * @returns {string}
 */
function dayLabel(day) {
  return DAY_LABELS[day] ?? day;
}

/**
 * Ordena un arreglo de schedules por día y hora de inicio.
 * @param {object[]} schedules
 * @returns {object[]}
 */
function sortSchedules(schedules) {
  return [...schedules].sort(function(a, b) {
    const dayDiff = dayOrder(a.dayOfWeek) - dayOrder(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}

module.exports = { createSchedule, dayOrder, dayLabel, sortSchedules, DAY_LABELS, DAY_ORDER };
