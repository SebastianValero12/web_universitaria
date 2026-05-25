import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/dashboard_card.dart';

class GroupsSection extends StatelessWidget {
  final List<dynamic>?              groups;
  final void Function(Map<String,dynamic>) onGroupTap;

  const GroupsSection({super.key, this.groups, required this.onGroupTap});

  @override
  Widget build(BuildContext context) {
    return DashboardCard(
      child: Column(
        children: [
          CardHeader(
            title: 'Mis grupos',
            icon: Icons.groups_outlined,
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.blue100,
                borderRadius: BorderRadius.circular(999),
              ),
              child: const Text('2025-I',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.blue700),
              ),
            ),
          ),
          if (groups == null)
            const Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())
          else if (groups!.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Text('Sin grupos asignados', style: TextStyle(color: AppColors.gray500)),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: groups!.length,
              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.gray100),
              itemBuilder: (_, i) => _groupItem(groups![i] as Map<String, dynamic>),
            ),
        ],
      ),
    );
  }

  Widget _groupItem(Map<String, dynamic> g) {
    return InkWell(
      onTap: () => onGroupTap(g),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: AppColors.blue100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(g['code'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.blue700, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(g['courseName'] as String,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.gray900),
                  ),
                  Text('${g['courseCode']} · Aula ${g['room']}',
                    style: const TextStyle(fontSize: 11, color: AppColors.gray500),
                  ),
                ],
              ),
            ),
            Text('${g['studentCount']} est.',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.blue700),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, size: 18, color: AppColors.gray300),
          ],
        ),
      ),
    );
  }
}