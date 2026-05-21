class ScheduleModel {
  final String day;
  final String startTime;
  final String endTime;
  final String courseName;
  final String room;
  final String color;

  const ScheduleModel({
    required this.day,
    required this.startTime,
    required this.endTime,
    required this.courseName,
    required this.room,
    required this.color,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic> j) => ScheduleModel(
    day:        j['day']        as String,
    startTime:  j['startTime']  as String,
    endTime:    j['endTime']    as String,
    courseName: j['courseName'] as String,
    room:       j['room']       as String? ?? '',
    color:      j['color']      as String? ?? 'blue',
  );
}