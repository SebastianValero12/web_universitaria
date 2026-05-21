import 'package:flutter/material.dart';
import '../../../../shared/widgets/stat_card.dart';
import '../../../../shared/widgets/skeleton_card.dart';

class StudentStatsGrid extends StatelessWidget {
  final Map<String, dynamic>? stats;

  const StudentStatsGrid({super.key, this.stats});

  @override
  Widget build(BuildContext context) {
    if (stats == null) {
      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 2.2,
        children: List.generate(4, (_) => const SkeletonCard(height: 88)),
      );
    }

    final items = [
      (stats!['subjects'].toString(),   'Materias activas',       Icons.menu_book_outlined,        StatCardColor.blue),
      (stats!['average'].toString(),    'Promedio acumulado',     Icons.trending_up_outlined,      StatCardColor.green),
      (stats!['credits'].toString(),    'Créditos este periodo',  Icons.access_time_outlined,      StatCardColor.amber),
      (stats!['attendance'].toString(), 'Asistencia global',      Icons.people_outline,            StatCardColor.red),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 2.2,
      children: items.map((e) => StatCard(
        value: e.$1,
        label: e.$2,
        icon:  e.$3,
        color: e.$4,
      )).toList(),
    );
  }
}