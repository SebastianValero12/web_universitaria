// ============================================================
// STUDENT SERVICE — Lógica de negocio del portal estudiantil
// Universidad de Pamplona SIU
// ============================================================

const StudentRepository = require('../../persistence/repositories/StudentRepository');
const UserRepository    = require('../../persistence/repositories/UserRepository');
const prisma            = require('../../config/prisma');
const { DayOfWeekShort }= require('../../domain/enums/DayOfWeek');

const StudentService = {

  /** Dashboard completo del estudiante */
  async getDashboard(userId) {
    const [enrollments, progress, announcements] = await Promise.all([
      StudentRepository.getEnrollments(userId),
      StudentRepository.getProgress(userId),
      getActiveAnnouncements(),
    ]);

    // Construir stats
    const stats = {
      subjects:   enrollments.length,
      credits:    enrollments.reduce(function(s, e) { return s + (e.courseGroup.course.credits || 0); }, 0),
      average:    calcAverage(enrollments),
      attendance: '—',
    };

    // Construir horario
    const schedule = buildSchedule(enrollments);

    // Construir grades
    const grades = enrollments.map(function(enr) {
      const grade = enr.grades[0] || null;
      return {
        enrollmentId: enr.id,
        code:         enr.courseGroup.course.code,
        name:         enr.courseGroup.course.name,
        credits:      enr.courseGroup.course.credits,
        score:        grade ? Number(grade.score) : null,
        status:       enr.status,
      };
    });

    return { stats, schedule, grades, progress, announcements };
  },

  /** Obtener horario del estudiante */
  async getSchedule(userId) {
    const enrollments = await StudentRepository.getEnrollments(userId);
    return buildSchedule(enrollments);
  },

  /** Obtener calificaciones */
  async getGrades(userId) {
    return StudentRepository.getGrades(userId);
  },

  /** Obtener perfil del estudiante */
  async getProfile(userId) {
    const student = await StudentRepository.findByUserId(userId);
    if (!student) throw Object.assign(new Error('Perfil de estudiante no encontrado.'), { status: 404 });
    return student;
  },

  /** Obtener avisos activos */
  async getAnnouncements() {
    return getActiveAnnouncements();
  },
};

/* ── Helpers privados ──────────────────────────────────────── */

function calcAverage(enrollments) {
  const scores = enrollments
    .map(function(e) { return e.grades[0] ? parseFloat(e.grades[0].score) : null; })
    .filter(function(s) { return s !== null; });
  if (!scores.length) return '—';
  return (scores.reduce(function(a, b) { return a + b; }, 0) / scores.length).toFixed(1);
}

function buildSchedule(enrollments) {
  const schedule = [];
  const colorPalette = ['blue', 'red', 'green', 'amber', 'indigo', 'pink'];
  let colorIdx = 0;

  enrollments.forEach(function(enr) {
    const group = enr.courseGroup;
    const color = colorPalette[colorIdx % colorPalette.length];
    colorIdx++;

    group.schedules.forEach(function(sch) {
      schedule.push({
        day:        DayOfWeekShort[sch.dayOfWeek] || sch.dayOfWeek.slice(0, 3),
        startTime:  sch.startTime,
        endTime:    sch.endTime,
        courseName: group.course.name.length > 12
          ? group.course.code
          : group.course.name,
        room:       sch.classroomId ? 'Aula' : 'Por asignar',
        color:      color,
      });
    });
  });

  return schedule;
}

async function getActiveAnnouncements() {
  try {
    return prisma.announcement.findMany({
      where:   { isActive: true },
      orderBy: { createdAt: 'desc' },
      take:    10,
      select:  {
        id: true, title: true, body: true, priority: true, createdAt: true,
        author: { select: { firstName: true, lastName: true } },
      },
    });
  } catch (_) {
    return [];
  }
}

module.exports = StudentService;
