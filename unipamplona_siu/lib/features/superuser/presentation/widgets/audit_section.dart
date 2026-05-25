import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/models/audit_log_model.dart';
import '../../../../shared/widgets/dashboard_card.dart';

class AuditSection extends StatelessWidget {
  final List<AuditLogModel>? logs;
  const AuditSection({super.key, this.logs});

  @override
  Widget build(BuildContext context) {
    return DashboardCard(
      child: Column(
        children: [
          CardHeader(
            title: 'Log de auditoría',
            icon: Icons.history_outlined,
            trailing: logs != null
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.gray100, borderRadius: BorderRadius.circular(999)),
                  child: Text('${logs!.length} registros',
                    style: const TextStyle(fontSize: 11, color: AppColors.gray700, fontWeight: FontWeight.w600)),
                )
              : null,
          ),
          if (logs == null)
            const Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: logs!.length,
              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.gray100),
              itemBuilder: (_, i) => _logRow(logs![i]),
            ),
        ],
      ),
    );
  }

  Widget _logRow(AuditLogModel log) {
    final (bg, fg, label) = _resolveAction(log.action);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badge acción
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
            child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: fg)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(log.userName,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.gray900)),
              Text(log.detail,
                style: const TextStyle(fontSize: 11, color: AppColors.gray500), maxLines: 2, overflow: TextOverflow.ellipsis),
            ]),
          ),
          const SizedBox(width: 8),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(log.formattedDate,
              style: const TextStyle(fontSize: 10, color: AppColors.gray400)),
            Text(log.ip,
              style: const TextStyle(fontSize: 10, color: AppColors.gray400, fontFamily: 'monospace')),
          ]),
        ],
      ),
    );
  }

  (Color, Color, String) _resolveAction(String action) {
    switch (action) {
      case 'LOGIN':   return (AppColors.blue100,   AppColors.blue700,  'LOGIN');
      case 'LOGOUT':  return (AppColors.gray100,   AppColors.gray700,  'LOGOUT');
      case 'CREATE':  return (AppColors.successBg, AppColors.success,  'CREATE');
      case 'UPDATE':  return (AppColors.warningBg, AppColors.warning,  'UPDATE');
      case 'DELETE':  return (AppColors.red100,    AppColors.red700,   'DELETE');
      case 'DISABLE': return (AppColors.red100,    AppColors.red700,   'DISABLE');
      case 'ENABLE':  return (AppColors.successBg, AppColors.success,  'ENABLE');
      default:        return (AppColors.gray100,   AppColors.gray700,  action);
    }
  }
}