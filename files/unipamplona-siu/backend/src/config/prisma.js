// ============================================================
// PRISMA CLIENT — Singleton para evitar múltiples instancias
// Universidad de Pamplona SIU
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { env } = require('./env');

// Singleton: reutilizar la misma instancia en toda la app
let prisma;

if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // En desarrollo evitar re-instanciar en hot-reload
  if (!global._prismaInstance) {
    global._prismaInstance = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global._prismaInstance;
}

// Manejar desconexión al cerrar el proceso
process.on('beforeExit', async function() {
  await prisma.$disconnect();
});

module.exports = prisma;
