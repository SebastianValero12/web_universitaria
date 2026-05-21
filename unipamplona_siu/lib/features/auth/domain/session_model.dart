import 'user_model.dart';

class SessionModel {
  final String    token;
  final UserModel user;

  const SessionModel({required this.token, required this.user});

  factory SessionModel.fromJson(Map<String, dynamic> j) => SessionModel(
    token: j['token'] as String,
    user:  UserModel.fromJson(j['user'] as Map<String, dynamic>),
  );
}