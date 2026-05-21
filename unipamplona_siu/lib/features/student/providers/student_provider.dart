import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/student_repository.dart';
import '../../../shared/models/grade_model.dart';
import '../../../shared/models/schedule_model.dart';

final studentRepoProvider = Provider((_) => StudentRepository());

final studentDashboardProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.read(studentRepoProvider).getDashboard();
});