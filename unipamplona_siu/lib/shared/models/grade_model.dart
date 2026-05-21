class GradeModel {
  final String  code;
  final String  name;
  final double? score;
  final int     credits;

  const GradeModel({
    required this.code,
    required this.name,
    this.score,
    required this.credits,
  });

  factory GradeModel.fromJson(Map<String, dynamic> j) => GradeModel(
    code:    j['code']    as String,
    name:    j['name']    as String,
    score:   (j['score']  as num?)?.toDouble(),
    credits: j['credits'] as int? ?? 3,
  );
}