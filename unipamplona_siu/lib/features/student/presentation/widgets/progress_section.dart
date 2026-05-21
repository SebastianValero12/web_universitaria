import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/dashboard_card.dart';

class ProgressSection extends StatelessWidget {
  final Map<String, dynamic>? progress;
  const ProgressSection({super.key, this.progress});

  @override
  Widget build(BuildContext context) {
    return DashboardCard(
      child: Column(
        children: [
          const CardHeader(title: 'Progreso académico', icon: Icons.timeline_outlined),
          Padding(
            padding: const EdgeInsets.all(20),
            child: progress == null
              ? const Center(child: CircularProgressIndicator())
              : _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final completed = (progress!['creditsCompleted'] as num).toInt();
    final total     = (progress!['creditsTotal']     as num).toInt();
    final semComp   = (progress!['semestersCompleted'] as num).toInt();
    final semTotal  = (progress!['semestersTotal']     as num).toInt();
    final gpa       = progress!['gpa'].toString();
    final pct       = total > 0 ? completed / total : 0.0;

    return Column(
      children: [
        SizedBox(
          width: 160, height: 160,
          child: CustomPaint(
            painter: _DonutPainter(progress: pct),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('${(pct * 100).round()}%',
                    style: const TextStyle(
                      fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.gray900,
                    ),
                  ),
                  const Text('completado',
                    style: TextStyle(fontSize: 11, color: AppColors.gray500),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        _row('Créditos cursados',   '$completed / $total'),
        const SizedBox(height: 10),
        _row('Semestres cursados',  '$semComp / $semTotal'),
        const SizedBox(height: 10),
        _row('Promedio acumulado',  gpa, highlight: true),
      ],
    );
  }

  Widget _row(String label, String value, {bool highlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.gray700, fontWeight: FontWeight.w600)),
        Text(value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: highlight ? AppColors.blue700 : AppColors.gray900,
          ),
        ),
      ],
    );
  }
}

class _DonutPainter extends CustomPainter {
  final double progress;
  const _DonutPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width  / 2;
    final cy = size.height / 2;
    final r  = size.width  / 2 - 12;

    final trackPaint = Paint()
      ..color       = AppColors.gray100
      ..style       = PaintingStyle.stroke
      ..strokeWidth = 18
      ..strokeCap   = StrokeCap.round;

    final progressPaint = Paint()
      ..color       = AppColors.blue700
      ..style       = PaintingStyle.stroke
      ..strokeWidth = 18
      ..strokeCap   = StrokeCap.round;

    final rect = Rect.fromCircle(center: Offset(cx, cy), radius: r);
    canvas.drawArc(rect, -pi / 2, 2 * pi, false, trackPaint);
    canvas.drawArc(rect, -pi / 2, 2 * pi * progress, false, progressPaint);
  }

  @override
  bool shouldRepaint(_DonutPainter old) => old.progress != progress;
}