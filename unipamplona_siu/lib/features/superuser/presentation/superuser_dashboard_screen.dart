import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_drawer.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/skeleton_card.dart';
import '../../../features/auth/providers/session_provider.dart';
import '../providers/superuser_provider.dart';
import 'widgets/users_section.dart';
import 'widgets/audit_section.dart';

class SuperuserDashboardScreen extends ConsumerStatefulWidget {
  const SuperuserDashboardScreen({super.key});

  @override
  ConsumerState<SuperuserDashboardScreen> createState() => _SuperuserDashboardScreenState();
}

class _SuperuserDashboardScreenState extends ConsumerState<SuperuserDashboardScreen> {
  String _activeSection = 'inicio';

  static const _navItems = [
    AppDrawerItem(label: 'Resumen',           icon: Icons.grid_view_outlined,        section: 'inicio'),
    AppDrawerItem(label: 'Gestión usuarios',  icon: Icons.manage_accounts_outlined,  section: 'usuarios'),
    AppDrawerItem(label: 'Log de auditoría',  icon: Icons.history_outlined,          section: 'auditoria'),
  ];

  final _scrollController = ScrollController();
  final _sectionKeys = <String, GlobalKey>{
    'inicio':    GlobalKey(),
    'usuarios':  GlobalKey(),
    'auditoria': GlobalKey(),
  };

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToSection(String section) {
    Navigator.pop(context);
    setState(() => _activeSection = section);
    final key = _sectionKeys[section];
    if (key?.currentContext != null) {
      Scrollable.ensureVisible(key!.currentContext!,
        duration: const Duration(milliseconds: 400), curve: Curves.easeInOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session   = ref.watch(sessionProvider);
    final dashboard = ref.watch(superuserDashboardProvider);
    final auditLogs = ref.watch(auditLogsProvider);
    final user      = session?.user;

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      drawer: AppSidebar(
        items:         _navItems,
        activeSection: _activeSection,
        onSectionTap:  _scrollToSection,
      ),
      appBar: AppBar(
        backgroundColor: AppColors.surfaceCard,
        elevation: 0,
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu, color: AppColors.gray700),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        title: Row(children: [
          const Text('Admin', style: TextStyle(color: AppColors.gray500, fontSize: 13)),
          const Text(' / ',   style: TextStyle(color: AppColors.gray300, fontSize: 13)),
          Text(
            _navItems.firstWhere((i) => i.section == _activeSection,
              orElse: () => _navItems.first).label,
            style: const TextStyle(color: AppColors.gray900, fontWeight: FontWeight.w700, fontSize: 13),
          ),
        ]),
        actions: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.red700, AppColors.red500],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Center(child: Text(user.initials,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))),
              ),
            ),
        ],
      ),
      body: SingleChildScrollView(
        controller: _scrollController,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(key: _sectionKeys['inicio']),
            Text('Panel de Superadministrador',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 22, color: AppColors.gray900),
            ),
            const SizedBox(height: 4),
            Text('Gestión total del sistema · ${_today()}',
              style: const TextStyle(fontSize: 13, color: AppColors.gray500),
            ),
            const SizedBox(height: 20),

            // Stats
            dashboard.when(
              loading: () => GridView.count(
                crossAxisCount: 2, shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.2,
                children: List.generate(4, (_) => const SkeletonCard(height: 88)),
              ),
              error: (_, __) => const SizedBox(),
              data: (data) {
                final s = data['stats'] as Map<String, dynamic>;
                final items = [
                  (s['total'].toString(),                             'Total de usuarios',    Icons.people_outline,              StatCardColor.blue),
                  (s['students'].toString(),                          'Estudiantes',          Icons.school_outlined,             StatCardColor.green),
                  (s['teachers'].toString(),                          'Docentes activos',     Icons.person_outline,              StatCardColor.amber),
                  (((s['admins'] as int) + (s['superusers'] as int)).toString(), 'Admins y superusers', Icons.admin_panel_settings_outlined, StatCardColor.red),
                ];
                return GridView.count(
                  crossAxisCount: 2, shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.2,
                  children: items.map((e) => StatCard(value: e.$1, label: e.$2, icon: e.$3, color: e.$4)).toList(),
                );
              },
            ),
            const SizedBox(height: 20),

            // Usuarios
            Container(key: _sectionKeys['usuarios']),
            const UsersSection(),
            const SizedBox(height: 20),

            // Auditoría
            Container(key: _sectionKeys['auditoria']),
            auditLogs.when(
              loading: () => const SkeletonCard(height: 200),
              error:   (_, __) => const SizedBox(),
              data:    (logs) => AuditSection(logs: logs),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  String _today() {
    final now = DateTime.now();
    const months = ['enero','febrero','marzo','abril','mayo','junio',
                    'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return '${now.day} de ${months[now.month - 1]} de ${now.year}';
  }
}