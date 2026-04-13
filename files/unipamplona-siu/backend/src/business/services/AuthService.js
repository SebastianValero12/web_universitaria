// ============================================================
// AUTH SERVICE — Lógica de autenticación y sesiones
// Universidad de Pamplona SIU
// ============================================================

const UserRepository  = require('../../persistence/repositories/UserRepository');
const AuditRepository = require('../../persistence/repositories/AuditRepository');
const password        = require('../../security/password');
const jwt             = require('../../security/jwt');
const { logger }      = require('../../utils/logger');

const AuthService = {

  /**
   * Flujo de inicio de sesión para todos los roles
   * 1. Normalizar email
   * 2. Buscar usuario → 401 si no existe
   * 3. Verificar estado ACTIVE → 403 si no
   * 4. Comparar contraseña → 401 si no coincide
   * 5. Actualizar lastLogin
   * 6. Registrar auditoría
   * 7. Generar JWT
   * 8. Retornar { token, user }
   */
  async login(email, plainPassword, allowedRoles, ip) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Buscar por email (incluye hash)
    const user = await UserRepository.findByEmail(normalizedEmail);
    if (!user) {
      logger.warn('Intento de login con email inexistente: ' + normalizedEmail);
      throw Object.assign(new Error('Credenciales incorrectas.'), { status: 401 });
    }

    // 2. Verificar que el rol sea permitido
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      logger.warn('Rol ' + user.role + ' no permitido en este endpoint para: ' + normalizedEmail);
      throw Object.assign(new Error('Credenciales incorrectas.'), { status: 401 });
    }

    // 3. Verificar estado
    if (user.status !== 'ACTIVE') {
      const msg = user.status === 'SUSPENDED'
        ? 'Tu cuenta está suspendida. Contacta a secretaría académica.'
        : 'Tu cuenta no está activa. Contacta a soporte.';
      logger.warn('Login rechazado por estado ' + user.status + ': ' + normalizedEmail);
      throw Object.assign(new Error(msg), { status: 403 });
    }

    // 4. Verificar contraseña
    const isValid = await password.compare(plainPassword, user.passwordHash);
    if (!isValid) {
      logger.warn('Contraseña incorrecta para: ' + normalizedEmail);
      throw Object.assign(new Error('Credenciales incorrectas.'), { status: 401 });
    }

    // 5. Actualizar lastLogin (sin await para no bloquear)
    UserRepository.updateLastLogin(user.id).catch(function(err) {
      logger.error('Error al actualizar lastLogin: ' + err.message);
    });

    // 6. Registrar en auditoría
    AuditRepository.log({
      userId:   user.id,
      userName: user.firstName + ' ' + user.lastName,
      action:   'LOGIN',
      entity:   'User',
      entityId: String(user.id),
      detail:   'Inicio de sesión desde ' + (ip || 'desconocido'),
      ip:       ip || null,
    }).catch(function(err) {
      logger.error('Error al registrar auditoría LOGIN: ' + err.message);
    });

    // 7. Construir payload del JWT
    const payload = {
      sub:   user.id,
      email: user.email,
      role:  user.role,
      code:  user.code,
    };

    const token = jwt.sign(payload);

    // 8. Retornar sin hash de contraseña
    const safeUser = {
      id:        user.id,
      code:      user.code,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      status:    user.status,
    };

    logger.info('Login exitoso: ' + normalizedEmail + ' [' + user.role + ']');

    return { token, user: safeUser };
  },

  /**
   * Registrar logout en auditoría
   */
  async logout(userId, ip) {
    const user = await UserRepository.findById(userId);
    await AuditRepository.log({
      userId,
      userName: user ? user.firstName + ' ' + user.lastName : 'Desconocido',
      action:   'LOGOUT',
      entity:   'User',
      entityId: String(userId),
      detail:   'Cierre de sesión',
      ip:       ip || null,
    });
    return { ok: true };
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });
    return user;
  },
};

module.exports = AuthService;
