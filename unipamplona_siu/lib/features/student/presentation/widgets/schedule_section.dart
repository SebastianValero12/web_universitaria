import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/models/schedule_model.dart';
import '../../../../shared/widgets/dashboard_card.dart';
import '../../../../shared/widgets/skeleton_card.dart';

class ScheduleSection extends StatelessWidget {
  final List<ScheduleModel>? schedule;
  const ScheduleSection({super.key, this.schedule});

  static const _days  = ['LUN','MAR','MIÉ','JUE','VIE'];
  static const _hours = ['07:00','08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

  @override
  Widget build(BuildContext context) {
    return DashboardCard(
      child: Column(
        children: [
          const CardHeader(title: 'Horario semanal', icon: Icons.calendar_today_outlined),
          if (schedule == null)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SkeletonCard(height: 180),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(16),
              child: _buildTable(),
            ),
        ],
      ),
    );
  }

  Widget _buildTable() {
    final map = <String, ScheduleModel>{};
    for (final s in schedule!) {
      map['${s.day}_${s.startTime}'] = s;
    }

    return Table(
      defaultColumnWidth: const FixedColumnWidth(90),
      columnWidths: const {0: FixedColumnWidth(52)},
      border: TableBorder.all(color: AppColors.gray100, width: 0.5),
      children: [
        TableRow(
          decoration: const BoxDecoration(color: AppColors.blue700),
          children: [
            _headerCell(''),
            ..._days.map(_headerCell),
          ],
        ),
        ..._hours.map((hour) => TableRow(
          children: [
            _hourCell(hour),
            ..._days.map((day) {
              final item = map['${day}_$hour'];
              return item != null ? _classCell(item) : _emptyCell();
            }),
          ],
        )),
      ],
    );
  }

  Widget _headerCell(String text) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
    child: Text(
      text,
      textAlign: TextAlign.center,
      style: const TextStyle(
        color: Colors.white,
        fontWeight: FontWeight.w700,
        fontSize: 11,
      ),
    ),
  );

  Widget _hourCell(String hour) => Container(
    color: AppColors.gray50,
    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
    child: Text(
      hour,
      textAlign: TextAlign.center,
      style: const TextStyle(
        fontSize: 9,
        color: Color(0xFF5A5A5A),
        fontWeight: FontWeight.w600,
      ),
    ),
  );

  Widget _emptyCell() => const SizedBox(height: 44);

  Widget _classCell(ScheduleModel s) {
    final (bg, fg) = _blockColors(s.color);
    return Container(
      margin: const EdgeInsets.all(2),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            s.courseName,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: fg,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (s.room.isNotEmpty)
            Text(
              s.room,
              style: TextStyle(
                fontSize: 8,
                color: fg.withValues(alpha: 0.75),
              ),
            ),
        ],
      ),
    );
  }

  (Color, Color) _blockColors(String color) {
    switch (color) {
      case 'green':  return (AppColors.successBg,          AppColors.success);
      case 'red':    return (AppColors.red100,              AppColors.red700);
      case 'amber':  return (AppColors.warningBg,           AppColors.warning);
      case 'indigo': return (const Color(0xFFEDE9FE),       const Color(0xFF4C1D95));
      default:       return (AppColors.blue100,             AppColors.blue700);
    }
  }
}