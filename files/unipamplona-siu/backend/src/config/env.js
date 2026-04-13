// ============================================================
// CONFIG ENV — Variables de entorno validadas al inicio
// Universidad de Pamplona SIU
// ============================================================

const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET'];

function validateEnv() {
  const missing = REQUIRED_VARS.filter(function(v) { return !process.env[v]; });
  if (missing.length > 0) {
    console.error('[ENV] Variables de entorno faltantes: ' + missing.join(', '));
    console.error('[ENV] Copia .env.example a .env y configura las variables requeridas.');
    process.exit(1);
  }
}

// Validar en arranque (excepto en tests)
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

const env = {
  NODE_ENV:               process.env.NODE_ENV    || 'development',
  PORT:                   process.env.PORT        || '3000',
  DATABASE_URL:           process.env.DATABASE_URL,
  JWT_SECRET:             process.env.JWT_SECRET,
  JWT_EXPIRES_IN:         process.env.JWT_EXPIRES_IN         || '8h',
  CORS_ORIGIN:            process.env.CORS_ORIGIN            || 'http://localhost:5500',
  RATE_LIMIT_WINDOW_MS:   process.env.RATE_LIMIT_WINDOW_MS   || '900000',
  RATE_LIMIT_MAX:         process.env.RATE_LIMIT_MAX         || '100',
  BCRYPT_ROUNDS:          parseInt(process.env.BCRYPT_ROUNDS) || 12,
  isProduction: function() { return this.NODE_ENV === 'production'; },
  isDevelopment: function() { return this.NODE_ENV === 'development'; },
};

module.exports = { env };
