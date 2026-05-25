import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/dashboard_card.dart';
import '../../../../shared/widgets/app_snackbar.dart';
import 'grade_modal.dart';

class StudentsTable extends ConsumerWidget {
  final List<dynamic>? students;
  final String         searchQuery;

  const StudentsTable({super.key, this.students, required this.searchQuery});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filtered = _filter();

    return DashboardCard(
      child: Column(
        children: [
          const CardHeader(title: 'Mis estudiantes', icon: Icons.school_outlined),
          if (filtered == null)
            const Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())
          else if (filtered.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Text('Sin resultados', style: TextStyle(color: AppColors.gray500)),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.gray100),
              itemBuilder: (_, i) => _studentRow(context, filtered[i] as Map<String, dynamic>),
            ),
        ],
      ),
    );
  }

  List<dynamic>? _filter() {
    if (students == null) return null;
    if (searchQuery.isEmpty) return students;
    final q = searchQuery.toLowerCase();
    return students!.where((s) {
      final m = s as Map<String, dynamic>;
      return '${m['firstName']} ${m['lastName']}'.toLowerCase().contains(q)
          || (m['code'] as String).toLowerCase().contains(q)
          || (m['groupCode'] as String? ?? '').toLowerCase().contains(q);
    }).toList();
  }

  Widget _studentRow(BuildContext context, Map<String, dynamic> s) {
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
            child: Center(
              child: Text(initials,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${s['firstName']} ${s['lastName']}',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                Text('${s['code']} · ${s['groupCode'] ?? '—'}',
                  style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
              ],
            ),
          ),
          Text(
            score != null ? score.toStringAsFixed(1) : '—',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: scoreColor),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.gray500),
            onPressed: () async {
              final result = await showGradeModal(
                context,
                studentName:  '${s['firstName']} ${s['lastName']}',
                currentScore: score,
              );
              if (result != null && context.mounted) {
                showAppSnackbar(context,
                  title:   'Guardado',
                  message: 'Calificación actualizada correctamente.',
                  type:    SnackType.success,
                );
              }
            },
          ),
        ],
      ),
    );
  }
}