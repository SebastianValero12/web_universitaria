# Diagramas de Flujo — Unipamplona SIU

## Flujo de autenticación

```
Usuario ingresa email + password
        │
        ▼
POST /api/v1/auth/login/student
POST /api/v1/auth/login/admin
        │
        ▼
[1] Normalizar email (toLowerCase + trim)
        │
        ▼
[2] UserRepository.findByEmail(email)
        │
        ├─── NOT FOUND ──► 401 Credenciales inválidas
        │
        ▼
[3] ¿status === 'ACTIVE'?
        │
        ├─── NO (INACTIVE/SUSPENDED) ──► 403 Cuenta suspendida
        │
        ▼
[4] password.compare(plain, user.passwordHash)
        │
        ├─── NO MATCH ──► 401 Credenciales inválidas
        │
        ▼
[5] ¿role permitido para este endpoint?
   (login/student → STUDENT)
   (login/admin   → TEACHER, ADMIN, SUPERUSER)
        │
        ├─── NO ──► 403 Rol no permitido
        │
        ▼
[6] UserRepository.updateLastLogin(userId)
        │
        ▼
[7] AuditRepository.log({ action: 'LOGIN' })
        │
        ▼
[8] jwt.sign({ id, email, role, code })
        │
        ▼
200 OK { token, user: { id, code, firstName, lastName, email, role } }
        │
        ▼
Cliente guarda token en localStorage
Router.redirectToHome(role)
```

---

## Flujo de acceso a un dashboard protegido

```
Usuario navega a dashboard.html
        │
        ▼
DOMContentLoaded → Router.guard(['STUDENT'])
        │
        ├── Sin sesión  ──► redirect a /index.html?login=1
        ├── Rol incorrecto ──► redirect a home del rol
        │
        ▼
initUser() → Auth.getUser() → muestra nombre en topbar/sidebar
        │
        ▼
initDashboard()
        │
        ├── fetch GET /api/v1/student/dashboard  (Bearer token)
        │         │
        │         ├── 200 OK ──► renderStats/renderGrades/renderSchedule
        │         │
        │         └── Error  ──► usar datos DEMO_ de fallback
        │
        ▼
Página renderizada con datos reales o de demo
```

---

## Flujo de creación de usuario (Superuser)

```
Admin llena formulario de nuevo usuario
        │
        ▼
POST /api/v1/superuser/users
  body: { firstName, lastName, email, password, role }
        │
        ▼
express-validator (createValidators)
        │
        ├── Errores de validación ──► 422 Unprocessable Entity
        │
        ▼
SuperuserService.createUser(data, actorInfo)
        │
        ▼
prisma.$transaction([
  prisma.user.create({ ... }),           ← Crea usuario base
  prisma.student/teacher/admin.create()  ← Crea perfil según role
])
        │
        ├── P2002 (unique constraint) ──► 409 Email/código ya existe
        │
        ▼
AuditRepository.log({ action: 'CREATE', entity: 'User' })
        │
        ▼
201 Created { user: { id, code, firstName, lastName, email, role } }
        │
        ▼
UI: cierra modal, recarga tabla de usuarios, toast "Usuario creado"
```

---

## Flujo de actualización de calificación (Docente)

```
Docente ingresa nota en la tabla de estudiantes
        │
        ▼
PATCH /api/v1/teacher/grades/:enrollmentId
  body: { score: 4.5, remarks: "Excelente" }
        │
        ▼
authenticate middleware → verifica JWT → req.user
authorize('TEACHER', 'ADMIN') → verifica rol
        │
        ▼
gradeValidators (score entre 0 y 5)
        │
        ▼
TeacherService.upsertGrade(enrollmentId, score, remarks, actorInfo)
        │
        ▼
TeacherRepository.upsertGrade(enrollmentId, score, remarks)
  → prisma.grade.upsert({ where: { enrollmentId }, ... })
        │
        ├── enrollment no existe ──► null ──► 404 Not Found
        │
        ▼
AuditRepository.log({ action: 'UPDATE', entity: 'Grade' })
        │
        ▼
200 OK { grade } + "Calificación guardada correctamente."
```
