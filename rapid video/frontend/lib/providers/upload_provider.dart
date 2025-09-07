import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:file_picker/file_picker.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../utils/constants.dart';
import '../models/upload_job.dart';
import '../models/processing_stage.dart';

class UploadProvider extends ChangeNotifier {
  final ApiService _apiService;
  final StorageService _storageService;
  
  // Current upload state
  UploadJob? _currentJob;
  bool _isUploading = false;
  bool _isProcessing = false;
  double _uploadProgress = 0.0;
  double _processingProgress = 0.0;
  String? _errorMessage;
  String? _downloadUrl;
  
  // Processing stages
  List<ProcessingStage> _processingStages = [];
  int _currentStageIndex = 0;
  
  // Polling timer
  Timer? _pollingTimer;
  int _pollingAttempts = 0;
  
  // Upload history
  List<UploadJob> _uploadHistory = [];
  
  UploadProvider(this._apiService, this._storageService) {
    _initializeStages();
    _loadUploadHistory();
  }

  // Getters
  UploadJob? get currentJob => _currentJob;
  bool get isUploading => _isUploading;
  bool get isProcessing => _isProcessing;
  bool get hasActiveJob => _currentJob != null && !_currentJob!.isCompleted;
  double get uploadProgress => _uploadProgress;
  double get processingProgress => _processingProgress;
  String? get errorMessage => _errorMessage;
  String? get downloadUrl => _downloadUrl;
  List<ProcessingStage> get processingStages => _processingStages;
  int get currentStageIndex => _currentStageIndex;
  List<UploadJob> get uploadHistory => _uploadHistory;
  ProcessingStage? get currentStage => 
      _currentStageIndex < _processingStages.length 
          ? _processingStages[_currentStageIndex] 
          : null;
  
  bool get canUpload => !_isUploading && !_isProcessing;
  
  String get statusMessage {
    if (_errorMessage != null) return _errorMessage!;
    if (_isUploading) return 'Uploading video...';
    if (_isProcessing) {
      final stage = currentStage;
      return stage?.description ?? 'Processing...';
    }
    if (_downloadUrl != null) return 'Processing complete!';
    return 'Ready to upload';
  }

  void _initializeStages() {
    _processingStages = [
      ProcessingStage(
        id: 'uploading',
        name: 'Uploading',
        description: AppConstants.stageDescriptions['uploading']!,
        estimatedDuration: AppConstants.stageEstimatedTimes['uploading']!,
        isCompleted: false,
        isActive: false,
      ),
      ProcessingStage(
        id: 'analyzing',
        name: 'Analyzing',
        description: AppConstants.stageDescriptions['analyzing']!,
        estimatedDuration: AppConstants.stageEstimatedTimes['analyzing']!,
        isCompleted: false,
        isActive: false,
      ),
      ProcessingStage(
        id: 'splitting',
        name: 'Splitting',
        description: AppConstants.stageDescriptions['splitting']!,
        estimatedDuration: AppConstants.stageEstimatedTimes['splitting']!,
        isCompleted: false,
        isActive: false,
      ),
      ProcessingStage(
        id: 'ai_processing',
        name: 'AI Processing',
        description: AppConstants.stageDescriptions['ai_processing']!,
        estimatedDuration: AppConstants.stageEstimatedTimes['ai_processing']!,
        isCompleted: false,
        isActive: false,
      ),
      ProcessingStage(
        id: 'rendering',
        name: 'Rendering',
        description: AppConstants.stageDescriptions['rendering']!,
        estimatedDuration: AppConstants.stageEstimatedTimes['rendering']!,
        isCompleted: false,
        isActive: false,
      ),
      ProcessingStage(
        id: 'merging',
        name: 'Merging',
        description: AppConstants.stageDescriptions['merging']!,
        estimatedDuration: AppConstants.stageEstimatedTimes['merging']!,
        isCompleted: false,
        isActive: false,
      ),
      ProcessingStage(
        id: 'finalizing',
        name: 'Finalizing',
        description: AppConstants.stageDescriptions['finalizing']!,
        estimatedDuration: AppConstants.stageEstimatedTimes['finalizing']!,
        isCompleted: false,
        isActive: false,
      ),
    ];
  }

  Future<void> _loadUploadHistory() async {
    try {
      final historyMaps = _storageService.getUploadHistory();
      _uploadHistory = historyMaps.map((map) => UploadJob.fromJson(map)).toList();
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading upload history: $e');
    }
  }

  Future<void> _saveUploadHistory() async {
    try {
      await _storageService.setUploadHistory(_uploadHistory);
    } catch (e) {
      debugPrint('Error saving upload history: $e');
    }
  }

  Future<bool> pickAndUploadVideo() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.video,
        allowMultiple: false,
        withData: kIsWeb,
      );

      if (result == null || result.files.isEmpty) {
        return false;
      }

      final file = result.files.first;
      return await uploadVideo(file);
    } catch (e) {
      _setError('Failed to pick video file: $e');
      return false;
    }
  }

  Future<bool> uploadVideo(PlatformFile file) async {
    if (!canUpload) {
      _setError('Another upload is already in progress');
      return false;
    }

    // Validate file
    final validation = _validateFile(file);
    if (!validation.isValid) {
      _setError(validation.errorMessage!);
      return false;
    }

    _clearState();
    _createNewJob(file);
    
    try {
      _setUploading(true);
      _setCurrentStage(0); // Start with uploading stage
      
      // Upload file
      final response = await _apiService.uploadVideo(
        file,
        onProgress: (progress) {
          _setUploadProgress(progress);
        },
      );

      if (response.isSuccess && response.data != null) {
        final jobId = response.data!['job_id'] as String;
        _currentJob = _currentJob!.copyWith(
          jobId: jobId,
          status: UploadStatus.uploaded,
        );
        
        _setUploading(false);
        _completeCurrentStage();
        _setCurrentStage(1); // Move to analyzing stage
        
        // Start processing monitoring
        await _startProcessingMonitoring(jobId);
        return true;
      } else {
        _setError(response.error ?? AppConstants.errorUploadFailed);
        return false;
      }
    } catch (e) {
      _setError('Upload failed: $e');
      return false;
    }
  }

  FileValidationResult _validateFile(PlatformFile file) {
    // Check file size
    if (file.size > AppConstants.maxFileSizeBytes) {
      return FileValidationResult(
        isValid: false,
        errorMessage: AppConstants.errorFileTooBig,
      );
    }

    // Check file format
    if (file.extension != null && 
        !Utils.isSupportedVideoFormat(file.name)) {
      return FileValidationResult(
        isValid: false,
        errorMessage: AppConstants.errorUnsupportedFormat,
      );
    }

    return FileValidationResult(isValid: true);
  }

  void _createNewJob(PlatformFile file) {
    _currentJob = UploadJob(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      fileName: file.name,
      fileSize: file.size,
      status: UploadStatus.uploading,
      createdAt: DateTime.now(),
      uploadProgress: 0.0,
      processingProgress: 0.0,
    );
  }

  Future<void> _startProcessingMonitoring(String jobId) async {
    _setProcessing(true);
    _pollingAttempts = 0;
    
    _pollingTimer = Timer.periodic(
      Duration(seconds: AppConstants.pollingIntervalSeconds),
      (timer) => _pollJobStatus(jobId),
    );
  }

  Future<void> _pollJobStatus(String jobId) async {
    if (_pollingAttempts >= AppConstants.maxPollingAttempts) {
      _stopPolling();
      _setError('Processing timeout. Please try again.');
      return;
    }

    _pollingAttempts++;

    try {
      final response = await _apiService.getJobStatus(jobId);
      
      if (response.isSuccess && response.data != null) {
        final jobData = response.data!;
        _updateJobFromResponse(jobData);
        
        final status = jobData['status'] as String;
        if (status == 'completed') {
          _handleJobCompleted(jobData);
        } else if (status == 'failed') {
          _handleJobFailed(jobData);
        }
      } else {
        debugPrint('Failed to get job status: ${response.error}');
      }
    } catch (e) {
      debugPrint('Error polling job status: $e');
    }
  }

  void _updateJobFromResponse(Map<String, dynamic> jobData) {
    final status = jobData['status'] as String;
    final progress = (jobData['progress'] as num?)?.toDouble() ?? 0.0;
    final currentStage = jobData['current_stage'] as String?;
    
    _setProcessingProgress(progress);
    
    // Update current stage based on API response
    if (currentStage != null) {
      _updateCurrentStageFromApi(currentStage);
    }
    
    _currentJob = _currentJob!.copyWith(
      status: _parseUploadStatus(status),
      processingProgress: progress,
      updatedAt: DateTime.now(),
    );
    
    notifyListeners();
  }

  void _updateCurrentStageFromApi(String apiStage) {
    final stageIndex = _processingStages.indexWhere(
      (stage) => stage.id == apiStage,
    );
    
    if (stageIndex != -1 && stageIndex != _currentStageIndex) {
      // Complete previous stages
      for (int i = 0; i < stageIndex; i++) {
        _processingStages[i] = _processingStages[i].copyWith(
          isCompleted: true,
          isActive: false,
        );
      }
      
      // Set current stage
      _setCurrentStage(stageIndex);
    }
  }

  void _handleJobCompleted(Map<String, dynamic> jobData) {
    _stopPolling();
    
    final downloadUrl = jobData['download_url'] as String?;
    if (downloadUrl != null) {
      _downloadUrl = downloadUrl;
      _currentJob = _currentJob!.copyWith(
        status: UploadStatus.completed,
        downloadUrl: downloadUrl,
        completedAt: DateTime.now(),
      );
      
      // Complete all stages
      _completeAllStages();
      _setProcessing(false);
      
      // Add to history
      _addToHistory(_currentJob!);
      
      notifyListeners();
    } else {
      _setError('Processing completed but download URL not available');
    }
  }

  void _handleJobFailed(Map<String, dynamic> jobData) {
    _stopPolling();
    
    final errorMessage = jobData['error'] as String? ?? 
                        AppConstants.errorProcessingFailed;
    
    _currentJob = _currentJob!.copyWith(
      status: UploadStatus.failed,
      errorMessage: errorMessage,
    );
    
    _setError(errorMessage);
    _addToHistory(_currentJob!);
  }

  UploadStatus _parseUploadStatus(String status) {
    switch (status.toLowerCase()) {
      case 'uploading':
        return UploadStatus.uploading;
      case 'uploaded':
        return UploadStatus.uploaded;
      case 'processing':
        return UploadStatus.processing;
      case 'completed':
        return UploadStatus.completed;
      case 'failed':
        return UploadStatus.failed;
      default:
        return UploadStatus.processing;
    }
  }

  void _stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  void _setUploading(bool uploading) {
    _isUploading = uploading;
    notifyListeners();
  }

  void _setProcessing(bool processing) {
    _isProcessing = processing;
    notifyListeners();
  }

  void _setUploadProgress(double progress) {
    _uploadProgress = progress.clamp(0.0, 1.0);
    if (_currentJob != null) {
      _currentJob = _currentJob!.copyWith(uploadProgress: _uploadProgress);
    }
    notifyListeners();
  }

  void _setProcessingProgress(double progress) {
    _processingProgress = progress.clamp(0.0, 1.0);
    notifyListeners();
  }

  void _setCurrentStage(int index) {
    if (index >= 0 && index < _processingStages.length) {
      // Deactivate previous stage
      if (_currentStageIndex < _processingStages.length) {
        _processingStages[_currentStageIndex] = 
            _processingStages[_currentStageIndex].copyWith(isActive: false);
      }
      
      // Activate new stage
      _currentStageIndex = index;
      _processingStages[index] = _processingStages[index].copyWith(
        isActive: true,
        isCompleted: false,
      );
      
      notifyListeners();
    }
  }

  void _completeCurrentStage() {
    if (_currentStageIndex < _processingStages.length) {
      _processingStages[_currentStageIndex] = 
          _processingStages[_currentStageIndex].copyWith(
            isCompleted: true,
            isActive: false,
          );
      notifyListeners();
    }
  }

  void _completeAllStages() {
    for (int i = 0; i < _processingStages.length; i++) {
      _processingStages[i] = _processingStages[i].copyWith(
        isCompleted: true,
        isActive: false,
      );
    }
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    _setUploading(false);
    _setProcessing(false);
    _stopPolling();
    
    if (_currentJob != null) {
      _currentJob = _currentJob!.copyWith(
        status: UploadStatus.failed,
        errorMessage: error,
      );
      _addToHistory(_currentJob!);
    }
    
    notifyListeners();
  }

  void _clearState() {
    _errorMessage = null;
    _downloadUrl = null;
    _uploadProgress = 0.0;
    _processingProgress = 0.0;
    _currentStageIndex = 0;
    _initializeStages();
    _stopPolling();
    notifyListeners();
  }

  void _addToHistory(UploadJob job) {
    _uploadHistory.insert(0, job);
    
    // Keep only the last 50 items
    if (_uploadHistory.length > AppConstants.maxHistoryItems) {
      _uploadHistory = _uploadHistory.take(AppConstants.maxHistoryItems).toList();
    }
    
    _saveUploadHistory();
  }

  // Public methods
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void clearCurrentJob() {
    _currentJob = null;
    _clearState();
  }

  Future<void> retryCurrentJob() async {
    if (_currentJob != null && _currentJob!.status == UploadStatus.failed) {
      // Create a new job based on the failed one
      final failedJob = _currentJob!;
      _clearState();
      
      // Note: We would need the original file to retry
      // This is a limitation of the current implementation
      _setError('Please select the video file again to retry');
    }
  }

  Future<void> cancelCurrentJob() async {
    if (_currentJob != null && hasActiveJob) {
      _stopPolling();
      
      // Try to cancel the job on the server
      if (_currentJob!.jobId != null) {
        try {
          await _apiService.cancelJob(_currentJob!.jobId!);
        } catch (e) {
          debugPrint('Error canceling job: $e');
        }
      }
      
      _currentJob = _currentJob!.copyWith(
        status: UploadStatus.failed,
        errorMessage: 'Cancelled by user',
      );
      
      _addToHistory(_currentJob!);
      _clearState();
    }
  }

  void removeFromHistory(String jobId) {
    _uploadHistory.removeWhere((job) => job.id == jobId);
    _saveUploadHistory();
    notifyListeners();
  }

  void retryJob(String jobId) {
    final jobIndex = _uploadHistory.indexWhere((job) => job.id == jobId);
    if (jobIndex != -1) {
      final job = _uploadHistory[jobIndex];
      if (job.isFailed) {
        // Reset job status and retry
        final retryJob = job.copyWith(
          status: UploadStatus.uploading,
          uploadProgress: 0.0,
          processingProgress: 0.0,
          errorMessage: null,
          updatedAt: DateTime.now(),
        );
        _uploadHistory[jobIndex] = retryJob;
        _saveUploadHistory();
        notifyListeners();
        
        // TODO: Implement actual retry logic
        debugPrint('Retrying job: $jobId');
      }
    }
  }
  
  void deleteJob(String jobId) {
    _uploadHistory.removeWhere((job) => job.id == jobId);
    _saveUploadHistory();
    notifyListeners();
  }

  void clearHistory() {
    _uploadHistory.clear();
    _saveUploadHistory();
    notifyListeners();
  }

  @override
  void dispose() {
    _stopPolling();
    super.dispose();
  }
}

class FileValidationResult {
  final bool isValid;
  final String? errorMessage;

  FileValidationResult({
    required this.isValid,
    this.errorMessage,
  });
}