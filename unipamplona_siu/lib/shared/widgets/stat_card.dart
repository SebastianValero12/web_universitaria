import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum StatCardColor { red, blue, green, amber }

class StatCard extends StatelessWidget {
  final String      value;
  final String      label;
  final IconData    icon;
  final StatCardColor color;

  const StatCard({
    super.key,
    required this.value,
    required this.label,
    required this.icon,
    this.color = StatCardColor.blue,
  });

  @override
  Widget build(BuildContext context) {
    final colors = _resolveColors();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border(left: BorderSide(color: colors.$1, width: 4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: colors.$2,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: colors.$1, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    color: AppColors.gray900,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.gray500,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  (Color, Color) _resolveColors() {
    switch (color) {
      case StatCardColor.red:
        return (AppColors.red700,   AppColors.red100);
      case StatCardColor.blue:
        return (AppColors.blue700,  AppColors.blue100);
      case StatCardColor.green:
        return (AppColors.success,  AppColors.successBg);
      case StatCardColor.amber:
        return (AppColors.warning,  AppColors.warningBg);
    }
  }
}