// ============================================================
// TEACHER REPOSITORY — Datos académicos del docente
// Universidad de Pamplona SIU
// ============================================================

const prisma = require('../../config/prisma');

const TeacherRepository = {

  /** Obtener perfil del docente */
  async findByUserId(userId) {
    return prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, code: true } },
        department: { select: { id: true, name: true } },
      },
    });
  },

  /** Obtener grupos asignados al docente en período activo */
  async getGroups(userId) {
    return prisma.courseGroup.findMany({
      where: {
        teacher: { userId },
        academicPeriod: { isActive: true },
      },
      include: {
        course:         { select: { id: true, name: true, code: true, credits: true } },
        schedules:      true,
        _count:         { select: { enrollments: true } },
      },
    });
  },

  /** Obtener estudiantes de un grupo */
  async getGroupStudents(groupId, teacherUserId) {
    // Verificar que el grupo pertenezca al docente
    const group = await prisma.courseGroup.findFirst({
      where: { id: groupId, teacher: { userId: teacherUserId } },
    });
    if (!group) return null;

    return prisma.enrollment.findMany({
      where:   { courseGroupId: groupId, status: { not: 'CANCELLED' } },
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, code: true } },
          },
        },
        grades: true,
      },
    });
  },

  /** Actualizar o crear calificación */
  async upsertGrade(enrollmentId, score, remarks) {
    // Verificar que la inscripción exista
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) return null;

    return prisma.grade.upsert({
      where:  { enrollmentId },
      update: { score: parseFloat(score), remarks, updatedAt: new Date() },
      create: {
        enrollmentId,
        score:    parseFloat(score),
        remarks:  remarks || null,
        gradedAt: new Date(),
      },
    });
  },
};

module.exports = TeacherRepository;
