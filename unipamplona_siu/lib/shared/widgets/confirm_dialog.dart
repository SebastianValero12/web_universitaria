import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum ConfirmType { danger, warning, success }

Future<bool> showConfirmDialog(
  BuildContext context, {
  required String  message,
  String           title       = 'Confirmar acción',
  String           confirmText = 'Confirmar',
  ConfirmType      type        = ConfirmType.danger,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (_) => _ConfirmDialog(
      title:       title,
      message:     message,
      confirmText: confirmText,
      type:        type,
    ),
  );
  return result ?? false;
}

class _ConfirmDialog extends StatelessWidget {
  final String      title;
  final String      message;
  final String      confirmText;
  final ConfirmType type;

  const _ConfirmDialog({
    required this.title,
    required this.message,
    required this.confirmText,
    required this.type,
  });

  @override
  Widget build(BuildContext context) {
    final (iconData, iconBg, iconFg, btnColor) = _resolveColors();

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
            child: Icon(iconData, color: iconFg, size: 28),
          ),
          const SizedBox(height: 16),
          Text(title,
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(message,
            style: const TextStyle(color: AppColors.gray700, fontSize: 13, height: 1.5),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context, false),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.gray300),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Cancelar',
                    style: TextStyle(color: AppColors.gray700, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context, true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: btnColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                  ),
                  child: Text(confirmText,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  (IconData, Color, Color, Color) _resolveColors() {
    switch (type) {
      case ConfirmType.danger:
        return (Icons.delete_outline, AppColors.red100, AppColors.red700, AppColors.red700);
      case ConfirmType.warning:
        return (Icons.warning_amber_outlined, AppColors.warningBg, AppColors.warning, AppColors.warning);
      case ConfirmType.success:
        return (Icons.check_circle_outline, AppColors.successBg, AppColors.success, AppColors.success);
    }
  }
}