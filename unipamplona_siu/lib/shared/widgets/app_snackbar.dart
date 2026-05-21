import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum SnackType { success, error, warning, info }

void showAppSnackbar(
  BuildContext context, {
  required String message,
  SnackType type  = SnackType.success,
  String?   title,
}) {
  final (icon, color, bg) = _resolve(type);

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      duration: const Duration(seconds: 4),
      content: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(12),
          border: Border(left: BorderSide(color: color, width: 4)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.12),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (title != null)
                    Text(title,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: AppColors.gray900,
                      ),
                    ),
                  Text(message,
                    style: const TextStyle(fontSize: 12, color: AppColors.gray700),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

(IconData, Color, Color) _resolve(SnackType type) {
  switch (type) {
    case SnackType.success:
      return (Icons.check_circle_outline, AppColors.success, AppColors.successBg);
    case SnackType.error:
      return (Icons.error_outline, AppColors.danger, AppColors.dangerBg);
    case SnackType.warning:
      return (Icons.warning_amber_outlined, AppColors.warning, AppColors.warningBg);
    case SnackType.info:
      return (Icons.info_outline, AppColors.blue700, AppColors.blue50);
  }
}