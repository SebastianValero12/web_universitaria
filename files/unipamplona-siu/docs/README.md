# Unipamplona SIU — Sistema de Información Universitaria

Sistema de información académica para la Universidad de Pamplona, Colombia.  
Stack: Node.js · Express · Prisma ORM · PostgreSQL · HTML/CSS/JS vanilla.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18.x           |
| npm         | 9.x            |
| PostgreSQL  | 14.x           |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-repo>
cd unipamplona-siu
```

### 2. Configurar variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` y ajusta los valores:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/unipamplona_siu"
JWT_SECRET="cambia-esto-por-una-clave-segura-minimo-32-chars"
JWT_EXPIRES_IN="8h"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5500"
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 4. Configurar la base de datos

```bash
# Generar el cliente Prisma
npx prisma generate

# Crear las tablas en la BD
npx prisma migrate dev --name init

# Poblar con datos de prueba
npx prisma db seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
# El servidor escucha en http://localhost:3000
```

### 6. Abrir el frontend

Abre `frontend/index.html` en el navegador directamente o usa una extensión como **Live Server** en VS Code:

```
frontend/index.html          → Página principal / landing
frontend/src/pages/auth/admin-login.html   → Login administrativo
frontend/src/pages/student/dashboard.html  → Dashboard estudiante
frontend/src/pages/admin/dashboard.html    → Dashboard docente/admin
frontend/src/pages/superuser/dashboard.html → Dashboard superusuario
```

---

## Credenciales de prueba

| Rol         | Correo                             | Contraseña      |
|-------------|-------------------------------------|-----------------|
| Superusuario | superadmin@unipamplona.edu.co      | Super@2025      |
| Administrador | secretaria@unipamplona.edu.co     | Admin@2025      |
| Docente 1   | jperez@unipamplona.edu.co           | Docente@2025    |
| Docente 2   | mmartinez@unipamplona.edu.co        | Docente@2025    |
| Docente 3   | lgomez@unipamplona.edu.co           | Docente@2025    |
| Estudiante 1 | estudiante@unipamplona.edu.co      | Estudiante@2025 |
| Estudiante 2 | valeria.ruiz@unipamplona.edu.co    | Estudiante@2025 |
| Estudiante 3 | andres.mora@unipamplona.edu.co     | Estudiante@2025 |

---

## Scripts disponibles

Desde el directorio `backend/`:

```bash
npm run dev      # Nodemon + ts-node (desarrollo)
npm start        # Node producción
npm run seed     # Ejecuta el seed manualmente
```

---

## Estructura de carpetas

```
unipamplona-siu/
├── backend/                   # API REST (Node.js + Express)
│   ├── src/
│   │   ├── app.js             # Configuración Express
│   │   ├── config/            # env.js, prisma.js
│   │   ├── domain/            # Enums y modelos de dominio puros
│   │   ├── security/          # JWT, bcrypt helpers
│   │   ├── persistence/       # Repositorios Prisma
│   │   ├── business/          # Servicios + validadores
│   │   └── presentation/      # Middlewares, controladores, rutas
│   ├── prisma/                # schema.prisma + seed
│   ├── .env.example
│   └── package.json
│
├── frontend/                  # UI HTML/CSS/JS vanilla
│   ├── index.html             # Landing / página principal
│   └── src/
│       ├── styles/            # tokens/, base/, components/
│       ├── layouts/           # layout.html, layout.css, layout.js
│       ├── router/            # router.js
│       ├── services/          # services.js (API + Auth + Toast)
│       ├── components/        # dashboard-base.html/css
│       └── pages/
│           ├── index.css/js   # Estilos y scripts de la landing
│           ├── auth/          # admin-login.html/css/js
│           ├── student/       # dashboard.html/css/js
│           ├── admin/         # dashboard.html/css/js
│           └── superuser/     # dashboard.html/css/js
│
├── database/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
│
└── docs/                      # Documentación técnica
    ├── README.md              # Este archivo
    ├── architecture/
    ├── diagrams/
    └── api/
```

---

## Stack tecnológico

| Capa       | Tecnología                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3 (custom properties), JS ES5 |
| Backend    | Node.js 18, Express 4               |
| ORM        | Prisma 5                            |
| Base datos | PostgreSQL 14+                      |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Seguridad  | Helmet, CORS, express-rate-limit    |
| Dev        | Nodemon                             |

---

## Notas de seguridad

- Cambia siempre `JWT_SECRET` antes de llevar a producción.
- Las contraseñas se almacenan con bcrypt (12 rondas).
- Todos los endpoints protegidos verifican el token JWT y el rol del usuario.
- Rate limiting global: 100 req / 15 min por IP.
- Rate limiting en `/auth`: 10 req / 15 min por IP.
