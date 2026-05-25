class UserListModel {
  final int    id;
  final String code;
  final String firstName;
  final String lastName;
  final String email;
  final String role;
  final String status;

  const UserListModel({
    required this.id,
    required this.code,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    required this.status,
  });

  String get fullName  => '$firstName $lastName';
  String get initials  => '${firstName[0]}${lastName[0]}'.toUpperCase();

  factory UserListModel.fromJson(Map<String, dynamic> j) => UserListModel(
    id:        j['id']        as int,
    code:      j['code']      as String? ?? '',
    firstName: j['firstName'] as String,
    lastName:  j['lastName']  as String,
    email:     j['email']     as String,
    role:      j['role']      as String,
    status:    j['status']    as String? ?? 'ACTIVE',
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'code': code, 'firstName': firstName,
    'lastName': lastName, 'email': email, 'role': role, 'status': status,
  };

  UserListModel copyWith({String? role, String? status, String? firstName, String? lastName, String? email}) =>
    UserListModel(
      id: id, code: code,
      firstName: firstName ?? this.firstName,
      lastName:  lastName  ?? this.lastName,
      email:     email     ?? this.email,
      role:      role      ?? this.role,
      status:    status    ?? this.status,
    );
}