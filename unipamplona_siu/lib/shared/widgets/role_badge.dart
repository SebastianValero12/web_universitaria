import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class RoleBadge extends StatelessWidget {
  final String role;
  const RoleBadge({super.key, required this.role});

  @override
  Widget build(BuildContext context) {
    final (label, bg, fg) = _resolve();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: fg,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  (String, Color, Color) _resolve() {
    switch (role) {
      case 'STUDENT':   return ('Estudiante', AppColors.blue100,      AppColors.blue700);
      case 'TEACHER':   return ('Docente',    AppColors.successBg,    AppColors.success);
      case 'ADMIN':     return ('Admin',      AppColors.warningBg,    AppColors.warning);
      case 'SUPERUSER': return ('Superuser',  AppColors.red100,       AppColors.red700);
      default:          return (role,         AppColors.gray100,      AppColors.gray700);
    }
  }
}

class StatusBadge extends StatelessWidget {
  final String status;
  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = _resolve();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 7, height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }

  (String, Color) _resolve() {
    switch (status) {
      case 'ACTIVE':    return ('Activo',     AppColors.success);
      case 'INACTIVE':  return ('Inactivo',   AppColors.gray500);
      case 'SUSPENDED': return ('Suspendido', AppColors.danger);
      default:          return (status,       AppColors.gray500);
    }
  }
}