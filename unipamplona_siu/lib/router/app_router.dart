import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/providers/session_provider.dart';
import '../features/student/presentation/student_dashboard_screen.dart';
import '../features/teacher/presentation/teacher_dashboard_screen.dart';
import '../features/superuser/presentation/superuser_dashboard_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(sessionProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final loggedIn = session != null;
      final onLogin  = state.matchedLocation == '/';
      if (!loggedIn && !onLogin) return '/';
      if (loggedIn  &&  onLogin) return homeForRole(session.user.role);
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/student',
        builder: (context, state) => const StudentDashboardScreen(),
      ),
      GoRoute(
        path: '/teacher',
        builder: (context, state) => const TeacherDashboardScreen(),
      ),
      GoRoute(
        path: '/superuser',
        builder: (context, state) => const SuperuserDashboardScreen(),
      ),
    ],
  );
});