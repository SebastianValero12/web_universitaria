import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

class TeacherRepository {
  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final res  = await DioClient.get(ApiConstants.teacherDashboard);
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) return data['data'] as Map<String, dynamic>;
      throw Exception();
    } catch (_) { return _demoData(); }
  }

  Future<List<dynamic>> getGroupStudents(int groupId) async {
    try {
      final res  = await DioClient.get(ApiConstants.teacherGroupStudents(groupId));
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) return data['data'] as List<dynamic>;
      throw Exception();
    } catch (_) { return _demoStudents(); }
  }

  Future<void> updateGrade(int gradeId, double score, String remarks) async {
    try {
      await DioClient.patch(ApiConstants.teacherGrade(gradeId),
        data: {'score': score, 'remarks': remarks});
    } catch (_) {}
  }

  Map<String, dynamic> _demoData() => {
    'stats': {'groups': 3, 'students': 83, 'gradesPending': 12, 'avgScore': '3.8'},
    'groups': [
      {'id':1,'code':'A','courseName':'Cálculo Diferencial e Integral','courseCode':'MAT101','studentCount':28,'room':'A-201'},
      {'id':2,'code':'B','courseName':'Álgebra Lineal',                 'courseCode':'MAT201','studentCount':25,'room':'B-105'},
      {'id':3,'code':'A','courseName':'Programación I',                 'courseCode':'SIS101','studentCount':30,'room':'Lab-C'},
    ],
    'students': [
      {'id':1,'code':'20231001','firstName':'Valeria','lastName':'Ruiz Morales', 'groupCode':'MAT101-A','score':4.2},
      {'id':2,'code':'20231002','firstName':'Andrés', 'lastName':'Mora Leal',    'groupCode':'MAT101-A','score':3.8},
      {'id':3,'code':'20231003','firstName':'Juan',   'lastName':'García Pérez', 'groupCode':'MAT101-A','score':2.9},
      {'id':4,'code':'20231004','firstName':'María',  'lastName':'López Torres', 'groupCode':'MAT201-B','score':4.5},
      {'id':5,'code':'20231005','firstName':'Carlos', 'lastName':'Hernández',    'groupCode':'SIS101-A','score':3.5},
    ],
  };

  List<dynamic> _demoStudents() => [
    {'id':1,'code':'20231001','firstName':'Valeria','lastName':'Ruiz Morales','score':4.2},
    {'id':2,'code':'20231002','firstName':'Andrés', 'lastName':'Mora Leal',   'score':3.8},
    {'id':3,'code':'20231003','firstName':'Juan',   'lastName':'García Pérez','score':2.9},
    {'id':4,'code':'20231004','firstName':'María',  'lastName':'López Torres','score':4.5},
    {'id':5,'code':'20231005','firstName':'Carlos', 'lastName':'Hernández',   'score':3.5},
  ];
}