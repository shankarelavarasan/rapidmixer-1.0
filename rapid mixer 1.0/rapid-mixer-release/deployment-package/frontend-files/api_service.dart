import 'dart:convert';
import 'package:http/http.dart' as http;
import 'app_config.dart';

class ApiService {
  static const String baseUrl = AppConfig.apiBaseUrl;
  static String? _authToken;

  // Set authentication token
  static void setAuthToken(String token) {
    _authToken = token;
  }

  // Clear authentication token
  static void clearAuthToken() {
    _authToken = null;
  }

  // Get headers with authentication
  static Map<String, String> _getHeaders({bool includeAuth = true}) {
    final headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && _authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }

    return headers;
  }

  // Generic GET request
  static Future<Map<String, dynamic>> get(
    String endpoint, {
    bool includeAuth = true,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: _getHeaders(includeAuth: includeAuth),
      );

      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Network error: $e');
    }
  }

  // Generic POST request
  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data, {
    bool includeAuth = true,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: _getHeaders(includeAuth: includeAuth),
        body: json.encode(data),
      );

      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Network error: $e');
    }
  }

  // Generic PUT request
  static Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> data, {
    bool includeAuth = true,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl$endpoint'),
        headers: _getHeaders(includeAuth: includeAuth),
        body: json.encode(data),
      );

      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Network error: $e');
    }
  }

  // Generic DELETE request
  static Future<Map<String, dynamic>> delete(
    String endpoint, {
    bool includeAuth = true,
  }) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl$endpoint'),
        headers: _getHeaders(includeAuth: includeAuth),
      );

      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Network error: $e');
    }
  }

  // File upload request
  static Future<Map<String, dynamic>> uploadFile(
    String endpoint,
    String filePath,
    String fieldName, {
    Map<String, String>? additionalFields,
    bool includeAuth = true,
  }) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl$endpoint'),
      );

      // Add headers
      if (includeAuth && _authToken != null) {
        request.headers['Authorization'] = 'Bearer $_authToken';
      }

      // Add file
      request.files.add(
        await http.MultipartFile.fromPath(fieldName, filePath),
      );

      // Add additional fields
      if (additionalFields != null) {
        request.fields.addAll(additionalFields);
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse(response);
    } catch (e) {
      throw ApiException('Upload error: $e');
    }
  }

  // Handle HTTP response
  static Map<String, dynamic> _handleResponse(http.Response response) {
    final Map<String, dynamic> data = json.decode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      final errorMessage = data['error'] ?? 'Unknown error occurred';
      throw ApiException(errorMessage, statusCode: response.statusCode);
    }
  }

  // Health check
  static Future<bool> healthCheck() async {
    try {
      final response = await get('/health', includeAuth: false);
      return response['status'] == 'OK';
    } catch (e) {
      return false;
    }
  }

  // Test connection
  static Future<ConnectionStatus> testConnection() async {
    try {
      final startTime = DateTime.now();
      await healthCheck();
      final endTime = DateTime.now();
      final latency = endTime.difference(startTime).inMilliseconds;

      return ConnectionStatus(
        isConnected: true,
        latency: latency,
        message: 'Connected successfully',
      );
    } catch (e) {
      return ConnectionStatus(
        isConnected: false,
        latency: -1,
        message: 'Connection failed: $e',
      );
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException: $message';
}

class ConnectionStatus {
  final bool isConnected;
  final int latency;
  final String message;

  ConnectionStatus({
    required this.isConnected,
    required this.latency,
    required this.message,
  });

  String get statusText {
    if (!isConnected) return 'Disconnected';
    if (latency < 100) return 'Excellent';
    if (latency < 300) return 'Good';
    if (latency < 500) return 'Fair';
    return 'Poor';
  }

  String get latencyText {
    if (!isConnected) return 'N/A';
    return '${latency}ms';
  }
}