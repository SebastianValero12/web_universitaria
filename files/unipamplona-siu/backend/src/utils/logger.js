// ============================================================
// LOGGER — Sistema de logging estructurado con niveles
// Universidad de Pamplona SIU
// ============================================================

const { env } = require('../config/env');

// Niveles de log y sus colores ANSI
const LEVELS = {
  debug: { priority: 0, color: '\x1b[36m',  label: 'DEBUG' }, // cyan
  info:  { priority: 1, color: '\x1b[32m',  label: 'INFO ' }, // verde
  warn:  { priority: 2, color: '\x1b[33m',  label: 'WARN ' }, // amarillo
  error: { priority: 3, color: '\x1b[31m',  label: 'ERROR' }, // rojo
};

const RESET = '\x1b[0m';

// En producción solo mostrar info+ ; en dev mostrar todo
const MIN_LEVEL = env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level) {
  return LEVELS[level].priority >= LEVELS[MIN_LEVEL].priority;
}

function formatTimestamp() {
  return new Date().toISOString();
}

function buildMessage(level, message, meta) {
  const ts    = formatTimestamp();
  const lvl   = LEVELS[level];
  const color = env.NODE_ENV !== 'production' ? lvl.color : '';
  const reset = env.NODE_ENV !== 'production' ? RESET : '';

  let out = color + '[' + ts + '] [' + lvl.label + '] ' + message + reset;

  if (meta && typeof meta === 'object' && Object.keys(meta).length > 0) {
    out += '\n' + JSON.stringify(meta, null, 2);
  }

  return out;
}

const logger = {
  debug: function(message, meta) {
    if (!shouldLog('debug')) return;
    console.debug(buildMessage('debug', message, meta));
  },
  info: function(message, meta) {
    if (!shouldLog('info')) return;
    console.info(buildMessage('info', message, meta));
  },
  warn: function(message, meta) {
    if (!shouldLog('warn')) return;
    console.warn(buildMessage('warn', message, meta));
  },
  error: function(message, meta) {
    if (!shouldLog('error')) return;
    console.error(buildMessage('error', message, meta));
  },
};

module.exports = { logger };
