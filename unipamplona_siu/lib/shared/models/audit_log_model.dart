class AuditLogModel {
  final int    id;
  final String createdAt;
  final String userName;
  final String action;
  final String detail;
  final String ip;

  const AuditLogModel({
    required this.id,
    required this.createdAt,
    required this.userName,
    required this.action,
    required this.detail,
    required this.ip,
  });

  factory AuditLogModel.fromJson(Map<String, dynamic> j) => AuditLogModel(
    id:        j['id']       as int,
    createdAt: j['createdAt'] as String,
    userName:  j['userName']  as String? ?? '—',
    action:    j['action']    as String,
    detail:    j['detail']    as String? ?? '—',
    ip:        j['ip']        as String? ?? '—',
  );

  String get formattedDate {
    final dt = DateTime.tryParse(createdAt);
    if (dt == null) return createdAt;
    return '${dt.day.toString().padLeft(2,'0')}/${dt.month.toString().padLeft(2,'0')}/${dt.year} '
           '${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}';
  }
}