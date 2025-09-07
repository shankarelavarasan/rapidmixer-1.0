import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';

enum VideoProcessingStage {
  idle,
  uploading,
  splitting,
  aiProcessing,
  rendering,
  merging,
  completed,
  error
}

class VideoProvider extends ChangeNotifier {
  final Dio _dio = Dio();
  
  // State variables
  VideoProcessingStage _currentStage = VideoProcessingStage.idle;
  double _uploadProgress = 0.0;
  double _processingProgress = 0.0;
  String? _selectedVideoPath;
  String? _selectedVideoName;
  int? _videoDuration;
  String? _processedVideoUrl;
  String? _errorMessage;
  List<String> _sceneUrls = [];
  String? _jobId;
  
  // Backend API base URL
  static const String baseUrl = 'https://rapid-video-backend.onrender.com';
  
  // Getters
  VideoProcessingStage get currentStage => _currentStage;
  double get uploadProgress => _uploadProgress;
  double get processingProgress => _processingProgress;
  String? get selectedVideoPath => _selectedVideoPath;
  String? get selectedVideoName => _selectedVideoName;
  int? get videoDuration => _videoDuration;
  String? get processedVideoUrl => _processedVideoUrl;
  String? get errorMessage => _errorMessage;
  List<String> get sceneUrls => _sceneUrls;
  String? get jobId => _jobId;
  
  bool get isProcessing => _currentStage != VideoProcessingStage.idle && 
                          _currentStage != VideoProcessingStage.completed && 
                          _currentStage != VideoProcessingStage.error;
  
  String get stageDescription {
    switch (_currentStage) {
      case VideoProcessingStage.idle:
        return 'Ready to upload';
      case VideoProcessingStage.uploading:
        return 'Uploading video...';
      case VideoProcessingStage.splitting:
        return 'Splitting into scenes...';
      case VideoProcessingStage.aiProcessing:
        return 'AI analyzing scenes...';
      case VideoProcessingStage.rendering:
        return 'Generating 3D animations...';
      case VideoProcessingStage.merging:
        return 'Merging final video...';
      case VideoProcessingStage.completed:
        return 'Video ready for download!';
      case VideoProcessingStage.error:
        return 'Error occurred';
    }
  }
  
  // Select video file
  Future<void> selectVideo() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.video,
        allowMultiple: false,
        withData: true,
      );
      
      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        
        // Check file size (max 100MB for 3 minutes)
        if (file.size > 100 * 1024 * 1024) {
          _setError('Video file too large. Please select a video under 100MB.');
          return;
        }
        
        _selectedVideoPath = file.path;
        _selectedVideoName = file.name;
        _errorMessage = null;
        notifyListeners();
      }
    } catch (e) {
      _setError('Failed to select video: $e');
    }
  }
  
  // Upload and process video
  Future<void> uploadAndProcessVideo() async {
    if (_selectedVideoPath == null) {
      _setError('No video selected');
      return;
    }
    
    try {
      _currentStage = VideoProcessingStage.uploading;
      _uploadProgress = 0.0;
      _errorMessage = null;
      notifyListeners();
      
      // Create form data
      FormData formData = FormData.fromMap({
        'video': await MultipartFile.fromFile(
          _selectedVideoPath!,
          filename: _selectedVideoName,
        ),
      });
      
      // Upload video with progress tracking
      Response response = await _dio.post(
        '$baseUrl/api/upload',
        data: formData,
        onSendProgress: (sent, total) {
          _uploadProgress = sent / total;
          notifyListeners();
        },
      );
      
      if (response.statusCode == 200) {
        _jobId = response.data['job_id'];
        _startPollingProgress();
      } else {
        _setError('Upload failed: ${response.statusMessage}');
      }
    } catch (e) {
      _setError('Upload error: $e');
    }
  }
  
  // Poll processing progress
  void _startPollingProgress() async {
    if (_jobId == null) return;
    
    while (_currentStage != VideoProcessingStage.completed && 
           _currentStage != VideoProcessingStage.error) {
      try {
        await Future.delayed(const Duration(seconds: 2));
        
        Response response = await _dio.get('$baseUrl/api/status/$_jobId');
        
        if (response.statusCode == 200) {
          final data = response.data;
          _updateProgressFromStatus(data);
        }
      } catch (e) {
        _setError('Failed to get progress: $e');
        break;
      }
    }
  }
  
  // Update progress from status response
  void _updateProgressFromStatus(Map<String, dynamic> data) {
    final stage = data['stage'] as String;
    final progress = (data['progress'] as num).toDouble();
    
    switch (stage) {
      case 'splitting':
        _currentStage = VideoProcessingStage.splitting;
        break;
      case 'ai_processing':
        _currentStage = VideoProcessingStage.aiProcessing;
        break;
      case 'rendering':
        _currentStage = VideoProcessingStage.rendering;
        break;
      case 'merging':
        _currentStage = VideoProcessingStage.merging;
        break;
      case 'completed':
        _currentStage = VideoProcessingStage.completed;
        _processedVideoUrl = data['download_url'];
        break;
      case 'error':
        _setError(data['error_message'] ?? 'Unknown error occurred');
        return;
    }
    
    _processingProgress = progress;
    
    if (data['scene_urls'] != null) {
      _sceneUrls = List<String>.from(data['scene_urls']);
    }
    
    notifyListeners();
  }
  
  // Download processed video
  Future<void> downloadVideo() async {
    if (_processedVideoUrl == null) {
      _setError('No processed video available');
      return;
    }
    
    try {
      // For web, we'll open the download URL in a new tab
      if (kIsWeb) {
        // This would typically use url_launcher
        // For now, we'll just copy the URL
        _setError('Download URL: $_processedVideoUrl');
      }
    } catch (e) {
      _setError('Download failed: $e');
    }
  }
  
  // Reset state
  void reset() {
    _currentStage = VideoProcessingStage.idle;
    _uploadProgress = 0.0;
    _processingProgress = 0.0;
    _selectedVideoPath = null;
    _selectedVideoName = null;
    _videoDuration = null;
    _processedVideoUrl = null;
    _errorMessage = null;
    _sceneUrls.clear();
    _jobId = null;
    notifyListeners();
  }
  
  // Set error state
  void _setError(String message) {
    _currentStage = VideoProcessingStage.error;
    _errorMessage = message;
    notifyListeners();
  }
}