import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/session_storage.dart';

class DioClient {
  DioClient._();

  static Dio? _instance;

  static Dio get instance {
    _instance ??= _create();
    return _instance!;
  }

  static Dio _create() {
    final dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SessionStorage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        // 401 → sesión expirada (se maneja en el router)
        handler.next(error);
      },
    ));

    return dio;
  }

  // Helpers
  static Future<Response> get(String path, {Map<String, dynamic>? params}) =>
      instance.get(path, queryParameters: params);

  static Future<Response> post(String path, {dynamic data}) =>
      instance.post(path, data: data);

  static Future<Response> put(String path, {dynamic data}) =>
      instance.put(path, data: data);

  static Future<Response> patch(String path, {dynamic data}) =>
      instance.patch(path, data: data);

  static Future<Response> delete(String path) =>
      instance.delete(path);
}