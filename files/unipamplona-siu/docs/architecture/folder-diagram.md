# Diagrama de Carpetas — Unipamplona SIU

```
unipamplona-siu/
│
├── backend/
│   ├── .env.example                    # Variables de entorno de referencia
│   ├── package.json
│   ├── Dockerfile
│   │
│   └── src/
│       ├── app.js                      # Bootstrap Express (middlewares + rutas)
│       │
│       ├── config/
│       │   ├── env.js                  # Valida y exporta variables de entorno
│       │   └── prisma.js               # Singleton PrismaClient
│       │
│       ├── domain/
│       │   ├── enums/
│       │   │   ├── Role.js             # Enum Role: STUDENT|TEACHER|ADMIN|SUPERUSER
│       │   │   ├── UserStatus.js       # Enum UserStatus: ACTIVE|INACTIVE|SUSPENDED
│       │   │   └── DayOfWeek.js        # Enum DayOfWeek + label helpers
│       │   └── models/
│       │       ├── User.js             # Modelo User puro (createUser, fullName, toPublic)
│       │       ├── Student.js          # Modelo Student (createStudent, calcProgress)
│       │       ├── Teacher.js          # Modelo Teacher (createTeacher, displayName)
│       │       ├── Admin.js            # Modelo Admin  (createAdmin)
│       │       ├── CourseGroup.js      # Modelo CourseGroup (createCourseGroup, hasCapacity)
│       │       └── Schedule.js         # Modelo Schedule (sortSchedules, dayLabel)
│       │
│       ├── security/
│       │   ├── jwt.js                  # sign / verify / decode JWT
│       │   └── password.js             # hash / compare bcrypt
│       │
│       ├── persistence/
│       │   └── repositories/
│       │       ├── UserRepository.js
│       │       ├── StudentRepository.js
│       │       ├── TeacherRepository.js
│       │       └── AuditRepository.js
│       │
│       ├── business/
│       │   ├── validators/
│       │   │   ├── auth.validator.js   # loginValidators
│       │   │   └── user.validator.js   # createUserValidators, updateUserValidators
│       │   └── services/
│       │       ├── AuthService.js
│       │       ├── StudentService.js
│       │       ├── TeacherService.js
│       │       ├── AdminService.js
│       │       └── SuperuserService.js
│       │
│       ├── presentation/
│       │   ├── middlewares/
│       │   │   ├── auth.middleware.js  # authenticate (JWT → req.user)
│       │   │   └── role.middleware.js  # authorize(...roles)
│       │   ├── controllers/
│       │   │   ├── AuthController.js
│       │   │   ├── StudentController.js
│       │   │   ├── TeacherController.js
│       │   │   ├── AdminController.js
│       │   │   └── SuperuserController.js
│       │   └── routes/
│       │       ├── auth.routes.js      # /api/v1/auth
│       │       ├── student.routes.js   # /api/v1/student
│       │       ├── teacher.routes.js   # /api/v1/teacher
│       │       ├── admin.routes.js     # /api/v1/admin
│       │       └── superuser.routes.js # /api/v1/superuser
│       │
│       └── utils/
│           └── response.js             # Helpers: R.ok, R.error, R.paginated, etc.
│
├── frontend/
│   ├── index.html                      # Landing page
│   └── src/
│       ├── styles/
│       │   ├── tokens/
│       │   │   └── tokens.css          # Variables CSS (colores, tipografía, espaciado)
│       │   ├── base/
│       │   │   └── base.css            # Reset, animaciones, utilidades
│       │   └── components/
│       │       ├── components.css      # Biblioteca de componentes UI
│       │       └── login-drawer.css    # Cajón de login lateral derecho
│       │
│       ├── layouts/
│       │   ├── layout.css              # Navbar + Footer
│       │   └── layout.js              # window.Layout (buildNavbar, buildFooter, etc.)
│       │
│       ├── router/
│       │   └── router.js              # window.Router (guard, autoGuard, redirectToHome)
│       │
│       ├── services/
│       │   └── services.js            # window.Config/Http/Auth/Api/Toast/LoginDrawer
│       │
│       ├── components/
│       │   ├── dashboard-base.html    # Referencia de layout sidebar+topbar
│       │   └── dashboard-base.css    # Estilos complementarios de dashboard
│       │
│       └── pages/
│           ├── index.css              # Estilos landing
│           ├── index.js               # Scripts landing (hero slider, filtros)
│           ├── auth/
│           │   ├── admin-login.html
│           │   ├── admin-login.css
│           │   └── admin-login.js
│           ├── student/
│           │   ├── dashboard.html
│           │   ├── dashboard.css
│           │   └── dashboard.js
│           ├── admin/
│           │   ├── dashboard.html
│           │   ├── dashboard.css
│           │   └── dashboard.js
│           └── superuser/
│               ├── dashboard.html
│               ├── dashboard.css
│               └── dashboard.js
│
├── database/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
│
└── docs/
    ├── README.md
    ├── architecture/
    │   ├── layers-diagram.md
    │   ├── folder-diagram.md
    │   └── flow-diagram.md
    ├── diagrams/
    │   ├── er-diagram.md
    │   └── routes-map.md
    └── api/
        └── api-spec.md
```
