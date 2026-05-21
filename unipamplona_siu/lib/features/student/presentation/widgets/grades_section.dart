import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/models/grade_model.dart';
import '../../../../shared/widgets/dashboard_card.dart';
import '../../../../shared/widgets/skeleton_card.dart';

class GradesSection extends StatelessWidget {
  final List<GradeModel>? grades;
  const GradesSection({super.key, this.grades});

  static const _colors = [
    AppColors.red700, AppColors.blue700, AppColors.warning,
    Color(0xFF4C1D95), Color(0xFF9D174D), AppColors.success,
  ];

  @override
  Widget build(BuildContext context) {
    return DashboardCard(
      child: Column(
        children: [
          const CardHeader(title: 'Calificaciones', icon: Icons.description_outlined),
          if (grades == null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: List.generate(3, (i) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: SkeletonCard(height: 56),
                )),
              ),
            )
          else if (grades!.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Text('Sin calificaciones registradas',
                style: TextStyle(color: AppColors.gray500),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: grades!.length,
              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.gray100),
              itemBuilder: (_, i) => _gradeItem(grades![i], i),
            ),
        ],
      ),
    );
  }

  Widget _gradeItem(GradeModel g, int index) {
    final score     = g.score;
    final barColor  = score == null ? AppColors.gray300
                    : score >= 3.5  ? AppColors.success
                    : score >= 3.0  ? AppColors.warning
                    : AppColors.danger;
    final scoreColor = score == null ? AppColors.gray500
                     : score >= 3.5  ? AppColors.success
                     : score >= 3.0  ? AppColors.warning
                     : AppColors.danger;
    final pct = score != null ? (score / 5.0).clamp(0.0, 1.0) : 0.0;
    final accent = _colors[index % _colors.length];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(width: 5, height: 42, decoration: BoxDecoration(
            color: accent, borderRadius: BorderRadius.circular(999),
          )),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(g.name,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.gray900),
                  maxLines: 1, overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text('${g.code} · ${g.credits} créditos',
                  style: const TextStyle(fontSize: 11, color: AppColors.gray500),
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: pct,
                    backgroundColor: AppColors.gray100,
                    valueColor: AlwaysStoppedAnimation(barColor),
                    minHeight: 5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Text(
            score != null ? score.toStringAsFixed(1) : '—',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: scoreColor),
          ),
        ],
      ),
    );
  }
}