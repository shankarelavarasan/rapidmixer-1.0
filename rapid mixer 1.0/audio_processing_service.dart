import 'dart:async';
import 'dart:io' if (dart.library.io) 'dart:io';
import 'dart:convert';

import 'package:ffmpeg_kit_flutter/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter/return_code.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart'
    if (dart.library.io) 'path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:dio/dio.dart';
import 'package:path/path.dart' as path;

class AudioProcessingService {
  static final AudioProcessingService _instance =
      AudioProcessingService._internal();
  factory AudioProcessingService() => _instance;
  AudioProcessingService._internal();

  // Backend API configuration
  static const String _baseUrl = 'https://rapid-mixer-backend.onrender.com';
  static const String _localUrl = 'http://localhost:3001';
  
  // Use local URL for development, production URL for release
  String get baseUrl => kDebugMode ? _localUrl : _baseUrl;
  
  final Dio _dio = Dio();

  // Stream controllers for processing updates
  final StreamController<double> _progressController =
      StreamController<double>.broadcast();
  final StreamController<String> _statusController =
      StreamController<String>.broadcast();
  final StreamController<String> _errorController =
      StreamController<String>.broadcast();

  // Getters for streams
  Stream<double> get progressStream => _progressController.stream;
  Stream<String> get statusStream => _statusController.stream;
  Stream<String> get errorStream => _errorController.stream;

  bool _isProcessing = false;
  bool get isProcessing => _isProcessing;
  
  Timer? _statusCheckTimer;

  // Real stem separation using backend Spleeter service
  Future<Map<String, String>> separateStems(String inputFilePath) async {
    if (kIsWeb) {
      return _processStemSeparationWeb(inputFilePath);
    } else {
      return _processStemSeparationMobile(inputFilePath);
    }
  }

  Future<Map<String, String>> _processStemSeparationWeb(String inputUrl) async {
    _isProcessing = true;
    _statusController.add('Initializing stem separation...');

    try {
      // For web, we need to handle URL-based processing
      // This would typically involve uploading the URL to the backend
      _statusController.add('Connecting to AI processing server...');
      _progressController.add(0.1);
      
      // Send URL to backend for processing
      final response = await _dio.post(
        '$baseUrl/api/audio/upload-url',
        data: {'audioUrl': inputUrl},
        options: Options(
          headers: {'Content-Type': 'application/json'},
          receiveTimeout: const Duration(minutes: 10),
        ),
      );
      
      if (response.statusCode == 200) {
        final processId = response.data['processId'];
        _statusController.add('Processing started with ID: $processId');
        _progressController.add(0.2);
        
        // Poll for status updates
        return await _pollProcessingStatus(processId);
      } else {
        throw Exception('Failed to start processing: ${response.statusMessage}');
      }
    } catch (e) {
      _errorController.add('Stem separation failed: $e');
      return {};
    } finally {
      _isProcessing = false;
      _statusCheckTimer?.cancel();
    }
  }

  Future<Map<String, String>> _processStemSeparationMobile(
    String inputFilePath,
  ) async {
    _isProcessing = true;
    _statusController.add('Initializing stem separation...');

    try {
      _statusController.add('Uploading audio file...');
      _progressController.add(0.1);
      
      // Upload file to backend
      final file = File(inputFilePath);
      final fileName = path.basename(inputFilePath);
      
      final formData = FormData.fromMap({
        'audio': await MultipartFile.fromFile(
          inputFilePath,
          filename: fileName,
        ),
      });
      
      _statusController.add('Connecting to AI processing server...');
      _progressController.add(0.2);
      
      final response = await _dio.post(
        '$baseUrl/api/audio/upload',
        data: formData,
        options: Options(
          receiveTimeout: const Duration(minutes: 10),
          sendTimeout: const Duration(minutes: 5),
        ),
        onSendProgress: (sent, total) {
          final uploadProgress = 0.2 + (sent / total) * 0.1;
          _progressController.add(uploadProgress);
        },
      );
      
      if (response.statusCode == 200) {
        final processId = response.data['processId'];
        _statusController.add('Upload successful! Processing with Spleeter...');
        _progressController.add(0.3);
        
        // Poll for status updates
        return await _pollProcessingStatus(processId);
      } else {
        throw Exception('Failed to upload file: ${response.statusMessage}');
      }
    } catch (e) {
      _errorController.add('Stem separation failed: $e');
      return {};
    } finally {
      _isProcessing = false;
      _statusCheckTimer?.cancel();
    }
  }
  
  // Poll backend for processing status
  Future<Map<String, String>> _pollProcessingStatus(String processId) async {
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    int attempts = 0;
    
    while (attempts < maxAttempts && _isProcessing) {
      try {
        await Future.delayed(const Duration(seconds: 5));
        
        final response = await _dio.get(
          '$baseUrl/api/audio/status/$processId',
          options: Options(
            receiveTimeout: const Duration(seconds: 30),
          ),
        );
        
        if (response.statusCode == 200) {
          final data = response.data;
          final status = data['status'];
          final progress = data['progress'] ?? 0;
          
          // Update progress (30% to 90% during processing)
          final adjustedProgress = 0.3 + (progress / 100) * 0.6;
          _progressController.add(adjustedProgress);
          
          if (status == 'completed') {
            _statusController.add('Downloading processed stems...');
            _progressController.add(0.95);
            
            final stems = data['stems'] as Map<String, dynamic>;
            final stemUrls = <String, String>{};
            
            // Convert backend URLs to full URLs
            stems.forEach((key, value) {
              if (value != null) {
                stemUrls[key] = '$baseUrl$value';
              }
            });
            
            _statusController.add('Stem separation completed!');
            _progressController.add(1.0);
            
            return stemUrls;
          } else if (status == 'failed') {
            throw Exception('Backend processing failed');
          } else {
            // Still processing
            _statusController.add('Processing stems with AI... ${progress.round()}%');
          }
        }
        
        attempts++;
      } catch (e) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw Exception('Processing timeout: $e');
        }
        // Continue polling on temporary errors
      }
    }
    
    throw Exception('Processing timeout - please try again');
  }

  String _getFilterForStemType(String stemType) {
    switch (stemType) {
      case 'vocals':
        return '-af "highpass=f=300,lowpass=f=3000" -ac 1';
      case 'drums':
        return '-af "lowpass=f=1000,highpass=f=60" -ac 1';
      case 'bass':
        return '-af "lowpass=f=250" -ac 1';
      case 'piano':
        return '-af "bandpass=f=440:width_type=h:w=200" -ac 1';
      case 'other':
        return '-af "bandpass=f=1000:width_type=h:w=500" -ac 1';
      default:
        return '-ac 1';
    }
  }

  Future<void> _copyFile(String sourcePath, String destinationPath) async {
    final sourceFile = File(sourcePath);
    await sourceFile.copy(destinationPath);
  }

  // Mix stems together with volume controls
  Future<String?> mixStems(
    Map<String, String> stemPaths,
    Map<String, double> volumes,
  ) async {
    if (kIsWeb) {
      _errorController.add('Stem mixing not supported on web platform');
      return null;
    }

    _isProcessing = true;
    _statusController.add('Mixing stems...');

    try {
      final directory = await getApplicationDocumentsDirectory();
      final outputPath = '${directory.path}/mixed_output.wav';

      // Build FFmpeg command for mixing multiple audio files with volume controls
      final inputs = <String>[];
      final filters = <String>[];
      int inputIndex = 0;

      for (final entry in stemPaths.entries) {
        final stemType = entry.key;
        final filePath = entry.value;
        final volume = volumes[stemType] ?? 1.0;

        inputs.add('-i "$filePath"');
        filters.add('[$inputIndex:0]volume=$volume[a$inputIndex]');
        inputIndex++;
      }

      final mixFilter =
          filters.join(';') +
          ';' +
          List.generate(inputIndex, (i) => '[a$i]').join('') +
          'amix=inputs=$inputIndex:duration=longest[out]';

      final command =
          '${inputs.join(' ')} -filter_complex "$mixFilter" -map "[out]" "$outputPath"';

      final session = await FFmpegKit.execute(command);
      final returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        _statusController.add('Mixing completed!');
        return outputPath;
      } else {
        _errorController.add('Failed to mix stems');
        return null;
      }
    } catch (e) {
      _errorController.add('Mixing failed: $e');
      return null;
    } finally {
      _isProcessing = false;
    }
  }

  // Convert audio format
  Future<String?> convertAudioFormat(
    String inputPath,
    String outputFormat,
  ) async {
    if (kIsWeb) {
      _errorController.add('Audio conversion not supported on web platform');
      return null;
    }

    try {
      final directory = await getApplicationDocumentsDirectory();
      final outputPath = '${directory.path}/converted_audio.$outputFormat';

      String qualitySettings = '';
      switch (outputFormat.toLowerCase()) {
        case 'mp3':
          qualitySettings = '-b:a 320k';
          break;
        case 'wav':
          qualitySettings = '-acodec pcm_s16le';
          break;
        case 'flac':
          qualitySettings = '-acodec flac';
          break;
        default:
          qualitySettings = '-b:a 192k';
      }

      final command = '-i "$inputPath" $qualitySettings "$outputPath"';
      final session = await FFmpegKit.execute(command);
      final returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        return outputPath;
      } else {
        _errorController.add('Failed to convert audio format');
        return null;
      }
    } catch (e) {
      _errorController.add('Audio conversion failed: $e');
      return null;
    }
  }

  // Apply audio effects
  Future<String?> applyAudioEffect(
    String inputPath,
    String effectType,
    Map<String, dynamic> parameters,
  ) async {
    if (kIsWeb) {
      _errorController.add('Audio effects not supported on web platform');
      return null;
    }

    try {
      final directory = await getApplicationDocumentsDirectory();
      final outputPath = '${directory.path}/processed_${effectType}_audio.wav';

      String filterCommand = _buildEffectFilter(effectType, parameters);
      final command = '-i "$inputPath" -af "$filterCommand" "$outputPath"';

      final session = await FFmpegKit.execute(command);
      final returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        return outputPath;
      } else {
        _errorController.add('Failed to apply $effectType effect');
        return null;
      }
    } catch (e) {
      _errorController.add('Effect processing failed: $e');
      return null;
    }
  }

  String _buildEffectFilter(
    String effectType,
    Map<String, dynamic> parameters,
  ) {
    switch (effectType) {
      case 'reverb':
        final roomSize = parameters['roomSize'] ?? 0.5;
        final damping = parameters['damping'] ?? 0.5;
        return 'aecho=0.8:0.9:${(roomSize * 1000).round()}:${damping}';

      case 'delay':
        final delayTime = parameters['delayTime'] ?? 0.5;
        final feedback = parameters['feedback'] ?? 0.3;
        return 'aecho=${feedback}:0.9:${(delayTime * 1000).round()}:0.5';

      case 'eq':
        final low = parameters['low'] ?? 0.0;
        final mid = parameters['mid'] ?? 0.0;
        final high = parameters['high'] ?? 0.0;
        return 'equalizer=f=100:width_type=h:width=50:g=$low,equalizer=f=1000:width_type=h:width=100:g=$mid,equalizer=f=10000:width_type=h:width=1000:g=$high';

      case 'compression':
        final threshold = parameters['threshold'] ?? -20.0;
        final ratio = parameters['ratio'] ?? 4.0;
        return 'acompressor=threshold=${threshold}dB:ratio=$ratio:attack=5:release=50';

      default:
        return 'volume=1.0';
    }
  }

  void dispose() {
    _progressController.close();
    _statusController.close();
    _errorController.close();
  }
}
