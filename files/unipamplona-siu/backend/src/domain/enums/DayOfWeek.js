// ============================================================
// ENUM: Días de la semana para horarios académicos
// Universidad de Pamplona SIU
// ============================================================

const DayOfWeek = Object.freeze({
  MONDAY:    'MONDAY',
  TUESDAY:   'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY:  'THURSDAY',
  FRIDAY:    'FRIDAY',
  SATURDAY:  'SATURDAY',
  SUNDAY:    'SUNDAY',
});

// Mapeo a español
const DayOfWeekLabel = Object.freeze({
  MONDAY:    'Lunes',
  TUESDAY:   'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY:  'Jueves',
  FRIDAY:    'Viernes',
  SATURDAY:  'Sábado',
  SUNDAY:    'Domingo',
});

// Abreviaciones para el horario
const DayOfWeekShort = Object.freeze({
  MONDAY:    'LUN',
  TUESDAY:   'MAR',
  WEDNESDAY: 'MIÉ',
  THURSDAY:  'JUE',
  FRIDAY:    'VIE',
  SATURDAY:  'SÁB',
  SUNDAY:    'DOM',
});

module.exports = { DayOfWeek, DayOfWeekLabel, DayOfWeekShort };
