// ============================================================
// SEED.JS — Datos iniciales del sistema SIU Unipamplona
// Ejecutar con: node database/prisma/seed.js
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({ log: ['warn', 'error'] });
const ROUNDS = 12;

async function main() {
  console.log('\n🏫 Iniciando seed de la Universidad de Pamplona SIU...\n');

  // ── 1. Facultades ───────────────────────────────────────────
  console.log('📚 Creando facultades...');
  const [facIngenieria, facCiencias] = await Promise.all([
    prisma.faculty.upsert({
      where:  { code: 'FING' },
      update: {},
      create: { name: 'Facultad de Ingenierías y Arquitectura', code: 'FING' },
    }),
    prisma.faculty.upsert({
      where:  { code: 'FCIE' },
      update: {},
      create: { name: 'Facultad de Ciencias Básicas', code: 'FCIE' },
    }),
  ]);

  // ── 2. Departamentos ────────────────────────────────────────
  console.log('🏢 Creando departamentos...');
  const [depSistemas, depMatematicas, depFisica, depEconomicas] = await Promise.all([
    prisma.department.upsert({
      where:  { code: 'DSIS' },
      update: {},
      create: { name: 'Departamento de Ingeniería de Sistemas', code: 'DSIS', facultyId: facIngenieria.id },
    }),
    prisma.department.upsert({
      where:  { code: 'DMAT' },
      update: {},
      create: { name: 'Departamento de Matemáticas', code: 'DMAT', facultyId: facCiencias.id },
    }),
    prisma.department.upsert({
      where:  { code: 'DFIS' },
      update: {},
      create: { name: 'Departamento de Física', code: 'DFIS', facultyId: facCiencias.id },
    }),
    prisma.department.upsert({
      where:  { code: 'DECO' },
      update: {},
      create: { name: 'Departamento de Ciencias Económicas', code: 'DECO', facultyId: facCiencias.id },
    }),
  ]);

  // ── 3. Programas ────────────────────────────────────────────
  console.log('🎓 Creando programas académicos...');
  const [progSistemas, progMatematicas, progFisica, progAdmin] = await Promise.all([
    prisma.program.upsert({
      where:  { code: 'SIS' },
      update: {},
      create: { name: 'Ingeniería de Sistemas', code: 'SIS', departmentId: depSistemas.id, totalCredits: 168 },
    }),
    prisma.program.upsert({
      where:  { code: 'MAT' },
      update: {},
      create: { name: 'Matemáticas', code: 'MAT', departmentId: depMatematicas.id, totalCredits: 160 },
    }),
    prisma.program.upsert({
      where:  { code: 'FIS' },
      update: {},
      create: { name: 'Física', code: 'FIS', departmentId: depFisica.id, totalCredits: 160 },
    }),
    prisma.program.upsert({
      where:  { code: 'ADM' },
      update: {},
      create: { name: 'Administración de Empresas', code: 'ADM', departmentId: depEconomicas.id, totalCredits: 150 },
    }),
  ]);

  // ── 4. Período académico activo ─────────────────────────────
  console.log('📅 Creando período académico 2025-I...');
  const period = await prisma.academicPeriod.upsert({
    where:  { year_semester: { year: 2025, semester: 'FIRST' } },
    update: { isActive: true },
    create: {
      year:      2025,
      semester:  'FIRST',
      label:     '2025-I',
      startDate: new Date('2025-02-03'),
      endDate:   new Date('2025-06-20'),
      isActive:  true,
    },
  });

  // ── 5. Edificios y aulas ────────────────────────────────────
  console.log('🏛️  Creando edificios y aulas...');
  const buildA = await prisma.building.upsert({
    where: { code: 'BLQA' }, update: {},
    create: { name: 'Bloque A — Ingenierías', code: 'BLQA', location: 'Ciudadela Universitaria, sector norte' },
  });
  const buildB = await prisma.building.upsert({
    where: { code: 'BLQB' }, update: {},
    create: { name: 'Bloque B — Ciencias', code: 'BLQB', location: 'Ciudadela Universitaria, sector sur' },
  });

  const classrooms = await Promise.all([
    prisma.classroom.upsert({ where: { code: 'A201' }, update: {}, create: { name: 'Aula 201', code: 'A201', buildingId: buildA.id, capacity: 35 } }),
    prisma.classroom.upsert({ where: { code: 'A202' }, update: {}, create: { name: 'Aula 202', code: 'A202', buildingId: buildA.id, capacity: 35 } }),
    prisma.classroom.upsert({ where: { code: 'B105' }, update: {}, create: { name: 'Aula 105', code: 'B105', buildingId: buildB.id, capacity: 40 } }),
    prisma.classroom.upsert({ where: { code: 'LABC' }, update: {}, create: { name: 'Lab. Computación', code: 'LABC', buildingId: buildA.id, capacity: 30, type: 'LABORATORIO' } }),
    prisma.classroom.upsert({ where: { code: 'LABF' }, update: {}, create: { name: 'Lab. Física', code: 'LABF', buildingId: buildB.id, capacity: 25, type: 'LABORATORIO' } }),
    prisma.classroom.upsert({ where: { code: 'C301' }, update: {}, create: { name: 'Aula 301', code: 'C301', buildingId: buildB.id, capacity: 45 } }),
  ]);

  // ── 6. Cursos ───────────────────────────────────────────────
  console.log('📖 Creando cursos...');
  const courses = {};
  const courseData = [
    { code: 'MAT101', name: 'Cálculo Diferencial e Integral', credits: 4 },
    { code: 'MAT201', name: 'Álgebra Lineal',                  credits: 3 },
    { code: 'SIS101', name: 'Programación I',                  credits: 3 },
    { code: 'SIS201', name: 'Programación II',                 credits: 3 },
    { code: 'SIS301', name: 'Bases de Datos I',                credits: 3 },
    { code: 'HUM101', name: 'Humanidades y Ética',             credits: 2 },
    { code: 'ING101', name: 'Inglés Técnico I',                credits: 2 },
    { code: 'FIS101', name: 'Física I',                        credits: 4 },
    { code: 'CAL101', name: 'Cálculo Vectorial',               credits: 4 },
  ];

  for (const c of courseData) {
    courses[c.code] = await prisma.course.upsert({
      where: { code: c.code }, update: {},
      create: { code: c.code, name: c.name, credits: c.credits },
    });
  }

  // ── 7. Superusuario ─────────────────────────────────────────
  console.log('👑 Creando superusuario...');
  const superHash = await bcrypt.hash('Super@2025', ROUNDS);
  const superUser = await prisma.user.upsert({
    where:  { email: 'superadmin@unipamplona.edu.co' },
    update: {},
    create: {
      code:         'SA001',
      firstName:    'Super',
      lastName:     'Admin',
      email:        'superadmin@unipamplona.edu.co',
      passwordHash: superHash,
      role:         'SUPERUSER',
      status:       'ACTIVE',
    },
  });

  // ── 8. Docentes ─────────────────────────────────────────────
  console.log('👨‍🏫 Creando docentes...');
  const teacherHash = await bcrypt.hash('Docente@2025', ROUNDS);

  const teachersData = [
    { code: 'T001', firstName: 'Juan',  lastName: 'Pérez González',  email: 'jperez@unipamplona.edu.co',      title: 'Mag.' },
    { code: 'T002', firstName: 'María', lastName: 'Martínez Díaz',   email: 'mmartinez@unipamplona.edu.co',   title: 'Dr.' },
    { code: 'T003', firstName: 'Luis',  lastName: 'Gómez Rueda',     email: 'lgomez@unipamplona.edu.co',      title: 'Mag.' },
  ];

  const teachers = {};
  for (const td of teachersData) {
    const user = await prisma.user.upsert({
      where: { email: td.email }, update: {},
      create: {
        code:         td.code,
        firstName:    td.firstName,
        lastName:     td.lastName,
        email:        td.email,
        passwordHash: teacherHash,
        role:         'TEACHER',
        status:       'ACTIVE',
      },
    });
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id }, update: {},
      create: {
        userId:       user.id,
        departmentId: depSistemas.id,
        title:        td.title,
      },
    });
    teachers[td.code] = teacher;
  }

  // ── 9. Administrador ────────────────────────────────────────
  console.log('🗂️  Creando administrador...');
  const adminHash = await bcrypt.hash('Admin@2025', ROUNDS);
  const adminUser = await prisma.user.upsert({
    where:  { email: 'secretaria@unipamplona.edu.co' },
    update: {},
    create: {
      code:         'ADM001',
      firstName:    'Secretaria',
      lastName:     'Académica',
      email:        'secretaria@unipamplona.edu.co',
      passwordHash: adminHash,
      role:         'ADMIN',
      status:       'ACTIVE',
    },
  });
  await prisma.admin.upsert({
    where: { userId: adminUser.id }, update: {},
    create: { userId: adminUser.id, position: 'Secretaria Académica' },
  });

  // ── 10. Estudiantes ─────────────────────────────────────────
  console.log('🎒 Creando estudiantes...');
  const studentHash = await bcrypt.hash('Estudiante@2025', ROUNDS);

  const studentsData = [
    { code: '20231001', firstName: 'Carlos',  lastName: 'Estudiante Demo',  email: 'estudiante@unipamplona.edu.co' },
    { code: '20231002', firstName: 'Valeria', lastName: 'Ruiz Morales',      email: 'valeria.ruiz@unipamplona.edu.co' },
    { code: '20231003', firstName: 'Andrés',  lastName: 'Mora Leal',         email: 'andres.mora@unipamplona.edu.co' },
  ];

  const students = {};
  for (const sd of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: sd.email }, update: {},
      create: {
        code:         sd.code,
        firstName:    sd.firstName,
        lastName:     sd.lastName,
        email:        sd.email,
        passwordHash: studentHash,
        role:         'STUDENT',
        status:       'ACTIVE',
      },
    });
    const student = await prisma.student.upsert({
      where: { userId: user.id }, update: {},
      create: {
        userId:          user.id,
        programId:       progSistemas.id,
        currentSemester: 3,
        enrollmentYear:  2023,
      },
    });
    students[sd.code] = student;
  }

  // ── 11. Grupos de cursos ────────────────────────────────────
  console.log('📋 Creando grupos de cursos...');
  const groups = {};

  const groupData = [
    { courseCode: 'MAT101', teacherCode: 'T001', groupCode: 'A' },
    { courseCode: 'MAT201', teacherCode: 'T002', groupCode: 'A' },
    { courseCode: 'SIS101', teacherCode: 'T003', groupCode: 'A' },
    { courseCode: 'HUM101', teacherCode: 'T001', groupCode: 'A' },
    { courseCode: 'FIS101', teacherCode: 'T002', groupCode: 'A' },
    { courseCode: 'ING101', teacherCode: 'T003', groupCode: 'A' },
  ];

  for (const gd of groupData) {
    const course  = courses[gd.courseCode];
    const teacher = teachers[gd.teacherCode];
    const key = gd.courseCode + '-' + gd.groupCode;

    const group = await prisma.courseGroup.upsert({
      where: { courseId_academicPeriodId_groupCode: {
        courseId:         course.id,
        academicPeriodId: period.id,
        groupCode:        gd.groupCode,
      }},
      update: {},
      create: {
        courseId:         course.id,
        teacherId:        teacher.id,
        academicPeriodId: period.id,
        groupCode:        gd.groupCode,
      },
    });
    groups[key] = group;
  }

  // ── 12. Horarios ────────────────────────────────────────────
  console.log('🕐 Creando horarios...');
  const scheduleData = [
    { groupKey: 'MAT101-A', day: 'MONDAY',    start: '07:00', end: '09:00', classroomCode: 'A201' },
    { groupKey: 'MAT101-A', day: 'WEDNESDAY', start: '07:00', end: '09:00', classroomCode: 'A201' },
    { groupKey: 'MAT201-A', day: 'TUESDAY',   start: '07:00', end: '09:00', classroomCode: 'B105' },
    { groupKey: 'MAT201-A', day: 'THURSDAY',  start: '09:00', end: '11:00', classroomCode: 'B105' },
    { groupKey: 'SIS101-A', day: 'TUESDAY',   start: '14:00', end: '16:00', classroomCode: 'LABC' },
    { groupKey: 'SIS101-A', day: 'FRIDAY',    start: '09:00', end: '11:00', classroomCode: 'LABC' },
    { groupKey: 'HUM101-A', day: 'THURSDAY',  start: '14:00', end: '16:00', classroomCode: 'C301' },
    { groupKey: 'FIS101-A', day: 'MONDAY',    start: '09:00', end: '11:00', classroomCode: 'LABF' },
    { groupKey: 'FIS101-A', day: 'FRIDAY',    start: '07:00', end: '09:00', classroomCode: 'LABF' },
    { groupKey: 'ING101-A', day: 'WEDNESDAY', start: '14:00', end: '16:00', classroomCode: 'B105' },
  ];

  const classroomMap = {};
  for (const cr of classrooms) classroomMap[cr.code] = cr;

  for (const sch of scheduleData) {
    const group    = groups[sch.groupKey];
    const classroom= classroomMap[sch.classroomCode];
    if (!group) continue;

    const existing = await prisma.schedule.findFirst({
      where: { courseGroupId: group.id, dayOfWeek: sch.day, startTime: sch.start },
    });
    if (!existing) {
      await prisma.schedule.create({
        data: {
          courseGroupId: group.id,
          classroomId:   classroom ? classroom.id : null,
          dayOfWeek:     sch.day,
          startTime:     sch.start,
          endTime:       sch.end,
        },
      });
    }
  }

  // ── 13. Inscripciones ────────────────────────────────────────
  console.log('📝 Creando inscripciones...');
  const enrollmentGroups = ['MAT101-A', 'MAT201-A', 'SIS101-A', 'HUM101-A', 'FIS101-A', 'ING101-A'];
  const studentList = Object.values(students);

  for (const student of studentList) {
    for (const gKey of enrollmentGroups) {
      const group = groups[gKey];
      if (!group) continue;
      try {
        await prisma.enrollment.upsert({
          where: { studentId_courseGroupId: { studentId: student.id, courseGroupId: group.id } },
          update: {},
          create: {
            studentId:       student.id,
            courseGroupId:   group.id,
            academicPeriodId:period.id,
            status:          'ENROLLED',
          },
        });
      } catch (_) { /* ignorar duplicados */ }
    }
  }

  // ── 14. Calificaciones ───────────────────────────────────────
  console.log('📊 Creando calificaciones de muestra...');
  const gradeScores = {
    '20231001': { 'MAT101-A': 4.2, 'MAT201-A': 3.9, 'SIS101-A': 4.5, 'FIS101-A': 3.5, 'ING101-A': 3.8 },
    '20231002': { 'MAT101-A': 4.0, 'SIS101-A': 4.8, 'FIS101-A': 3.8, 'ING101-A': 4.0 },
    '20231003': { 'MAT101-A': 3.5, 'MAT201-A': 4.1, 'SIS101-A': 3.7 },
  };

  for (const [studentCode, scoreMap] of Object.entries(gradeScores)) {
    const student = students[studentCode];
    if (!student) continue;

    for (const [groupKey, score] of Object.entries(scoreMap)) {
      const group = groups[groupKey];
      if (!group) continue;

      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseGroupId: { studentId: student.id, courseGroupId: group.id } },
      });
      if (!enrollment) continue;

      try {
        await prisma.grade.upsert({
          where:  { enrollmentId: enrollment.id },
          update: { score, gradedAt: new Date() },
          create: { enrollmentId: enrollment.id, score, gradedAt: new Date() },
        });
      } catch (_) { /* ignorar */ }
    }
  }

  // ── 15. Anuncios ─────────────────────────────────────────────
  console.log('📢 Creando anuncios...');
  await prisma.announcement.upsert({
    where: { id: 1 }, update: {},
    create: {
      title:    'Inicio del período académico 2025-I',
      body:     'Las clases del período 2025-I comienzan el 3 de febrero. Verifica tu horario en el portal SIU.',
      authorId: superUser.id,
      priority: 'HIGH',
      isActive: true,
    },
  }).catch(() => prisma.announcement.create({
    data: {
      title:    'Inicio del período académico 2025-I',
      body:     'Las clases del período 2025-I comienzan el 3 de febrero. Verifica tu horario en el portal SIU.',
      authorId: superUser.id,
      priority: 'HIGH',
      isActive: true,
    },
  }));

  // ── 16. Log de auditoría inicial ────────────────────────────
  await prisma.auditLog.create({
    data: {
      userId:  superUser.id,
      userName:'Super Admin',
      action:  'CREATE',
      entity:  'SYSTEM',
      detail:  'Seed inicial ejecutado. Sistema listo.',
    },
  });

  // ── RESUMEN ──────────────────────────────────────────────────
  console.log('\n✅ Seed completado correctamente.\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CREDENCIALES DE ACCESO');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SUPERADMIN');
  console.log('    Email:      superadmin@unipamplona.edu.co');
  console.log('    Contraseña: Super@2025');
  console.log('  DOCENTES (contraseña: Docente@2025)');
  console.log('    jperez@unipamplona.edu.co');
  console.log('    mmartinez@unipamplona.edu.co');
  console.log('    lgomez@unipamplona.edu.co');
  console.log('  ADMIN');
  console.log('    Email:      secretaria@unipamplona.edu.co');
  console.log('    Contraseña: Admin@2025');
  console.log('  ESTUDIANTES (contraseña: Estudiante@2025)');
  console.log('    estudiante@unipamplona.edu.co');
  console.log('    valeria.ruiz@unipamplona.edu.co');
  console.log('    andres.mora@unipamplona.edu.co');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch(function(err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(async function() {
    await prisma.$disconnect();
  });
