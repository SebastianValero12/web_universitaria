import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/dashboard_card.dart';

class NoticesSection extends StatelessWidget {
  final List<dynamic>? notices;
  const NoticesSection({super.key, this.notices});

  @override
  Widget build(BuildContext context) {
    return DashboardCard(
      child: Column(
        children: [
          CardHeader(
            title: 'Avisos y anuncios',
            icon: Icons.notifications_outlined,
            trailing: notices != null
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.red100,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '${notices!.where((n) => n['unread'] == true).length} nuevos',
                    style: const TextStyle(fontSize: 11, color: AppColors.red700, fontWeight: FontWeight.w700),
                  ),
                )
              : null,
          ),
          if (notices == null)
            const Padding(padding: EdgeInsets.all(32),
              child: CircularProgressIndicator())
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: notices!.length,
              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.gray100),
              itemBuilder: (_, i) => _noticeItem(notices![i] as Map<String, dynamic>),
            ),
        ],
      ),
    );
  }

  Widget _noticeItem(Map<String, dynamic> n) {
    final unread = n['unread'] == true;
    final type   = n['type'] as String? ?? 'blue';
    final (iconData, iconBg, iconFg) = _resolveType(type);

    return Container(
      decoration: BoxDecoration(
        color: unread ? AppColors.blue50 : Colors.transparent,
        border: unread
          ? const Border(left: BorderSide(color: AppColors.blue700, width: 3))
          : null,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)),
            child: Icon(iconData, size: 18, color: iconFg),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(n['title'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.gray900),
                ),
                const SizedBox(height: 2),
                Text(n['body'] as String,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12, color: AppColors.gray500, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(n['date'] as String? ?? '',
            style: const TextStyle(fontSize: 11, color: AppColors.gray400),
          ),
        ],
      ),
    );
  }

  (IconData, Color, Color) _resolveType(String type) {
    switch (type) {
      case 'red':   return (Icons.error_outline,   AppColors.red100,    AppColors.red700);
      case 'green': return (Icons.check_circle_outline, AppColors.successBg, AppColors.success);
      case 'amber': return (Icons.warning_amber_outlined, AppColors.warningBg, AppColors.warning);
      default:      return (Icons.info_outline,    AppColors.blue100,   AppColors.blue700);
    }
  }
}