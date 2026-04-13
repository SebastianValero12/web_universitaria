# Diagrama Entidad-Relación — Unipamplona SIU

## Diagrama simplificado (notación texto)

```
┌──────────────────────────────────────────────────────────────────────┐
│  JERARQUÍA ORGANIZACIONAL                                            │
│                                                                      │
│  Faculty ──(1:N)── Department ──(1:N)── Program ──(1:N)── Student   │
│                         │                                            │
│                         └──(1:N)── Teacher                          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  USUARIO BASE + PERFILES                                             │
│                                                                      │
│  User ──(1:1)── Student                                             │
│  User ──(1:1)── Teacher                                             │
│  User ──(1:1)── Admin                                               │
│  User ──(1:N)── Announcement  (author)                             │
│  User ──(1:N)── AuditLog                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  OFERTA ACADÉMICA                                                    │
│                                                                      │
│  Course ──(M:N via ProgramCourse)── Program                        │
│  ProgramCourse : { programId, courseId, semester, isRequired }      │
│                                                                      │
│  Course ──(1:N)── CourseGroup                                       │
│  Teacher ──(1:N)── CourseGroup                                      │
│  AcademicPeriod ──(1:N)── CourseGroup                               │
│                                                                      │
│  CourseGroup ──(1:N)── Schedule                                     │
│  Classroom ──(1:N)── Schedule                                       │
│  Building ──(1:N)── Classroom                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  INSCRIPCIÓN Y EVALUACIÓN                                            │
│                                                                      │
│  Student ──(1:N)── Enrollment                                       │
│  CourseGroup ──(1:N)── Enrollment                                   │
│  AcademicPeriod ──(1:N)── Enrollment                                │
│                                                                      │
│  Enrollment ──(1:1)── Grade                                         │
│  Enrollment ──(1:N)── Attendance                                    │
└──────────────────────────────────────────────────────────────────────┘
```

## Tablas y campos clave

### users
| Campo        | Tipo       | Descripción                          |
|--------------|------------|--------------------------------------|
| id           | Int PK     | Autoincremental                       |
| code         | String UQ  | Código institucional (ej: EST-001)    |
| email        | String UQ  | Correo institucional                  |
| passwordHash | String     | Hash bcrypt (12 rondas)              |
| role         | Enum       | STUDENT, TEACHER, ADMIN, SUPERUSER   |
| status       | Enum       | ACTIVE, INACTIVE, SUSPENDED          |

### enrollments
| Campo           | Tipo      | Descripción                          |
|-----------------|-----------|--------------------------------------|
| id              | Int PK    |                                      |
| studentId       | Int FK    | → students.id                        |
| courseGroupId   | Int FK    | → course_groups.id                   |
| academicPeriodId| Int FK?   | → academic_periods.id                |
| status          | Enum      | ENROLLED, PASSED, FAILED, WITHDRAWN  |

### grades
| Campo        | Tipo        | Descripción                          |
|--------------|-------------|--------------------------------------|
| enrollmentId | Int UQ FK   | → enrollments.id (uno a uno)        |
| score        | Decimal 4,2 | 0.00 – 5.00                          |

### audit_logs
| Campo    | Tipo    | Descripción                                     |
|----------|---------|-------------------------------------------------|
| userId   | Int? FK | Usuario que ejecutó la acción (nullable)        |
| action   | String  | LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.     |
| entity   | String? | Nombre del modelo afectado                      |
| entityId | String? | ID del registro afectado                        |
| ip       | String? | Dirección IP del cliente                        |
