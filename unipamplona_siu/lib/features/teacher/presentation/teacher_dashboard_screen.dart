import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_drawer.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/skeleton_card.dart';
import '../../../shared/widgets/dashboard_card.dart';
import '../../../shared/widgets/app_snackbar.dart';
import '../../../features/auth/providers/session_provider.dart';
import '../providers/teacher_provider.dart';
import 'widgets/groups_section.dart';
import 'widgets/students_table.dart';
import 'widgets/grade_modal.dart';

class TeacherDashboardScreen extends ConsumerStatefulWidget {
  const TeacherDashboardScreen({super.key});

  @override
  ConsumerState<TeacherDashboardScreen> createState() => _TeacherDashboardScreenState();
}

class _TeacherDashboardScreenState extends ConsumerState<TeacherDashboardScreen> {
  String _activeSection = 'inicio';
  String _searchQuery   = '';
  Map<String, dynamic>? _selectedGroup;

  static const _navItems = [
    AppDrawerItem(label: 'Inicio',          icon: Icons.grid_view_outlined,      section: 'inicio'),
    AppDrawerItem(label: 'Mis grupos',      icon: Icons.groups_outlined,         section: 'grupos'),
    AppDrawerItem(label: 'Calificaciones',  icon: Icons.grade_outlined,          section: 'calificaciones'),
    AppDrawerItem(label: 'Mis estudiantes', icon: Icons.school_outlined,         section: 'estudiantes'),
  ];

  final _scrollController = ScrollController();
  final _sectionKeys = <String, GlobalKey>{
    'inicio':         GlobalKey(),
    'grupos':         GlobalKey(),
    'calificaciones': GlobalKey(),
    'estudiantes':    GlobalKey(),
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
    final dashboard = ref.watch(teacherDashboardProvider);
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
          const Text('Portal', style: TextStyle(color: AppColors.gray500, fontSize: 13)),
          const Text(' / ',    style: TextStyle(color: AppColors.gray300, fontSize: 13)),
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
                decoration: const BoxDecoration(color: AppColors.red700, shape: BoxShape.circle),
                child: Center(
                  child: Text(user.initials,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: dashboard.when(
        loading: () => _buildBody(context, null),
        error:   (_, __) => _buildBody(context, null),
        data:    (data)  => _buildBody(context, data),
      ),
    );
  }

  Widget _buildBody(BuildContext context, Map<String, dynamic>? data) {
    final user    = ref.watch(sessionProvider)?.user;
    final stats   = data?['stats']    as Map<String, dynamic>?;
    final groups  = data?['groups']   as List<dynamic>?;
    final students= data?['students'] as List<dynamic>?;

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(key: _sectionKeys['inicio']),
          Text('Bienvenido, ${user?.firstName ?? 'docente'}.',
            style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 22, color: AppColors.gray900),
          ),
          const SizedBox(height: 4),
          Text('Periodo 2025-I · ${_today()}',
            style: const TextStyle(fontSize: 13, color: AppColors.gray500),
          ),
          const SizedBox(height: 20),

          // Stats
          _buildStats(stats),
          const SizedBox(height: 20),

          // Grupos
          Container(key: _sectionKeys['grupos']),
          GroupsSection(
            groups: groups,
            onGroupTap: (g) {
              setState(() {
                _selectedGroup = g;
                _activeSection = 'calificaciones';
              });
              final key = _sectionKeys['calificaciones'];
              if (key?.currentContext != null) {
                Scrollable.ensureVisible(key!.currentContext!,
                  duration: const Duration(milliseconds: 400), curve: Curves.easeInOut);
              }
            },
          ),
          const SizedBox(height: 20),

          // Calificaciones
          Container(key: _sectionKeys['calificaciones']),
          _buildGradesSection(context),
          const SizedBox(height: 20),

          // Estudiantes
          Container(key: _sectionKeys['estudiantes']),
          _buildSearchBar(),
          const SizedBox(height: 12),
          StudentsTable(students: students, searchQuery: _searchQuery),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildStats(Map<String, dynamic>? stats) {
    if (stats == null) {
      return GridView.count(
        crossAxisCount: 2, shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.2,
        children: List.generate(4, (_) => const SkeletonCard(height: 88)),
      );
    }
    final items = [
      (stats['groups'].toString(),       'Grupos asignados',    Icons.groups_outlined,       StatCardColor.blue),
      (stats['students'].toString(),     'Estudiantes totales', Icons.school_outlined,        StatCardColor.green),
      (stats['gradesPending'].toString(),'Notas pendientes',    Icons.pending_outlined,       StatCardColor.amber),
      (stats['avgScore'].toString(),     'Promedio general',    Icons.trending_up_outlined,   StatCardColor.red),
    ];
    return GridView.count(
      crossAxisCount: 2, shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.2,
      children: items.map((e) => StatCard(value: e.$1, label: e.$2, icon: e.$3, color: e.$4)).toList(),
    );
  }

  Widget _buildGradesSection(BuildContext context) {
    final groupStudents = _selectedGroup != null
      ? ref.watch(groupStudentsProvider(_selectedGroup!['id'] as int))
      : null;

    return DashboardCard(
      child: Column(
        children: [
          CardHeader(
            title: 'Cargar calificaciones',
            icon: Icons.grade_outlined,
            trailing: _selectedGroup != null
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.blue100, borderRadius: BorderRadius.circular(999)),
                  child: Text(
                    '${_selectedGroup!['courseCode']}-${_selectedGroup!['code']}',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.blue700),
                  ),
                )
              : null,
          ),
          if (_selectedGroup == null)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Column(children: [
                Icon(Icons.touch_app_outlined, size: 40, color: AppColors.gray300),
                SizedBox(height: 12),
                Text('Selecciona un grupo arriba', style: TextStyle(color: AppColors.gray500)),
              ]),
            )
          else if (groupStudents == null)
            const Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())
          else
            groupStudents.when(
              loading: () => const Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()),
              error:   (_, __) => const Padding(padding: EdgeInsets.all(32),
                child: Text('Error al cargar estudiantes', style: TextStyle(color: AppColors.danger))),
              data: (students) => ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: students.length,
                separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.gray100),
                itemBuilder: (_, i) => _gradeRow(context, students[i] as Map<String, dynamic>),
              ),
            ),
        ],
      ),
    );
  }

  Widget _gradeRow(BuildContext context, Map<String, dynamic> s) {
    final score      = (s['score'] as num?)?.toDouble();
    final scoreColor = score == null ? AppColors.gray500
                     : score >= 3.5  ? AppColors.success
                     : score >= 3.0  ? AppColors.warning
                     : AppColors.danger;
    final initials = '${(s['firstName'] as String)[0]}${(s['lastName'] as String)[0]}'.toUpperCase();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: const BoxDecoration(color: AppColors.blue700, shape: BoxShape.circle),
            child: Center(child: Text(initials,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${s['firstName']} ${s['lastName']}',
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              Text(s['code'] as String,
                style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
            ]),
          ),
          Text(score != null ? score.toStringAsFixed(1) : '—',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: scoreColor)),
          const SizedBox(width: 8),
          TextButton(
            onPressed: () async {
              final result = await showGradeModal(context,
                studentName: '${s['firstName']} ${s['lastName']}',
                currentScore: score,
              );
              if (result != null && context.mounted) {
                showAppSnackbar(context,
                  title: 'Guardado', message: 'Calificación actualizada.', type: SnackType.success);
              }
            },
            child: const Text('Editar', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      onChanged: (v) => setState(() => _searchQuery = v),
      decoration: InputDecoration(
        hintText: 'Buscar estudiante...',
        prefixIcon: const Icon(Icons.search, size: 20),
        filled: true,
        fillColor: AppColors.surfaceCard,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.gray200)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.gray200)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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