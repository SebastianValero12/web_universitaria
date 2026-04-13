# Diagrama de Capas — Unipamplona SIU

## Arquitectura backend por capas

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│  Middlewares (auth, role)  │  Controllers  │  Routes        │
│  Valida HTTP, extrae datos │  Orquesta     │  Define URLs   │
│  de req/res                │  servicio     │  y métodos     │
└────────────────────────────┬────────────────────────────────┘
                             │ llama
┌────────────────────────────▼────────────────────────────────┐
│                      BUSINESS LAYER                         │
│  Services (AuthService, StudentService, TeacherService,     │
│            AdminService, SuperuserService)                  │
│  Lógica de negocio, reglas de dominio, orquestación de      │
│  repositorios, registro de auditoría                        │
└────────────────────────────┬────────────────────────────────┘
                             │ llama
┌────────────────────────────▼────────────────────────────────┐
│                    PERSISTENCE LAYER                        │
│  Repositories (UserRepository, StudentRepository,           │
│                TeacherRepository, AuditRepository)          │
│  Acceso a datos vía Prisma ORM                             │
└────────────────────────────┬────────────────────────────────┘
                             │ usa
┌────────────────────────────▼────────────────────────────────┐
│                    INFRASTRUCTURE                           │
│  Prisma Client  │  PostgreSQL  │  JWT  │  bcryptjs          │
└─────────────────────────────────────────────────────────────┘
```

## Principios de diseño

| Principio           | Implementación                                                   |
|---------------------|------------------------------------------------------------------|
| Separación de capas | Cada capa solo conoce la inmediatamente inferior                |
| Responsabilidad única | Cada clase/módulo tiene una sola razón para cambiar          |
| Inmutabilidad       | Los modelos de dominio retornan `Object.freeze()`               |
| Repositorio         | El acceso a datos está encapsulado y es intercambiable          |
| Fail-fast           | Las validaciones ocurren lo más temprano posible en el pipeline |

## Flujo de una petición HTTP

```
Cliente HTTP
    │
    ▼
Express Router
    │  Middleware: authenticate (verifica JWT, adjunta req.user)
    │  Middleware: authorize    (verifica rol)
    ▼
Controller
    │  Lee req.params, req.query, req.body
    │  Ejecuta validationResult (express-validator)
    ▼
Service
    │  Aplica lógica de negocio
    │  Llama a uno o más repositorios
    │  Registra en AuditRepository si hay escritura
    ▼
Repository
    │  Consulta o muta la BD vía Prisma
    ▼
PrismaClient → PostgreSQL
    │
    └── retorna datos hacia arriba
    ▼
Response (R.ok / R.paginated / R.error / ...)
    ▼
Cliente HTTP
```
