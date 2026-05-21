import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/session_storage.dart';
import '../domain/session_model.dart';
import '../domain/user_model.dart';

class AuthRepository {
  // Login estudiante
  Future<SessionModel> loginStudent(String email, String password) async {
    return _login(ApiConstants.loginStudent, email, password);
  }

  // Login admin / docente / superuser
  Future<SessionModel> loginAdmin(String email, String password) async {
    return _login(ApiConstants.loginAdmin, email, password);
  }

  Future<SessionModel> _login(String endpoint, String email, String password) async {
  // ── DEMO FALLBACK ──────────────────────────────────────────
  final demoUsers = {
    'estudiante@unipamplona.edu.co': {
      'password': 'Estudiante@2025',
      'user': {'id':2,'code':'20231001','firstName':'Carlos','lastName':'Estudiante Demo',
               'email':'estudiante@unipamplona.edu.co','role':'STUDENT','status':'ACTIVE'},
    },
    'jperez@unipamplona.edu.co': {
      'password': 'Docente@2025',
      'user': {'id':5,'code':'T001','firstName':'Juan','lastName':'Pérez González',
               'email':'jperez@unipamplona.edu.co','role':'TEACHER','status':'ACTIVE'},
    },
    'secretaria@unipamplona.edu.co': {
      'password': 'Admin@2025',
      'user': {'id':8,'code':'ADM001','firstName':'Secretaria','lastName':'Académica',
               'email':'secretaria@unipamplona.edu.co','role':'ADMIN','status':'ACTIVE'},
    },
    'superadmin@unipamplona.edu.co': {
      'password': 'Super@2025',
      'user': {'id':1,'code':'SA001','firstName':'Super','lastName':'Admin',
               'email':'superadmin@unipamplona.edu.co','role':'SUPERUSER','status':'ACTIVE'},
    },
  };

  final entry = demoUsers[email.toLowerCase()];
  if (entry != null && entry['password'] == password) {
    final session = SessionModel(
      token: 'demo-token-${DateTime.now().millisecondsSinceEpoch}',
      user:  UserModel.fromJson(entry['user'] as Map<String, dynamic>),
    );
    await SessionStorage.saveToken(session.token);
    await SessionStorage.saveUser(session.user.toJson());
    return session;
  }

  // ── INTENTO REAL (si backend disponible) ──────────────────
  try {
    final res = await DioClient.post(endpoint, data: {
      'email':    email,
      'password': password,
    });
    final data = res.data as Map<String, dynamic>;
    if (data['ok'] != true) {
      throw Exception(data['error'] ?? 'Credenciales incorrectas.');
    }
    final session = SessionModel.fromJson(data['data'] as Map<String, dynamic>);
    await SessionStorage.saveToken(session.token);
    await SessionStorage.saveUser(session.user.toJson());
    return session;
  } on DioException catch (e) {
    final msg = e.response?.data?['error'] ?? 'Credenciales incorrectas.';
    throw Exception(msg);
  }
}

  // Logout
  Future<void> logout() async {
    try {
      await DioClient.post(ApiConstants.logout);
    } catch (_) {}
    await SessionStorage.clear();
  }

  // Restaurar sesión desde storage
  Future<SessionModel?> restoreSession() async {
    final token = await SessionStorage.getToken();
    final user  = await SessionStorage.getUser();
    if (token == null || user == null) return null;
    return SessionModel(
      token: token,
      user:  UserModel.fromJson(user),
    );
  }
}