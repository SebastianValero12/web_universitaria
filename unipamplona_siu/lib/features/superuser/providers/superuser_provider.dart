import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/superuser_repository.dart';
import '../domain/user_list_model.dart';
import '../../../shared/models/audit_log_model.dart';

final superuserRepoProvider = Provider((_) => SuperuserRepository());

// Dashboard stats
final superuserDashboardProvider = FutureProvider<Map<String, dynamic>>(
  (ref) => ref.read(superuserRepoProvider).getDashboard(),
);

// Audit logs
final auditLogsProvider = FutureProvider<List<AuditLogModel>>(
  (ref) => ref.read(superuserRepoProvider).getAuditLogs(),
);

// Estado de usuarios con CRUD
class UsersState {
  final List<UserListModel> all;
  final List<UserListModel> filtered;
  final int                 currentPage;
  final String              searchQuery;
  final String              roleFilter;
  final String              statusFilter;

  static const int perPage = 8;

  const UsersState({
    this.all           = const [],
    this.filtered      = const [],
    this.currentPage   = 1,
    this.searchQuery   = '',
    this.roleFilter    = '',
    this.statusFilter  = '',
  });

  int get totalPages => (filtered.length / perPage).ceil().clamp(1, 999);

  List<UserListModel> get pageUsers {
    final start = (currentPage - 1) * perPage;
    final end   = (start + perPage).clamp(0, filtered.length);
    return filtered.sublist(start, end);
  }

  UsersState copyWith({
    List<UserListModel>? all,
    List<UserListModel>? filtered,
    int?    currentPage,
    String? searchQuery,
    String? roleFilter,
    String? statusFilter,
  }) => UsersState(
    all:          all          ?? this.all,
    filtered:     filtered     ?? this.filtered,
    currentPage:  currentPage  ?? this.currentPage,
    searchQuery:  searchQuery  ?? this.searchQuery,
    roleFilter:   roleFilter   ?? this.roleFilter,
    statusFilter: statusFilter ?? this.statusFilter,
  );
}

class UsersNotifier extends StateNotifier<UsersState> {
  final SuperuserRepository _repo;

  UsersNotifier(this._repo) : super(const UsersState()) {
    load();
  }

  Future<void> load() async {
    final users = await _repo.getUsers();
    state = state.copyWith(all: users, filtered: users, currentPage: 1);
  }

  void applyFilters({String? search, String? role, String? status}) {
    final q  = search ?? state.searchQuery;
    final r  = role   ?? state.roleFilter;
    final s  = status ?? state.statusFilter;

    final filtered = state.all.where((u) {
      final matchQ = q.isEmpty || u.fullName.toLowerCase().contains(q.toLowerCase())
                  || u.email.toLowerCase().contains(q.toLowerCase())
                  || u.code.toLowerCase().contains(q.toLowerCase());
      final matchR = r.isEmpty || u.role   == r;
      final matchS = s.isEmpty || u.status == s;
      return matchQ && matchR && matchS;
    }).toList();

    state = state.copyWith(
      filtered:    filtered,
      currentPage: 1,
      searchQuery: q,
      roleFilter:  r,
      statusFilter: s,
    );
  }

  void goPage(int page) => state = state.copyWith(currentPage: page);

  Future<UserListModel> createUser(Map<String, dynamic> payload) async {
    final user = await _repo.createUser(payload);
    final updated = [user, ...state.all];
    state = state.copyWith(all: updated);
    applyFilters();
    return user;
  }

  Future<void> updateUser(int id, Map<String, dynamic> payload) async {
    final updated = await _repo.updateUser(id, payload);
    final list = state.all.map((u) => u.id == id ? updated : u).toList();
    state = state.copyWith(all: list);
    applyFilters();
  }

  Future<void> deleteUser(int id) async {
    await _repo.deleteUser(id);
    final list = state.all.where((u) => u.id != id).toList();
    state = state.copyWith(all: list);
    applyFilters();
  }

  Future<void> toggleStatus(int id) async {
    await _repo.toggleStatus(id);
    final list = state.all.map((u) {
      if (u.id != id) return u;
      return u.copyWith(status: u.status == 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
    }).toList();
    state = state.copyWith(all: list);
    applyFilters();
  }
}

final usersProvider = StateNotifierProvider<UsersNotifier, UsersState>(
  (ref) => UsersNotifier(ref.read(superuserRepoProvider)),
);