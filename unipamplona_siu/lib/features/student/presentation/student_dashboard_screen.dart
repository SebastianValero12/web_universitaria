import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/grade_model.dart';
import '../../../shared/models/schedule_model.dart';
import '../../../shared/widgets/app_drawer.dart';
import '../../../shared/widgets/app_snackbar.dart';
import '../../../features/auth/providers/session_provider.dart';
import '../providers/student_provider.dart';
import 'widgets/stats_grid.dart';
import 'widgets/schedule_section.dart';
import 'widgets/grades_section.dart';
import 'widgets/progress_section.dart';
import 'widgets/notices_section.dart';

class StudentDashboardScreen extends ConsumerStatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  ConsumerState<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends ConsumerState<StudentDashboardScreen> {
  String _activeSection = 'inicio';

  static const _navItems = [
    AppDrawerItem(label: 'Inicio',          icon: Icons.grid_view_outlined,        section: 'inicio'),
    AppDrawerItem(label: 'Horario',         icon: Icons.calendar_today_outlined,   section: 'horario'),
    AppDrawerItem(label: 'Calificaciones',  icon: Icons.description_outlined,      section: 'calificaciones'),
    AppDrawerItem(label: 'Progreso',        icon: Icons.timeline_outlined,         section: 'progreso'),
    AppDrawerItem(label: 'Avisos',          icon: Icons.notifications_outlined,    section: 'avisos'),
    AppDrawerItem(label: 'Certificados',    icon: Icons.workspace_premium_outlined, section: 'certificados'),
    AppDrawerItem(label: 'PQRS',            icon: Icons.chat_outlined,             section: 'pqrs'),
  ];

  final _scrollController = ScrollController();
  final _sectionKeys = <String, GlobalKey>{
    'inicio':         GlobalKey(),
    'horario':        GlobalKey(),
    'calificaciones': GlobalKey(),
    'progreso':       GlobalKey(),
    'avisos':         GlobalKey(),
    'certificados':   GlobalKey(),
    'pqrs':           GlobalKey(),
  };

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToSection(String section) {
    Navigator.pop(context); // cerrar drawer
    setState(() => _activeSection = section);
    final key = _sectionKeys[section];
    if (key?.currentContext != null) {
      Scrollable.ensureVisible(
        key!.currentContext!,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final session   = ref.watch(sessionProvider);
    final dashboard = ref.watch(studentDashboardProvider);
    final user      = session?.user;

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      drawer: AppSidebar(
        items:          _navItems,
        activeSection:  _activeSection,
        onSectionTap:   _scrollToSection,
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
        title: Row(
          children: [
            const Text('Portal', style: TextStyle(color: AppColors.gray500, fontSize: 13)),
            const Text(' / ', style: TextStyle(color: AppColors.gray300, fontSize: 13)),
            Text(
              _navItems.firstWhere((i) => i.section == _activeSection, orElse: () => _navItems.first).label,
              style: const TextStyle(color: AppColors.gray900, fontWeight: FontWeight.w700, fontSize: 13),
            ),
          ],
        ),
        actions: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Container(
                width: 32, height: 32,
                decoration: const BoxDecoration(
                  color: AppColors.blue700,
                  shape: BoxShape.circle,
                ),
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
    final user     = ref.watch(sessionProvider)?.user;
    final stats    = data?['stats']    as Map<String, dynamic>?;
    final rawSched = data?['schedule'] as List<dynamic>?;
    final rawGrades= data?['grades']   as List<dynamic>?;
    final progress = data?['progress'] as Map<String, dynamic>?;
    final notices  = data?['announcements'] as List<dynamic>?;

    final schedule = rawSched?.map((e) =>
      ScheduleModel.fromJson(e as Map<String, dynamic>)).toList();
    final grades   = rawGrades?.map((e) =>
      GradeModel.fromJson(e as Map<String, dynamic>)).toList();

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(key: _sectionKeys['inicio']),
          Text(
            'Bienvenido, ${user?.firstName ?? 'estudiante'}.',
            style: Theme.of(context).textTheme.displayMedium?.copyWith(
              fontSize: 22, color: AppColors.gray900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Periodo académico 2025-I · ${_today()}',
            style: const TextStyle(fontSize: 13, color: AppColors.gray500),
          ),
          const SizedBox(height: 20),

          // Stats
          StudentStatsGrid(stats: stats),
          const SizedBox(height: 20),

          // Horario
          Container(key: _sectionKeys['horario']),
          ScheduleSection(schedule: schedule),
          const SizedBox(height: 20),

          // Calificaciones + Progreso
          Container(key: _sectionKeys['calificaciones']),
          LayoutBuilder(builder: (ctx, constraints) {
            if (constraints.maxWidth >= 700) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 5, child: GradesSection(grades: grades)),
                  const SizedBox(width: 16),
                  Container(
                    key: _sectionKeys['progreso'],
                    width: 300,
                    child: ProgressSection(progress: progress),
                  ),
                ],
              );
            }
            return Column(
              children: [
                GradesSection(grades: grades),
                const SizedBox(height: 16),
                Container(key: _sectionKeys['progreso']),
                ProgressSection(progress: progress),
              ],
            );
          }),
          const SizedBox(height: 20),

          // Avisos
          Container(key: _sectionKeys['avisos']),
          NoticesSection(notices: notices),
          const SizedBox(height: 20),

          // Certificados
          Container(key: _sectionKeys['certificados']),
          _emptySection(
            icon:  Icons.workspace_premium_outlined,
            title: 'No tienes certificados aún',
            body:  'Solicita un certificado de estudio o calificaciones.',
            buttonLabel: 'Solicitar certificado',
            onTap: () => showAppSnackbar(context,
              message: 'Funcionalidad disponible próximamente.',
              type: SnackType.info,
            ),
          ),
          const SizedBox(height: 20),

          // PQRS
          Container(key: _sectionKeys['pqrs']),
          _emptySection(
            icon:  Icons.chat_outlined,
            title: 'Sin solicitudes activas',
            body:  'No tienes PQRS registradas en el periodo actual.',
            buttonLabel: 'Nueva PQRS',
            onTap: () => showAppSnackbar(context,
              message: 'Funcionalidad disponible próximamente.',
              type: SnackType.info,
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _emptySection({
    required IconData icon,
    required String   title,
    required String   body,
    required String   buttonLabel,
    required VoidCallback onTap,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: AppColors.gray300),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.gray700)),
          const SizedBox(height: 6),
          Text(body,  style: const TextStyle(fontSize: 13, color: AppColors.gray500), textAlign: TextAlign.center),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: onTap, child: Text(buttonLabel)),
        ],
      ),
    );
  }

  String _today() {
    final now = DateTime.now();
    const days   = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return '${days[now.weekday - 1]}, ${now.day} de ${months[now.month - 1]} de ${now.year}';
  }
}