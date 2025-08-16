import 'dart:io' if (dart.library.io) 'dart:io';
import 'dart:convert';
import 'dart:html' as html if (dart.library.html) 'dart:html';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart'
    if (dart.library.io) 'path_provider/path_provider.dart';
import 'package:ffmpeg_kit_flutter/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter/return_code.dart';

class ExportService {
  static final ExportService _instance = ExportService._internal();
  factory ExportService() => _instance;
  ExportService._internal();

  // Stream controllers for export progress
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

  bool _isExporting = false;
  bool get isExporting => _isExporting;

  // Export audio with specific format and quality settings
  Future<String?> exportAudio({
    required String inputPath,
    required String outputFormat,
    required String quality,
    String? outputFileName,
    Map<String, String>? metadata,
  }) async {
    _isExporting = true;
    _statusController.add('Preparing export...');

    try {
      if (kIsWeb) {
        return await _exportAudioWeb(inputPath, outputFormat, outputFileName);
      } else {
        return await _exportAudioMobile(
            inputPath, outputFormat, quality, outputFileName, metadata);
      }
    } catch (e) {
      _errorController.add('Export failed: $e');
      return null;
    } finally {
      _isExporting = false;
    }
  }

  Future<String?> _exportAudioWeb(
      String inputUrl, String format, String? fileName) async {
    try {
      _statusController.add('Downloading audio...');
      _progressController.add(0.5);

      // For web, we can't process the audio file, so we'll trigger a download
      final response = await html.HttpRequest.request(
        inputUrl,
        responseType: 'blob',
      );

      if (response.status == 200) {
        final blob = response.response as html.Blob;
        final url = html.Url.createObjectUrlFromBlob(blob);

        final anchor = html.AnchorElement(href: url)
          ..setAttribute('download', fileName ?? 'exported_audio.$format')
          ..click();

        html.Url.revokeObjectUrl(url);

        _statusController.add('Export completed!');
        _progressController.add(1.0);
        return 'Downloaded to browser downloads folder';
      } else {
        throw Exception('Failed to download audio file');
      }
    } catch (e) {
      _errorController.add('Web export failed: $e');
      return null;
    }
  }

  Future<String?> _exportAudioMobile(
    String inputPath,
    String format,
    String quality,
    String? fileName,
    Map<String, String>? metadata,
  ) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final exportsDir = Directory('${directory.path}/exports');
      if (!await exportsDir.exists()) {
        await exportsDir.create(recursive: true);
      }

      final outputFileName = fileName ??
          'exported_audio_${DateTime.now().millisecondsSinceEpoch}.$format';
      final outputPath = '${exportsDir.path}/$outputFileName';

      _statusController.add('Converting to $format format...');
      _progressController.add(0.3);

      // Build FFmpeg command based on format and quality
      String codecParams = _getCodecParams(format, quality);
      String metadataParams = _buildMetadataParams(metadata);

      final command =
          '-i "$inputPath" $codecParams $metadataParams "$outputPath"';

      final session = await FFmpegKit.execute(command);
      final returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        _statusController.add('Export completed!');
        _progressController.add(1.0);
        return outputPath;
      } else {
        throw Exception('FFmpeg export failed');
      }
    } catch (e) {
      _errorController.add('Mobile export failed: $e');
      return null;
    }
  }

  String _getCodecParams(String format, String quality) {
    switch (format.toLowerCase()) {
      case 'mp3':
        switch (quality) {
          case 'high':
            return '-acodec libmp3lame -b:a 320k';
          case 'medium':
            return '-acodec libmp3lame -b:a 192k';
          case 'low':
            return '-acodec libmp3lame -b:a 128k';
          default:
            return '-acodec libmp3lame -b:a 192k';
        }

      case 'wav':
        switch (quality) {
          case 'high':
            return '-acodec pcm_s24le -ar 48000';
          case 'medium':
            return '-acodec pcm_s16le -ar 44100';
          case 'low':
            return '-acodec pcm_s16le -ar 22050';
          default:
            return '-acodec pcm_s16le -ar 44100';
        }

      case 'flac':
        return '-acodec flac -compression_level 5';

      case 'aac':
        switch (quality) {
          case 'high':
            return '-acodec aac -b:a 256k';
          case 'medium':
            return '-acodec aac -b:a 128k';
          case 'low':
            return '-acodec aac -b:a 96k';
          default:
            return '-acodec aac -b:a 128k';
        }

      default:
        return '-acodec libmp3lame -b:a 192k';
    }
  }

  String _buildMetadataParams(Map<String, String>? metadata) {
    if (metadata == null || metadata.isEmpty) return '';

    final params = <String>[];
    metadata.forEach((key, value) {
      params.add('-metadata $key="$value"');
    });

    return params.join(' ');
  }

  // Export stems as individual files
  Future<Map<String, String>?> exportStems({
    required Map<String, String> stemPaths,
    required String outputFormat,
    required String quality,
    Map<String, String>? metadata,
  }) async {
    if (kIsWeb) {
      _errorController.add('Stem export not supported on web platform');
      return null;
    }

    _isExporting = true;
    _statusController.add('Exporting stems...');

    try {
      final directory = await getApplicationDocumentsDirectory();
      final stemsDir = Directory('${directory.path}/exported_stems');
      if (!await stemsDir.exists()) {
        await stemsDir.create(recursive: true);
      }

      final exportedStems = <String, String>{};
      final totalStems = stemPaths.length;
      int currentStem = 0;

      for (final entry in stemPaths.entries) {
        final stemType = entry.key;
        final inputPath = entry.value;

        _statusController.add('Exporting $stemType stem...');
        _progressController.add(currentStem / totalStems);

        final outputFileName = '${stemType}_stem.$outputFormat';
        final outputPath = '${stemsDir.path}/$outputFileName';

        String codecParams = _getCodecParams(outputFormat, quality);
        String metadataParams = _buildMetadataParams({
          ...?metadata,
          'title': '$stemType Stem',
          'album': 'Separated Stems',
        });

        final command =
            '-i "$inputPath" $codecParams $metadataParams "$outputPath"';
        final session = await FFmpegKit.execute(command);
        final returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          exportedStems[stemType] = outputPath;
        } else {
          _errorController.add('Failed to export $stemType stem');
        }

        currentStem++;
      }

      _statusController.add('All stems exported!');
      _progressController.add(1.0);
      return exportedStems;
    } catch (e) {
      _errorController.add('Stem export failed: $e');
      return null;
    } finally {
      _isExporting = false;
    }
  }

  // Export project data as JSON
  Future<String?> exportProjectData(Map<String, dynamic> projectData) async {
    try {
      final jsonString =
          const JsonEncoder.withIndent('  ').convert(projectData);

      if (kIsWeb) {
        final bytes = utf8.encode(jsonString);
        final blob = html.Blob([bytes]);
        final url = html.Url.createObjectUrlFromBlob(blob);

        final anchor = html.AnchorElement(href: url)
          ..setAttribute('download', 'rapid_mixer_project.json')
          ..click();

        html.Url.revokeObjectUrl(url);
        return 'Downloaded to browser downloads folder';
      } else {
        final directory = await getApplicationDocumentsDirectory();
        final projectFile = File('${directory.path}/rapid_mixer_project.json');
        await projectFile.writeAsString(jsonString);
        return projectFile.path;
      }
    } catch (e) {
      _errorController.add('Failed to export project data: $e');
      return null;
    }
  }

  // Get export directory info
  Future<Map<String, dynamic>?> getExportInfo() async {
    if (kIsWeb) {
      return {
        'platform': 'web',
        'exportLocation': 'Browser Downloads Folder',
        'supportedFormats': ['mp3', 'wav'],
        'features': ['basic_export', 'project_export'],
      };
    }

    try {
      final directory = await getApplicationDocumentsDirectory();
      final exportsDir = Directory('${directory.path}/exports');

      if (!await exportsDir.exists()) {
        await exportsDir.create(recursive: true);
      }

      final files = await exportsDir.list().toList();
      final audioFiles = files
          .where((file) =>
              file.path.endsWith('.mp3') ||
              file.path.endsWith('.wav') ||
              file.path.endsWith('.flac') ||
              file.path.endsWith('.aac'))
          .toList();

      return {
        'platform': 'mobile',
        'exportLocation': exportsDir.path,
        'exportCount': audioFiles.length,
        'supportedFormats': ['mp3', 'wav', 'flac', 'aac'],
        'features': [
          'format_conversion',
          'quality_settings',
          'metadata_embedding',
          'stem_export'
        ],
      };
    } catch (e) {
      _errorController.add('Failed to get export info: $e');
      return null;
    }
  }

  void dispose() {
    _progressController.close();
    _statusController.close();
    _errorController.close();
  }
}
