import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/grade_model.dart';
import '../../../shared/models/schedule_model.dart';

class StudentRepository {
  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final res  = await DioClient.get(ApiConstants.studentDashboard);
      final data = res.data as Map<String, dynamic>;
      if (data['ok'] == true) return data['data'] as Map<String, dynamic>;
      throw Exception('Error al cargar dashboard');
    } catch (_) {
      return _demoData();
    }
  }

  Map<String, dynamic> _demoData() => {
    'stats': {
      'subjects':   6,
      'average':    '3.8',
      'credits':    18,
      'attendance': '94%',
    },
    'schedule': [
      {'day':'LUN','startTime':'07:00','endTime':'09:00','courseName':'Cálculo I',   'room':'A-201','color':'blue'},
      {'day':'LUN','startTime':'09:00','endTime':'11:00','courseName':'Física I',    'room':'Lab-1','color':'green'},
      {'day':'MAR','startTime':'07:00','endTime':'09:00','courseName':'Álgebra',     'room':'B-105','color':'red'},
      {'day':'MAR','startTime':'14:00','endTime':'16:00','courseName':'Prog. I',     'room':'Sala-C','color':'amber'},
      {'day':'MIÉ','startTime':'07:00','endTime':'09:00','courseName':'Cálculo I',   'room':'A-201','color':'blue'},
      {'day':'JUE','startTime':'09:00','endTime':'11:00','courseName':'Álgebra',     'room':'B-105','color':'red'},
      {'day':'JUE','startTime':'14:00','endTime':'16:00','courseName':'Humanid.',    'room':'C-301','color':'amber'},
      {'day':'VIE','startTime':'07:00','endTime':'09:00','courseName':'Física I',    'room':'Lab-1','color':'green'},
      {'day':'VIE','startTime':'09:00','endTime':'11:00','courseName':'Prog. I',     'room':'Sala-C','color':'amber'},
    ],
    'grades': [
      {'code':'MAT101','name':'Cálculo Diferencial e Integral','score':4.2,'credits':4},
      {'code':'SIS101','name':'Programación I',                 'score':3.9,'credits':3},
      {'code':'FIS101','name':'Física I',                       'score':3.5,'credits':4},
      {'code':'MAT201','name':'Álgebra Lineal',                 'score':4.5,'credits':3},
      {'code':'HUM101','name':'Humanidades y Ética',            'score':4.0,'credits':2},
      {'code':'ING101','name':'Inglés Técnico I',               'score':3.2,'credits':2},
    ],
    'progress': {
      'creditsCompleted':   42,
      'creditsTotal':       160,
      'semestersCompleted': 3,
      'semestersTotal':     10,
      'gpa':                '3.82',
    },
    'announcements': [
      {'title':'Inicio del periodo académico 2025-I',   'body':'Las clases comienzan el 3 de febrero.','date':'Hace 2 días','type':'blue','unread':true},
      {'title':'Fecha límite de pago de matrícula',     'body':'El último día para pago es el 31 de enero.','date':'Hace 3 días','type':'red','unread':true},
      {'title':'Apertura biblioteca virtual',           'body':'La biblioteca amplía su catálogo con 5.000 títulos.','date':'Hace 5 días','type':'green','unread':true},
      {'title':'Encuesta de satisfacción estudiantil',  'body':'Participa y contribuye a mejorar la calidad educativa.','date':'Hace 1 semana','type':'amber','unread':false},
    ],
  };
}