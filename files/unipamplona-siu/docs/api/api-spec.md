# Especificación de la API — Unipamplona SIU

**Base URL:** `http://localhost:3000/api/v1`  
**Formato:** JSON  
**Autenticación:** Bearer JWT en el header `Authorization`

---

## Auth

### POST /auth/login/student

Autentica un usuario con rol STUDENT.

**Body**
```json
{
  "email": "estudiante@unipamplona.edu.co",
  "password": "Estudiante@2025"
}
```

**Respuesta exitosa 200**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": 5,
      "code": "EST-001",
      "firstName": "Carlos",
      "lastName": "Rodríguez",
      "email": "estudiante@unipamplona.edu.co",
      "role": "STUDENT"
    }
  }
}
```

**Errores**
- `401` — Credenciales inválidas
- `403` — Cuenta inactiva / rol no permitido
- `422` — Validación (email inválido, contraseña vacía)
- `429` — Rate limit excedido (10 req / 15 min)

---

### POST /auth/login/admin

Autentica un usuario con rol TEACHER, ADMIN o SUPERUSER.

Mismo body y estructura de respuesta que `/auth/login/student`.

---

### POST /auth/logout

Registra el logout en auditoría. Requiere token válido.

**Headers**
```
Authorization: Bearer <jwt>
```

**Respuesta 200**
```json
{ "success": true, "message": "Sesión cerrada." }
```

---

### GET /auth/me

Retorna el perfil completo del usuario autenticado.

**Respuesta 200**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "code": "EST-001",
    "firstName": "Carlos",
    "lastName": "Rodríguez",
    "email": "estudiante@unipamplona.edu.co",
    "role": "STUDENT",
    "status": "ACTIVE",
    "lastLogin": "2025-06-15T10:30:00.000Z"
  }
}
```

---

## Student

Todas las rutas requieren `Authorization: Bearer <jwt>` con rol `STUDENT`.

### GET /student/dashboard

**Respuesta 200**
```json
{
  "success": true,
  "data": {
    "stats": {
      "enrolledCourses": 6,
      "creditsCompleted": 18,
      "totalCredits": 160,
      "gpa": "3.8",
      "progressPct": 11
    },
    "schedule": [
      {
        "courseCode": "MAT101",
        "courseName": "Cálculo Diferencial",
        "groupCode": "A",
        "dayOfWeek": "MONDAY",
        "dayLabel": "Lunes",
        "startTime": "07:00",
        "endTime": "09:00",
        "classroom": "A-101"
      }
    ],
    "grades": [
      {
        "courseCode": "MAT101",
        "courseName": "Cálculo Diferencial",
        "score": 4.2,
        "status": "ENROLLED"
      }
    ],
    "announcements": [
      {
        "id": 1,
        "title": "Bienvenidos al semestre 2025-I",
        "body": "...",
        "priority": "HIGH",
        "publishedAt": "2025-01-20T08:00:00.000Z"
      }
    ]
  }
}
```

---

## Teacher

Todas las rutas requieren rol `TEACHER` o `ADMIN`.

### GET /teacher/groups

**Respuesta 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "groupCode": "A",
      "course": { "name": "Cálculo Diferencial", "code": "MAT101" },
      "_count": { "enrollments": 12 }
    }
  ]
}
```

### PATCH /teacher/grades/:enrollmentId

**Body**
```json
{ "score": 4.5, "remarks": "Excelente desempeño." }
```

**Validación**
- `score`: requerido, número entre 0.0 y 5.0
- `remarks`: opcional, máximo 255 caracteres

**Respuesta 200**
```json
{
  "success": true,
  "message": "Calificación guardada correctamente.",
  "data": {
    "id": 3,
    "enrollmentId": 7,
    "score": "4.50",
    "remarks": "Excelente desempeño.",
    "gradedAt": "2025-06-15T11:00:00.000Z"
  }
}
```

---

## Admin

Todas las rutas requieren rol `ADMIN` o `SUPERUSER`.

### GET /admin/students?page=1&limit=20&search=carlos

**Query params**
- `page` (int, default: 1)
- `limit` (int, default: 20)
- `search` (string, opcional) — busca en firstName, lastName, email, code

**Respuesta 200**
```json
{
  "success": true,
  "data": [ { "id": 5, "code": "EST-001", "firstName": "Carlos", ... } ],
  "meta": { "total": 45, "page": 1, "limit": 20, "pages": 3 }
}
```

---

## Superuser

Todas las rutas requieren rol `SUPERUSER`.

### POST /superuser/users

**Body**
```json
{
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana.garcia@unipamplona.edu.co",
  "password": "Password1@",
  "role": "TEACHER"
}
```

**Validación**
- `firstName`, `lastName`: requeridos, no vacíos
- `email`: requerido, formato válido
- `role`: requerido, uno de STUDENT|TEACHER|ADMIN|SUPERUSER
- `password`: mínimo 8 caracteres, al menos una mayúscula y un número

**Respuesta 201**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente.",
  "data": {
    "id": 15,
    "code": "DOC-004",
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana.garcia@unipamplona.edu.co",
    "role": "TEACHER",
    "status": "ACTIVE"
  }
}
```

### GET /superuser/audit-logs?page=1&limit=50

**Respuesta 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "userId": 1,
      "userName": "Admin Sistema",
      "action": "LOGIN",
      "entity": null,
      "entityId": null,
      "ip": "::1",
      "createdAt": "2025-06-15T09:00:00.000Z"
    }
  ],
  "meta": { "total": 500, "page": 1, "limit": 50, "pages": 10 }
}
```

---

## Health check

### GET /health

No requiere autenticación.

**Respuesta 200**
```json
{
  "status": "ok",
  "timestamp": "2025-06-15T12:00:00.000Z",
  "db": "connected"
}
```
