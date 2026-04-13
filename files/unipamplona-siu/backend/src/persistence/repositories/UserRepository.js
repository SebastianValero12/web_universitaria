// ============================================================
// USER REPOSITORY — Acceso a datos de usuarios
// Universidad de Pamplona SIU
// ============================================================

const prisma = require('../../config/prisma');

// Campos seguros para retornar (sin contraseña)
const SAFE_FIELDS = {
  id: true, code: true, firstName: true, lastName: true,
  email: true, role: true, status: true, lastLogin: true,
  createdAt: true, updatedAt: true,
};

const UserRepository = {

  /** Buscar usuario por email (incluye hash para autenticación) */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  /** Buscar usuario por ID (sin contraseña) */
  async findById(id) {
    return prisma.user.findUnique({
      where:  { id },
      select: SAFE_FIELDS,
    });
  },

  /** Buscar usuario por código institucional */
  async findByCode(code) {
    return prisma.user.findUnique({
      where:  { code },
      select: SAFE_FIELDS,
    });
  },

  /** Actualizar último login */
  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data:  { lastLogin: new Date() },
    });
  },

  /** Crear usuario */
  async create(data) {
    return prisma.user.create({
      data: {
        code:         data.code,
        firstName:    data.firstName,
        lastName:     data.lastName,
        email:        data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role:         data.role,
        status:       data.status || 'ACTIVE',
      },
      select: SAFE_FIELDS,
    });
  },

  /** Actualizar usuario */
  async update(id, data) {
    // Construir objeto de actualización sin campos indefinidos
    const updateData = {};
    if (data.firstName    !== undefined) updateData.firstName    = data.firstName;
    if (data.lastName     !== undefined) updateData.lastName     = data.lastName;
    if (data.email        !== undefined) updateData.email        = data.email.toLowerCase().trim();
    if (data.role         !== undefined) updateData.role         = data.role;
    if (data.status       !== undefined) updateData.status       = data.status;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;

    return prisma.user.update({
      where:  { id },
      data:   updateData,
      select: SAFE_FIELDS,
    });
  },

  /** Eliminar usuario permanentemente */
  async delete(id) {
    return prisma.user.delete({ where: { id } });
  },

  /** Listar todos con paginación y filtros */
  async findAll(params) {
    const page   = parseInt(params.page)  || 1;
    const limit  = parseInt(params.limit) || 20;
    const skip   = (page - 1) * limit;

    const where = {};
    if (params.role)   where.role   = params.role;
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName:  { contains: params.search, mode: 'insensitive' } },
        { email:     { contains: params.search, mode: 'insensitive' } },
        { code:      { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: SAFE_FIELDS, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  /** Contar usuarios por rol */
  async countByRole() {
    const counts = await prisma.user.groupBy({
      by:      ['role'],
      _count:  { id: true },
    });
    const result = { STUDENT: 0, TEACHER: 0, ADMIN: 0, SUPERUSER: 0, total: 0 };
    counts.forEach(function(c) {
      result[c.role] = c._count.id;
      result.total   += c._count.id;
    });
    return result;
  },
};

module.exports = UserRepository;
