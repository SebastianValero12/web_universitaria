// ============================================================
// SUPERUSER SERVICE — Gestión total del sistema
// Universidad de Pamplona SIU
// ============================================================

const prisma            = require('../../config/prisma');
const UserRepository    = require('../../persistence/repositories/UserRepository');
const AuditRepository   = require('../../persistence/repositories/AuditRepository');
const passwordUtil      = require('../../security/password');
const { logger }        = require('../../utils/logger');

const SuperuserService = {

  /** Dashboard: estadísticas del sistema */
  async getDashboard() {
    const counts = await UserRepository.countByRole();
    return {
      stats: {
        total:      counts.total,
        students:   counts.STUDENT,
        teachers:   counts.TEACHER,
        admins:     counts.ADMIN,
        superusers: counts.SUPERUSER,
      },
    };
  },

  /** Listar usuarios con filtros y paginación */
  async getUsers(params) {
    return UserRepository.findAll(params);
  },

  /** Obtener usuario por ID */
  async getUser(id) {
    const user = await UserRepository.findById(parseInt(id));
    if (!user) throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });
    return user;
  },

  /**
   * Crear usuario — usa transacción de Prisma para garantizar
   * atomicidad al crear User + registro de perfil (Student/Teacher)
   */
  async createUser(data, createdByUserId, ip) {
    // Verificar email único
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) throw Object.assign(new Error('Ya existe un usuario con ese correo electrónico.'), { status: 409 });

    const hashed = await passwordUtil.hash(data.password);

    const newUser = await prisma.$transaction(async function(tx) {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          code:         data.code || generateCode(data.role),
          firstName:    data.firstName,
          lastName:     data.lastName,
          email:        data.email.toLowerCase().trim(),
          passwordHash: hashed,
          role:         data.role,
          status:       'ACTIVE',
        },
      });

      // Crear perfil según rol
      if (data.role === 'STUDENT') {
        await tx.student.create({
          data: {
            userId:          user.id,
            currentSemester: 1,
            enrollmentYear:  new Date().getFullYear(),
          },
        });
      } else if (data.role === 'TEACHER') {
        await tx.teacher.create({ data: { userId: user.id } });
      } else if (data.role === 'ADMIN') {
        await tx.admin.create({ data: { userId: user.id } });
      }

      return user;
    });

    // Auditoría fuera de la transacción
    const creator = await UserRepository.findById(createdByUserId);
    await AuditRepository.log({
      userId:   createdByUserId,
      userName: creator ? creator.firstName + ' ' + creator.lastName : 'Sistema',
      action:   'CREATE',
      entity:   'User',
      entityId: String(newUser.id),
      detail:   'Usuario creado: ' + newUser.email + ' [' + newUser.role + ']',
      ip,
    });

    logger.info('Usuario creado: ' + newUser.email + ' por usuario #' + createdByUserId);

    // Retornar sin hash
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  },

  /** Actualizar usuario */
  async updateUser(id, data, updatedByUserId, ip) {
    const user = await UserRepository.findById(parseInt(id));
    if (!user) throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });

    const updateData = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName)  updateData.lastName  = data.lastName;
    if (data.email)     updateData.email     = data.email.toLowerCase().trim();
    if (data.role)      updateData.role      = data.role;
    if (data.status)    updateData.status    = data.status;
    if (data.password)  updateData.passwordHash = await passwordUtil.hash(data.password);

    const updated = await UserRepository.update(parseInt(id), updateData);

    const updater = await UserRepository.findById(updatedByUserId);
    await AuditRepository.log({
      userId:   updatedByUserId,
      userName: updater ? updater.firstName + ' ' + updater.lastName : 'Sistema',
      action:   'UPDATE',
      entity:   'User',
      entityId: String(id),
      detail:   'Usuario actualizado: ' + (user.email),
      ip,
    });

    return updated;
  },

  /** Eliminar usuario */
  async deleteUser(id, deletedByUserId, ip) {
    const user = await UserRepository.findById(parseInt(id));
    if (!user) throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });

    await UserRepository.delete(parseInt(id));

    const deleter = await UserRepository.findById(deletedByUserId);
    await AuditRepository.log({
      userId:   deletedByUserId,
      userName: deleter ? deleter.firstName + ' ' + deleter.lastName : 'Sistema',
      action:   'DELETE',
      entity:   'User',
      entityId: String(id),
      detail:   'Usuario eliminado: ' + user.email,
      ip,
    });

    return { deleted: true };
  },

  /** Activar / suspender usuario */
  async toggleStatus(id, toggledByUserId, ip) {
    const user = await UserRepository.findById(parseInt(id));
    if (!user) throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });

    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated   = await UserRepository.update(parseInt(id), { status: newStatus });

    const toggler = await UserRepository.findById(toggledByUserId);
    const action  = newStatus === 'ACTIVE' ? 'ENABLE' : 'DISABLE';
    await AuditRepository.log({
      userId:   toggledByUserId,
      userName: toggler ? toggler.firstName + ' ' + toggler.lastName : 'Sistema',
      action,
      entity:   'User',
      entityId: String(id),
      detail:   'Estado cambiado a ' + newStatus + ': ' + user.email,
      ip,
    });

    return updated;
  },

  /** Obtener logs de auditoría */
  async getAuditLogs(params) {
    return AuditRepository.findAll(params);
  },
};

/* ── Helper: generar código ────────────────────────────────── */
function generateCode(role) {
  const prefix = { STUDENT: '20', TEACHER: 'T', ADMIN: 'ADM', SUPERUSER: 'SA' };
  const ts = Date.now().toString().slice(-6);
  return (prefix[role] || 'U') + ts;
}

module.exports = SuperuserService;
