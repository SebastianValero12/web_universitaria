// ============================================================
// AUDIT REPOSITORY — Registro de acciones del sistema
// Universidad de Pamplona SIU
// ============================================================

const prisma = require('../../config/prisma');

const AuditRepository = {

  /** Registrar una acción en el log de auditoría */
  async log(params) {
    return prisma.auditLog.create({
      data: {
        userId:   params.userId   || null,
        userName: params.userName || 'Sistema',
        action:   params.action,
        entity:   params.entity   || null,
        entityId: params.entityId || null,
        detail:   params.detail   || null,
        ip:       params.ip       || null,
        userAgent:params.userAgent|| null,
      },
    });
  },

  /** Obtener logs con paginación */
  async findAll(params) {
    const page  = parseInt(params.page)  || 1;
    const limit = parseInt(params.limit) || 50;
    const skip  = (page - 1) * limit;

    const where = {};
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  },

  /** Obtener logs de un usuario */
  async findByUser(userId, limit) {
    return prisma.auditLog.findMany({
      where:   { userId },
      take:    limit || 20,
      orderBy: { createdAt: 'desc' },
    });
  },
};

module.exports = AuditRepository;
