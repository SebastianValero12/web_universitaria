import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/teacher_repository.dart';

final teacherRepoProvider = Provider((_) => TeacherRepository());

final teacherDashboardProvider = FutureProvider<Map<String, dynamic>>(
  (ref) => ref.read(teacherRepoProvider).getDashboard(),
);

final groupStudentsProvider = FutureProvider.family<List<dynamic>, int>(
  (ref, groupId) => ref.read(teacherRepoProvider).getGroupStudents(groupId),
);