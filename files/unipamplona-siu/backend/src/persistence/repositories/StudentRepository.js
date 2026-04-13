// ============================================================
// STUDENT REPOSITORY — Datos académicos del estudiante
// Universidad de Pamplona SIU
// ============================================================

const prisma = require('../../config/prisma');

const StudentRepository = {

  /** Obtener perfil completo del estudiante */
  async findByUserId(userId) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        user:    { select: { id: true, firstName: true, lastName: true, email: true, code: true } },
        program: { select: { id: true, name: true, code: true } },
      },
    });
  },

  /** Obtener inscripciones del estudiante con notas */
  async getEnrollments(userId) {
    return prisma.enrollment.findMany({
      where: {
        student: { userId },
        academicPeriod: { isActive: true },
      },
      orderBy: {
        courseGroup: {
          course: {
            code: 'asc',
          },
        },
      },
      include: {
        courseGroup: {
          include: {
            course:   { select: { id: true, name: true, code: true, credits: true } },
            teacher:  { include: { user: { select: { firstName: true, lastName: true } } } },
            schedules: {
              include: {
                classroom: { select: { name: true, code: true } },
              },
            },
          },
        },
        grades: true,
      },
    });
  },

  /** Obtener horario semanal */
  async getSchedule(userId) {
    const enrollments = await this.getEnrollments(userId);
    const schedule = [];

    enrollments.forEach(function(enr) {
      const group = enr.courseGroup;
      group.schedules.forEach(function(sch) {
        schedule.push({
          courseCode:  group.course.code,
          courseName:  group.course.name,
          day:         sch.dayOfWeek,
          startTime:   sch.startTime,
          endTime:     sch.endTime,
          room:        sch.classroom ? sch.classroom.name : 'Por asignar',
          groupCode:   group.groupCode,
        });
      });
    });

    return schedule;
  },

  /** Obtener notas del período activo */
  async getGrades(userId) {
    const enrollments = await this.getEnrollments(userId);
    return enrollments.map(function(enr) {
      const grade = enr.grades[0] || null;
      return {
        enrollmentId: enr.id,
        code:         enr.courseGroup.course.code,
        name:         enr.courseGroup.course.name,
        credits:      enr.courseGroup.course.credits,
        score:        grade ? grade.score : null,
        status:       enr.status,
      };
    });
  },

  /** Obtener progreso académico general */
  async getProgress(userId) {
    const student = await this.findByUserId(userId);
    if (!student) return null;

    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        student:  { userId },
        status:   'PASSED',
      },
      include: {
        courseGroup: { include: { course: { select: { credits: true } } } },
        grades:      true,
      },
    });

    const creditsCompleted = completedEnrollments.reduce(function(sum, enr) {
      return sum + (enr.courseGroup.course.credits || 0);
    }, 0);

    const allGrades = completedEnrollments
      .map(function(enr) { return enr.grades[0] ? parseFloat(enr.grades[0].score) : null; })
      .filter(function(g) { return g !== null; });

    const gpa = allGrades.length > 0
      ? (allGrades.reduce(function(a, b) { return a + b; }, 0) / allGrades.length).toFixed(2)
      : '0.00';

    return {
      creditsCompleted,
      creditsTotal:       student.program ? 160 : 160,
      semestersCompleted: student.currentSemester ? student.currentSemester - 1 : 0,
      semestersTotal:     10,
      gpa,
    };
  },
};

module.exports = StudentRepository;
