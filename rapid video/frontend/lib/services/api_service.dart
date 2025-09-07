import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:rapid_video/utils/constants.dart';
import 'package:rapid_video/services/storage_service.dart';

class ApiService extends ChangeNotifier {
  static ApiService? _instance;
  static ApiService get instance {
    _instance ??= ApiService._internal();
    return _instance!;
  }

  ApiService._internal();

  late Dio _dio;
  late String _baseUrl;
  final http.Client _client = http.Client();
  static const Duration _timeout = Duration(seconds: 30);

  void initialize() {
    // Get base URL from storage or use default
    _baseUrl = StorageService.instance.getApiBaseUrl() ?? 
               AppConstants.defaultApiBaseUrl;
    
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
      sendTimeout: const Duration(seconds: 60),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(LogInterceptor(
      requestBody: kDebugMode,
      responseBody: kDebugMode,
      error: kDebugMode,
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        debugPrint('API Request: ${options.method} ${options.path}');
        handler.next(options);
      },
      onResponse: (response, handler) {
        debugPrint('API Response: ${response.statusCode} ${response.requestOptions.path}');
        handler.next(response);
      },
      onError: (error, handler) {
        debugPrint('API Error: ${error.message}');
        handler.next(error);
      },
    ));
  }

  // Common headers
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  Map<String, String> _headersWithAuth(String? token) => {
    ..._headers,
    if (token != null) 'Authorization': 'Bearer $token',
  };

  // Update base URL
  void updateBaseUrl(String newBaseUrl) {
    _baseUrl = newBaseUrl;
    _dio.options.baseUrl = newBaseUrl;
    StorageService.instance.setApiBaseUrl(newBaseUrl);
  }

  // Health check
  Future<ApiResponse<Map<String, dynamic>>> healthCheck() async {
    try {
      final response = await _dio.get('/health');
      return ApiResponse.success(response.data);
    } catch (e) {
      return ApiResponse.error(_handleError(e));
    }
  }

  // Upload video file from path
  Future<ApiResponse<Map<String, dynamic>>> uploadVideoFromPath(
    String filePath,
    String fileName, {
    Function(double)? onProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          filePath,
          filename: fileName,
        ),
      });

      final response = await _dio.post(
        '/upload',
        data: formData,
        onSendProgress: (sent, total) {
          if (onProgress != null && total > 0) {
            onProgress(sent / total);
          }
        },
      );

      return ApiResponse.success(response.data);
    } catch (e) {
      return ApiResponse.error(_handleError(e));
    }
  }

  // Upload video file
  Future<Map<String, dynamic>> uploadVideo(
    PlatformFile file, {
    String? userId,
    Function(double)? onProgress,
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/upload');
      final request = http.MultipartRequest('POST', uri);

      // Add file
      final multipartFile = http.MultipartFile.fromBytes(
        'file',
        file.bytes!,
        filename: file.name,
      );
      request.files.add(multipartFile);

      // Add user ID if provided
      if (userId != null) {
        request.fields['user_id'] = userId;
      }

      // Send request
      final streamedResponse = await request.send().timeout(_timeout);
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'job_id': data['job_id'],
          'cost': data['cost'],
          'duration': data['duration'],
          'message': data['message'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Upload failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Upload failed: ${e.toString()}',
      };
    }
  }

  // Upload video from bytes (for web)
  Future<ApiResponse<Map<String, dynamic>>> uploadVideoBytes(
    List<int> bytes,
    String fileName, {
    Function(double)? onProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          bytes,
          filename: fileName,
        ),
      });

      final response = await _dio.post(
        '/upload',
        data: formData,
        onSendProgress: (sent, total) {
          if (onProgress != null && total > 0) {
            onProgress(sent / total);
          }
        },
      );

      return ApiResponse.success(response.data);
    } catch (e) {
      return ApiResponse.error(_handleError(e));
    }
  }

  // Get upload status
  Future<Map<String, dynamic>> getUploadStatus(String jobId) async {
    try {
      final response = await _client
          .get(
            Uri.parse('$_baseUrl/upload/status/$jobId'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['detail'] ?? 'Failed to get upload status');
      }
    } catch (e) {
      throw Exception('Failed to get upload status: ${e.toString()}');
    }
  }

  // Get job status
  Future<ApiResponse<Map<String, dynamic>>> getJobStatus(String jobId) async {
    try {
      final response = await _dio.get('/jobs/$jobId');
      return ApiResponse.success(response.data);
    } catch (e) {
      return ApiResponse.error(_handleError(e));
    }
  }

  // Get all jobs
  Future<ApiResponse<List<dynamic>>> getAllJobs({
    int? limit,
    int? offset,
    String? status,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (limit != null) queryParams['limit'] = limit;
      if (offset != null) queryParams['offset'] = offset;
      if (status != null) queryParams['status'] = status;

      final response = await _dio.get(
        '/jobs',
        queryParameters: queryParams,
      );
      return ApiResponse.success(response.data);
    } catch (e) {
      return ApiResponse.error(_handleError(e));
    }
  }

  // Download processed video
  Future<Map<String, dynamic>> getDownloadUrlLegacy(String jobId) async {
    try {
      final response = await _client
          .get(
            Uri.parse('$_baseUrl/download/$jobId'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'download_url': data['download_url'],
          'expires_at': data['expires_at'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Failed to get download URL',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to get download URL: ${e.toString()}',
      };
    }
  }

  // Download processed video (Dio version)
  Future<ApiResponse<String>> getDownloadUrl(String jobId) async {
    try {
      final response = await _dio.get('/download/$jobId');
      return ApiResponse.success(response.data['download_url']);
    } catch (e) {
      return ApiResponse.error(_handleError(e));
    }
  }

  // Delete job
  Future<ApiResponse<Map<String, dynamic>>> deleteJob(String jobId) async {
    try {
      final response = await _dio.delete('/jobs/$jobId');
      return ApiResponse.success(response.data);
    } catch (e) {
      return ApiResponse.error(_handleError(e));
    }
  }

  // Create payment intent
  Future<Map<String, dynamic>> createPaymentIntent({
    required double amount,
    required String userId,
    required String jobId,
  }) async {
    try {
      final response = await _client
          .post(
            Uri.parse('$_baseUrl/payment/create-intent'),
            headers: _headers,
            body: json.encode({
              'amount': amount,
              'user_id': userId,
              'job_id': jobId,
            }),
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'client_secret': data['client_secret'],
          'publishable_key': data['publishable_key'],
          'payment_intent_id': data['payment_intent_id'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Failed to create payment intent',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to create payment intent: ${e.toString()}',
      };
    }
  }

  // Verify payment
  Future<Map<String, dynamic>> verifyPayment({
    required String paymentIntentId,
    required String userId,
    required String jobId,
  }) async {
    try {
      final response = await _client
          .post(
            Uri.parse('$_baseUrl/payment/verify'),
            headers: _headers,
            body: json.encode({
              'payment_intent_id': paymentIntentId,
              'user_id': userId,
              'job_id': jobId,
            }),
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'message': data['message'],
          'transaction_id': data['transaction_id'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Payment verification failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Payment verification failed: ${e.toString()}',
      };
    }
  }

  // Start scene split
  Future<Map<String, dynamic>> startSceneSplit(String jobId) async {
    try {
      final response = await _client
          .post(
            Uri.parse('$_baseUrl/scene-split'),
            headers: _headers,
            body: json.encode({'job_id': jobId}),
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'message': data['message'],
          'scenes_count': data['scenes_count'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Scene split failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Scene split failed: ${e.toString()}',
      };
    }
  }

  // Get scene split status
  Future<Map<String, dynamic>> getSceneSplitStatus(String jobId) async {
    try {
      final response = await _client
          .get(
            Uri.parse('$_baseUrl/scene-split/status/$jobId'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['detail'] ?? 'Failed to get scene split status');
      }
    } catch (e) {
      throw Exception('Failed to get scene split status: ${e.toString()}');
    }
  }

  // Start AI conversion
  Future<Map<String, dynamic>> startAiConversion(String jobId) async {
    try {
      final response = await _client
          .post(
            Uri.parse('$_baseUrl/ai-convert'),
            headers: _headers,
            body: json.encode({'job_id': jobId}),
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'message': data['message'],
          'estimated_time': data['estimated_time'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'AI conversion failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'AI conversion failed: ${e.toString()}',
      };
    }
  }

  // Get AI conversion status
  Future<Map<String, dynamic>> getAiConversionStatus(String jobId) async {
    try {
      final response = await _client
          .get(
            Uri.parse('$_baseUrl/ai-convert/status/$jobId'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['detail'] ?? 'Failed to get AI conversion status');
      }
    } catch (e) {
      throw Exception('Failed to get AI conversion status: ${e.toString()}');
    }
  }

  // Start merge
  Future<Map<String, dynamic>> startMerge(String jobId) async {
    try {
      final response = await _client
          .post(
            Uri.parse('$_baseUrl/merge'),
            headers: _headers,
            body: json.encode({'job_id': jobId}),
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'message': data['message'],
          'estimated_time': data['estimated_time'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Merge failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Merge failed: ${e.toString()}',
      };
    }
  }

  // Get merge status
  Future<Map<String, dynamic>> getMergeStatus(String jobId) async {
    try {
      final response = await _client
          .get(
            Uri.parse('$_baseUrl/merge/status/$jobId'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['detail'] ?? 'Failed to get merge status');
      }
    } catch (e) {
      throw Exception('Failed to get merge status: ${e.toString()}');
    }
  }

  // Get processing statistics
  Future<Map<String, dynamic>> getStats() async {
    try {
      final response = await _client
          .get(
            Uri.parse('$_baseUrl/stats'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        return {
          'success': true,
          ...json.decode(response.body),
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Failed to get statistics',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to get statistics: ${e.toString()}',
      };
    }
  }

  // Cancel job
  Future<Map<String, dynamic>> cancelJob(String jobId) async {
    try {
      final response = await _client
          .post(
            Uri.parse('$_baseUrl/jobs/$jobId/cancel'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Failed to cancel job',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to cancel job: ${e.toString()}',
      };
    }
  }

  // Retry failed job
  Future<Map<String, dynamic>> retryJob(String jobId) async {
    try {
      final response = await _client
          .post(
            Uri.parse('$_baseUrl/jobs/$jobId/retry'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Failed to retry job',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to retry job: ${e.toString()}',
      };
    }
  }

  // Get job logs
  Future<Map<String, dynamic>> getJobLogs(String jobId) async {
    try {
      final response = await _client
          .get(
            Uri.parse('$_baseUrl/jobs/$jobId/logs'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'logs': data['logs'],
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'error': errorData['detail'] ?? 'Failed to get job logs',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to get job logs: ${e.toString()}',
      };
    }
  }

  // Error handling
  String _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timeout. Please check your internet connection.';
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final message = error.response?.data?['message'] ?? 
                         error.response?.data?['detail'] ?? 
                         'Server error';
          return 'Server error ($statusCode): $message';
        case DioExceptionType.cancel:
          return 'Request was cancelled';
        case DioExceptionType.connectionError:
          return 'Connection error. Please check your internet connection.';
        case DioExceptionType.badCertificate:
          return 'Certificate error. Please check your connection security.';
        case DioExceptionType.unknown:
        default:
          return 'An unexpected error occurred: ${error.message}';
      }
    } else if (error is SocketException) {
      return 'Network error. Please check your internet connection.';
    } else {
      return 'An unexpected error occurred: $error';
    }
  }

  // Health check (duplicate method removed)

  // Test connection
  Future<bool> testConnection() async {
    try {
      final response = await healthCheck();
      return response['success'] == true;
    } catch (e) {
      return false;
    }
  }

  // Get current base URL
  String get baseUrl => _baseUrl;

  // Dispose resources
  void dispose() {
    _client.close();
  }
}

// API Response wrapper
class ApiResponse<T> {
  final bool isSuccess;
  final T? data;
  final String? error;
  final int? statusCode;

  ApiResponse._({
    required this.isSuccess,
    this.data,
    this.error,
    this.statusCode,
  });

  factory ApiResponse.success(T data, [int? statusCode]) {
    return ApiResponse._(
      isSuccess: true,
      data: data,
      statusCode: statusCode,
    );
  }

  factory ApiResponse.error(String error, [int? statusCode]) {
    return ApiResponse._(
      isSuccess: false,
      error: error,
      statusCode: statusCode,
    );
  }

  @override
  String toString() {
    if (isSuccess) {
      return 'ApiResponse.success(data: $data)';
    } else {
      return 'ApiResponse.error(error: $error)';
    }
  }
}

// API endpoints
class ApiEndpoints {
  static const String health = '/health';
  static const String upload = '/upload';
  static const String jobs = '/jobs';
  static const String download = '/download';
  static const String stats = '/stats';
  
  static String job(String jobId) => '/jobs/$jobId';
  static String jobCancel(String jobId) => '/jobs/$jobId/cancel';
  static String jobRetry(String jobId) => '/jobs/$jobId/retry';
  static String jobLogs(String jobId) => '/jobs/$jobId/logs';
  static String jobDownload(String jobId) => '/download/$jobId';
}

// HTTP status codes
class HttpStatus {
  static const int ok = 200;
  static const int created = 201;
  static const int accepted = 202;
  static const int noContent = 204;
  static const int badRequest = 400;
  static const int unauthorized = 401;
  static const int forbidden = 403;
  static const int notFound = 404;
  static const int methodNotAllowed = 405;
  static const int conflict = 409;
  static const int unprocessableEntity = 422;
  static const int tooManyRequests = 429;
  static const int internalServerError = 500;
  static const int badGateway = 502;
  static const int serviceUnavailable = 503;
  static const int gatewayTimeout = 504;
}