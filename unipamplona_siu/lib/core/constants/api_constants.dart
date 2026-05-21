class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'http://localhost:3000/api/v1';

  // Auth
  static const String loginStudent = '/auth/login/student';
  static const String loginAdmin   = '/auth/login/admin';
  static const String logout       = '/auth/logout';
  static const String me           = '/auth/me';

  // Student
  static const String studentDashboard     = '/student/dashboard';
  static const String studentSchedule      = '/student/schedule';
  static const String studentGrades        = '/student/grades';
  static const String studentAnnouncements = '/student/announcements';
  static const String studentProfile       = '/student/profile';
  static const String studentCertificates  = '/student/certificates';
  static const String studentPqrs          = '/student/pqrs';

  // Teacher
  static const String teacherDashboard = '/teacher/dashboard';
  static const String teacherGroups    = '/teacher/groups';
  static String teacherGroupStudents(int id) => '/teacher/groups/$id/students';
  static String teacherGrade(int id)          => '/teacher/grades/$id';

  // Admin
  static const String adminDashboard = '/admin/dashboard';
  static const String adminStudents  = '/admin/students';

  // Superuser
  static const String superuserDashboard = '/superuser/dashboard';
  static const String superuserUsers     = '/superuser/users';
  static const String superuserAuditLogs = '/superuser/audit-logs';
  static String superuserUser(int id)         => '/superuser/users/$id';
  static String superuserToggleStatus(int id) => '/superuser/users/$id/toggle-status';

  // Storage keys
  static const String tokenKey = 'siu_token';
  static const String userKey  = 'siu_user';
}