import 'dart:io' if (dart.library.io) 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:ffmpeg_kit_flutter/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter/return_code.dart';
import 'package:path_provider/path_provider.dart'
    if (dart.library.io) 'path_provider/path_provider.dart';

class AudioProcessingService {
  static final AudioProcessingService _instance =
      AudioProcessingService._internal();
  factory AudioProcessingService() => _instance;
  AudioProcessingService._internal();

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

  // Mock stem separation for demo purposes
  // In a real app, this would connect to a backend service like Spleeter or Demucs
  Future<Map<String, String>> separateStems(String inputFilePath) async {
    if (kIsWeb) {
      return _mockStemSeparationWeb(inputFilePath);
    } else {
      return _mockStemSeparationMobile(inputFilePath);
    }
  }

  Future<Map<String, String>> _mockStemSeparationWeb(String inputUrl) async {
    _isProcessing = true;
    _statusController.add('Initializing stem separation...');

    try {
      // Simulate processing steps
      final steps = [
        'Analyzing audio frequencies...',
        'Extracting vocal patterns...',
        'Isolating drum patterns...',
        'Separating bass frequencies...',
        'Processing piano/keyboard...',
        'Finalizing stem tracks...'
      ];

      for (int i = 0; i < steps.length; i++) {
        _statusController.add(steps[i]);
        _progressController.add((i + 1) / steps.length);
        await Future.delayed(const Duration(seconds: 2));
      }

      // Return mock stem URLs (in real implementation, these would be actual separated audio files)
      final mockStems = {
        'vocals': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'drums': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'bass': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'piano': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'other': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      };

      _statusController.add('Stem separation completed!');
      return mockStems;
    } catch (e) {
      _errorController.add('Stem separation failed: $e');
      return {};
    } finally {
      _isProcessing = false;
    }
  }

  Future<Map<String, String>> _mockStemSeparationMobile(
      String inputFilePath) async {
    _isProcessing = true;
    _statusController.add('Initializing stem separation...');

    try {
      final directory = await getApplicationDocumentsDirectory();
      final outputDir = Directory('${directory.path}/stems');
      if (!await outputDir.exists()) {
        await outputDir.create(recursive: true);
      }

      // Simulate processing steps
      final steps = [
        'Analyzing audio frequencies...',
        'Extracting vocal patterns...',
        'Isolating drum patterns...',
        'Separating bass frequencies...',
        'Processing piano/keyboard...',
        'Finalizing stem tracks...'
      ];

      for (int i = 0; i < steps.length; i++) {
        _statusController.add(steps[i]);
        _progressController.add((i + 1) / steps.length);
        await Future.delayed(const Duration(seconds: 2));
      }

      // Create mock stem files using FFmpeg (copy original file to simulate stems)
      final stemTypes = ['vocals', 'drums', 'bass', 'piano', 'other'];
      final Map<String, String> stemPaths = {};

      for (final stemType in stemTypes) {
        final outputPath = '${outputDir.path}/${stemType}_stem.wav';

        // Use FFmpeg to create a processed version (apply different filters for each stem)
        String filterCommand = _getFilterForStemType(stemType);
        final command = '-i "$inputFilePath" $filterCommand "$outputPath"';

        final session = await FFmpegKit.execute(command);
        final returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          stemPaths[stemType] = outputPath;
        } else {
          // Fallback: copy original file if filtering fails
          await _copyFile(inputFilePath, outputPath);
          stemPaths[stemType] = outputPath;
        }
      }

      _statusController.add('Stem separation completed!');
      return stemPaths;
    } catch (e) {
      _errorController.add('Stem separation failed: $e');
      return {};
    } finally {
      _isProcessing = false;
    }
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
      Map<String, String> stemPaths, Map<String, double> volumes) async {
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

      final mixFilter = filters.join(';') +
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
      String inputPath, String outputFormat) async {
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
  Future<String?> applyAudioEffect(String inputPath, String effectType,
      Map<String, dynamic> parameters) async {
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
      String effectType, Map<String, dynamic> parameters) {
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
