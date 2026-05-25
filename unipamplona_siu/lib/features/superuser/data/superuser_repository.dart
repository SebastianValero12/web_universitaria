import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/audit_log_model.dart';
import '../domain/user_list_model.dart';

class SuperuserRepository {
  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final res  = await DioClient.get(ApiConstants.superuserDashboard);
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) return data['data'] as Map<String, dynamic>;
      throw Exception();
    } catch (_) { return _demoData(); }
  }

  Future<List<UserListModel>> getUsers() async {
    try {
      final res  = await DioClient.get(ApiConstants.superuserUsers);
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) {
        return (data['data']['users'] as List)
          .map((e) => UserListModel.fromJson(e as Map<String, dynamic>))
          .toList();
      }
      throw Exception();
    } catch (_) { return _demoUsers(); }
  }

  Future<UserListModel> createUser(Map<String, dynamic> payload) async {
    try {
      final res  = await DioClient.post(ApiConstants.superuserUsers, data: payload);
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) return UserListModel.fromJson(data['data'] as Map<String, dynamic>);
      throw Exception();
    } catch (_) {
      return UserListModel(
        id: DateTime.now().millisecondsSinceEpoch,
        code: 'NEW',
        firstName: payload['firstName'] as String,
        lastName:  payload['lastName']  as String,
        email:     payload['email']     as String,
        role:      payload['role']      as String,
        status:    'ACTIVE',
      );
    }
  }

  Future<UserListModel> updateUser(int id, Map<String, dynamic> payload) async {
    try {
      final res  = await DioClient.put(ApiConstants.superuserUser(id), data: payload);
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) return UserListModel.fromJson(data['data'] as Map<String, dynamic>);
      throw Exception();
    } catch (_) {
      return UserListModel(
        id: id, code: '',
        firstName: payload['firstName'] as String,
        lastName:  payload['lastName']  as String,
        email:     payload['email']     as String,
        role:      payload['role']      as String,
        status:    'ACTIVE',
      );
    }
  }

  Future<void> deleteUser(int id) async {
    try { await DioClient.delete(ApiConstants.superuserUser(id)); } catch (_) {}
  }

  Future<void> toggleStatus(int id) async {
    try { await DioClient.patch(ApiConstants.superuserToggleStatus(id)); } catch (_) {}
  }

  Future<List<AuditLogModel>> getAuditLogs() async {
    try {
      final res  = await DioClient.get(ApiConstants.superuserAuditLogs, params: {'limit': 20});
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) {
        return (data['data'] as List)
          .map((e) => AuditLogModel.fromJson(e as Map<String, dynamic>))
          .toList();
      }
      throw Exception();
    } catch (_) { return _demoAudit(); }
  }

  // ── Demo data ────────────────────────────────────────────
  Map<String, dynamic> _demoData() => {
    'stats': {'total': 8, 'students': 3, 'teachers': 3, 'admins': 1, 'superusers': 1},
  };

  List<UserListModel> _demoUsers() => [
    UserListModel(id:1, code:'SA001',    firstName:'Super',     lastName:'Admin',            email:'superadmin@unipamplona.edu.co',    role:'SUPERUSER', status:'ACTIVE'),
    UserListModel(id:2, code:'20231001', firstName:'Carlos',    lastName:'Estudiante Demo',  email:'estudiante@unipamplona.edu.co',    role:'STUDENT',   status:'ACTIVE'),
    UserListModel(id:3, code:'20231002', firstName:'Valeria',   lastName:'Ruiz Morales',     email:'valeria.ruiz@unipamplona.edu.co',  role:'STUDENT',   status:'ACTIVE'),
    UserListModel(id:4, code:'20231003', firstName:'Andrés',    lastName:'Mora Leal',        email:'andres.mora@unipamplona.edu.co',   role:'STUDENT',   status:'ACTIVE'),
    UserListModel(id:5, code:'T001',     firstName:'Juan',      lastName:'Pérez González',   email:'jperez@unipamplona.edu.co',        role:'TEACHER',   status:'ACTIVE'),
    UserListModel(id:6, code:'T002',     firstName:'María',     lastName:'Martínez Díaz',    email:'mmartinez@unipamplona.edu.co',     role:'TEACHER',   status:'ACTIVE'),
    UserListModel(id:7, code:'T003',     firstName:'Luis',      lastName:'Gómez Rueda',      email:'lgomez@unipamplona.edu.co',        role:'TEACHER',   status:'ACTIVE'),
    UserListModel(id:8, code:'ADM001',   firstName:'Secretaria',lastName:'Académica',        email:'secretaria@unipamplona.edu.co',    role:'ADMIN',     status:'ACTIVE'),
  ];

  List<AuditLogModel> _demoAudit() {
    final now = DateTime.now();
    return [
      AuditLogModel(id:1, createdAt:now.toIso8601String(),                             userName:'Super Admin',      action:'LOGIN',   detail:'Inicio de sesión exitoso',        ip:'192.168.1.100'),
      AuditLogModel(id:2, createdAt:now.subtract(const Duration(minutes:5)).toIso8601String(),  userName:'Super Admin',      action:'CREATE',  detail:'Usuario Carlos creado',           ip:'192.168.1.100'),
      AuditLogModel(id:3, createdAt:now.subtract(const Duration(minutes:10)).toIso8601String(), userName:'Super Admin',      action:'UPDATE',  detail:'Rol de usuario actualizado',      ip:'192.168.1.100'),
      AuditLogModel(id:4, createdAt:now.subtract(const Duration(minutes:15)).toIso8601String(), userName:'Juan Pérez',       action:'LOGIN',   detail:'Inicio de sesión como docente',   ip:'10.0.0.45'),
      AuditLogModel(id:5, createdAt:now.subtract(const Duration(minutes:20)).toIso8601String(), userName:'Carlos Estudiante',action:'LOGIN',   detail:'Acceso al portal estudiantil',    ip:'172.16.0.12'),
      AuditLogModel(id:6, createdAt:now.subtract(const Duration(minutes:30)).toIso8601String(), userName:'Super Admin',      action:'DISABLE', detail:'Usuario suspendido por inactividad',ip:'192.168.1.100'),
      AuditLogModel(id:7, createdAt:now.subtract(const Duration(hours:1)).toIso8601String(),    userName:'Super Admin',      action:'ENABLE',  detail:'Usuario reactivado',              ip:'192.168.1.100'),
      AuditLogModel(id:8, createdAt:now.subtract(const Duration(hours:2)).toIso8601String(),    userName:'María Martínez',   action:'LOGOUT',  detail:'Cierre de sesión',                ip:'10.0.0.55'),
    ];
  }
}