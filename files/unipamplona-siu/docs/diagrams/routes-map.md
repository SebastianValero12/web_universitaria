# Mapa de Rutas API — Unipamplona SIU

Base URL: `http://localhost:3000/api/v1`

## Autenticación

| Método | Ruta                      | Descripción                           | Auth requerida |
|--------|---------------------------|---------------------------------------|----------------|
| POST   | /auth/login/student       | Login para estudiantes                | No             |
| POST   | /auth/login/admin         | Login para docentes/admins/super      | No             |
| POST   | /auth/logout              | Cerrar sesión (registra en auditoría) | Sí             |
| GET    | /auth/me                  | Perfil del usuario autenticado        | Sí             |

## Estudiante (rol: STUDENT)

| Método | Ruta                      | Descripción                        |
|--------|---------------------------|------------------------------------|
| GET    | /student/dashboard        | Stats + horario + notas + avisos   |
| GET    | /student/schedule         | Horario del periodo activo         |
| GET    | /student/grades           | Calificaciones de todos los cursos |
| GET    | /student/progress         | Progreso de créditos y promedio    |
| GET    | /student/announcements    | Avisos activos                     |
| GET    | /student/profile          | Perfil del estudiante              |

## Docente (roles: TEACHER, ADMIN)

| Método | Ruta                              | Descripción                              |
|--------|-----------------------------------|------------------------------------------|
| GET    | /teacher/dashboard                | Resumen de grupos y estudiantes          |
| GET    | /teacher/groups                   | Grupos asignados en el periodo activo    |
| GET    | /teacher/groups/:id/students      | Estudiantes de un grupo con calificación |
| PATCH  | /teacher/grades/:enrollmentId     | Crear o actualizar calificación          |

## Administrador (roles: ADMIN, SUPERUSER)

| Método | Ruta                     | Descripción                           |
|--------|--------------------------|---------------------------------------|
| GET    | /admin/dashboard         | Estadísticas generales                |
| GET    | /admin/students          | Lista paginada de estudiantes         |
| GET    | /admin/teachers          | Lista paginada de docentes            |
| GET    | /admin/course-groups     | Grupos del periodo activo             |

## Superusuario (rol: SUPERUSER)

| Método | Ruta                                   | Descripción                           |
|--------|----------------------------------------|---------------------------------------|
| GET    | /superuser/dashboard                   | Métricas globales del sistema         |
| GET    | /superuser/users                       | Todos los usuarios (filtros, paginado)|
| GET    | /superuser/users/:id                   | Detalle de un usuario                 |
| POST   | /superuser/users                       | Crear usuario + perfil de rol         |
| PUT    | /superuser/users/:id                   | Actualizar datos del usuario          |
| DELETE | /superuser/users/:id                   | Eliminar usuario                      |
| PATCH  | /superuser/users/:id/toggle-status     | Activar / suspender usuario           |
| GET    | /superuser/audit-logs                  | Log de auditoría paginado             |

## Sistema

| Método | Ruta      | Descripción                                    |
|--------|-----------|------------------------------------------------|
| GET    | /health   | Estado del servidor y conexión a BD            |

---

## Formato de respuesta

### Éxito simple
```json
{
  "success": true,
  "data": { ... }
}
```

### Éxito con mensaje
```json
{
  "success": true,
  "message": "Operación realizada correctamente.",
  "data": { ... }
}
```

### Paginado
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### Error
```json
{
  "success": false,
  "error": "Descripción del error."
}
```

### Error de validación (422)
```json
{
  "success": false,
  "error": "Error de validación.",
  "errors": [
    { "field": "email", "message": "Ingresa un correo electrónico válido." }
  ]
}
```

## Códigos HTTP usados

| Código | Significado                          |
|--------|--------------------------------------|
| 200    | OK — operación exitosa               |
| 201    | Created — recurso creado             |
| 400    | Bad Request — datos inválidos        |
| 401    | Unauthorized — sin autenticación     |
| 403    | Forbidden — sin autorización         |
| 404    | Not Found — recurso no encontrado    |
| 409    | Conflict — datos duplicados          |
| 422    | Unprocessable Entity — validación    |
| 429    | Too Many Requests — rate limit       |
| 500    | Internal Server Error                |
