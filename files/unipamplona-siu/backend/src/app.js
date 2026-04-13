/* ============================================================
   APP.JS — Punto de entrada del servidor Express
   Universidad de Pamplona SIU
   ============================================================ */

require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const { env }    = require('./config/env');
const { logger } = require('./utils/logger');

// Importar rutas
const authRoutes      = require('./presentation/routes/auth.routes');
const studentRoutes   = require('./presentation/routes/student.routes');
const teacherRoutes   = require('./presentation/routes/teacher.routes');
const adminRoutes     = require('./presentation/routes/admin.routes');
const superuserRoutes = require('./presentation/routes/superuser.routes');

const app = express();

/* ── Seguridad: Helmet ─────────────────────────────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/* ── CORS ──────────────────────────────────────────────────── */
app.use(cors({
  origin:      env.CORS_ORIGIN || '*',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ── Body parser ───────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ── Rate limiting global ──────────────────────────────────── */
const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
  max:      parseInt(env.RATE_LIMIT_MAX)        || 100,
  message:  { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders:   false,
});

app.use(limiter);

/* ── Rate limiting estricto para auth ──────────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max:      10,
  message:  { ok: false, error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.', code: 'AUTH_RATE_LIMIT' },
});

/* ── Logging de peticiones ─────────────────────────────────── */
app.use(function(req, res, next) {
  logger.info('[' + req.method + '] ' + req.path + ' — ' + (req.ip || 'desconocido'));
  next();
});

/* ── Ruta de salud ─────────────────────────────────────────── */
app.get('/health', function(req, res) {
  res.json({
    ok:      true,
    status:  'UP',
    version: '1.0.0',
    env:     env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

/* ── Rutas de la API ───────────────────────────────────────── */
app.use('/api/v1/auth',      authLimiter, authRoutes);
app.use('/api/v1/student',   studentRoutes);
app.use('/api/v1/teacher',   teacherRoutes);
app.use('/api/v1/admin',     adminRoutes);
app.use('/api/v1/superuser', superuserRoutes);

/* ── 404 ───────────────────────────────────────────────────── */
app.use(function(req, res) {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada.', code: 'NOT_FOUND' });
});

/* ── Manejador global de errores ───────────────────────────── */
app.use(function(err, req, res, next) {
  logger.error('Error no controlado: ' + err.message, { stack: err.stack });

  // Error de validación de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ ok: false, error: 'Ya existe un registro con ese dato único.', code: 'DUPLICATE' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ ok: false, error: 'Registro no encontrado.', code: 'NOT_FOUND' });
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ ok: false, error: 'Token inválido.', code: 'INVALID_TOKEN' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ ok: false, error: 'Sesión expirada. Inicia sesión nuevamente.', code: 'TOKEN_EXPIRED' });
  }

  const status = err.status || err.statusCode || 500;
  const message = env.NODE_ENV === 'production'
    ? 'Error interno del servidor.'
    : (err.message || 'Error interno del servidor.');

  res.status(status).json({ ok: false, error: message, code: 'SERVER_ERROR' });
});

/* ── Arrancar servidor ─────────────────────────────────────── */
const PORT = env.PORT || 3000;
app.listen(PORT, function() {
  logger.info('Servidor SIU Unipamplona iniciado en http://localhost:' + PORT);
  logger.info('Entorno: ' + env.NODE_ENV);
  logger.info('API disponible en /api/v1/');
});

module.exports = app;
