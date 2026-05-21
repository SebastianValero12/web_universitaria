import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';
import '../domain/session_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepository());

// Sesión activa (null = no autenticado)
final sessionProvider = StateNotifierProvider<SessionNotifier, SessionModel?>(
  (ref) => SessionNotifier(ref.read(authRepositoryProvider)),
);

class SessionNotifier extends StateNotifier<SessionModel?> {
  final AuthRepository _repo;

  SessionNotifier(this._repo) : super(null) {
    _restore();
  }

  // Restaurar sesión al iniciar la app
  Future<void> _restore() async {
    state = await _repo.restoreSession();
  }

  Future<void> loginStudent(String email, String password) async {
    state = await _repo.loginStudent(email, password);
  }

  Future<void> loginAdmin(String email, String password) async {
    state = await _repo.loginAdmin(email, password);
  }

  Future<void> logout() async {
    await _repo.logout();
    state = null;
  }
}

// Helper: home route según rol
String homeForRole(String role) {
  switch (role) {
    case 'STUDENT':   return '/student';
    case 'TEACHER':
    case 'ADMIN':     return '/teacher';
    case 'SUPERUSER': return '/superuser';
    default:          return '/';
  }
}