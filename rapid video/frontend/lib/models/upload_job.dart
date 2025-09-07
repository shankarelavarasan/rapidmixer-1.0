import 'package:equatable/equatable.dart';
import 'processing_stage.dart';

enum UploadStatus {
  uploading,
  uploaded,
  processing,
  completed,
  failed,
}

class UploadJob extends Equatable {
  final String id;
  final String? jobId;
  final String fileName;
  final int fileSize;
  final UploadStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? completedAt;
  final double uploadProgress;
  final double processingProgress;
  final String? downloadUrl;
  final String? errorMessage;
  final Map<String, dynamic>? metadata;
  final ProcessingStage? currentStage;
  final Duration? estimatedTimeRemaining;

  const UploadJob({
    required this.id,
    this.jobId,
    required this.fileName,
    required this.fileSize,
    required this.status,
    required this.createdAt,
    this.updatedAt,
    this.completedAt,
    this.uploadProgress = 0.0,
    this.processingProgress = 0.0,
    this.downloadUrl,
    this.errorMessage,
    this.metadata,
    this.currentStage,
    this.estimatedTimeRemaining,
  });

  // Computed properties
  bool get isCompleted => status == UploadStatus.completed || status == UploadStatus.failed;
  bool get isSuccessful => status == UploadStatus.completed;
  bool get isFailed => status == UploadStatus.failed;
  bool get isProcessing => status == UploadStatus.processing;
  bool get isUploading => status == UploadStatus.uploading;
  bool get isUploaded => status == UploadStatus.uploaded;
  
  double get overallProgress {
    if (isUploading) {
      return uploadProgress * 0.5; // Upload is 50% of overall progress
    }
    if (isUploaded || isProcessing) {
      return 0.5 + (processingProgress * 0.5); // Processing is the other 50%
    }
    if (isCompleted) {
      return 1.0;
    }
    return 0.0;
  }
  
  Duration? get processingDuration {
    if (completedAt != null) {
      return completedAt!.difference(createdAt);
    }
    if (status == UploadStatus.processing || status == UploadStatus.uploaded) {
      return DateTime.now().difference(createdAt);
    }
    return null;
  }
  
  String get statusDisplayName {
    switch (status) {
      case UploadStatus.uploading:
        return 'Uploading';
      case UploadStatus.uploaded:
        return 'Uploaded';
      case UploadStatus.processing:
        return 'Processing';
      case UploadStatus.completed:
        return 'Completed';
      case UploadStatus.failed:
        return 'Failed';
    }
  }
  
  String get progressDisplayText {
    if (isUploading) {
      return '${(uploadProgress * 100).toInt()}% uploaded';
    }
    if (isProcessing) {
      return '${(processingProgress * 100).toInt()}% processed';
    }
    if (isCompleted) {
      return isSuccessful ? 'Ready for download' : 'Failed';
    }
    return 'Pending';
  }

  UploadJob copyWith({
    String? id,
    String? jobId,
    String? fileName,
    int? fileSize,
    UploadStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? completedAt,
    double? uploadProgress,
    double? processingProgress,
    String? downloadUrl,
    String? errorMessage,
    Map<String, dynamic>? metadata,
    ProcessingStage? currentStage,
    Duration? estimatedTimeRemaining,
  }) {
    return UploadJob(
      id: id ?? this.id,
      jobId: jobId ?? this.jobId,
      fileName: fileName ?? this.fileName,
      fileSize: fileSize ?? this.fileSize,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completedAt: completedAt ?? this.completedAt,
      uploadProgress: uploadProgress ?? this.uploadProgress,
      processingProgress: processingProgress ?? this.processingProgress,
      downloadUrl: downloadUrl ?? this.downloadUrl,
      errorMessage: errorMessage ?? this.errorMessage,
      metadata: metadata ?? this.metadata,
      currentStage: currentStage ?? this.currentStage,
      estimatedTimeRemaining: estimatedTimeRemaining ?? this.estimatedTimeRemaining,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'jobId': jobId,
      'fileName': fileName,
      'fileSize': fileSize,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'uploadProgress': uploadProgress,
      'processingProgress': processingProgress,
      'downloadUrl': downloadUrl,
      'errorMessage': errorMessage,
      'metadata': metadata,
    };
  }

  factory UploadJob.fromJson(Map<String, dynamic> json) {
    return UploadJob(
      id: json['id'] as String,
      jobId: json['jobId'] as String?,
      fileName: json['fileName'] as String,
      fileSize: json['fileSize'] as int,
      status: UploadStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => UploadStatus.failed,
      ),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      uploadProgress: (json['uploadProgress'] as num?)?.toDouble() ?? 0.0,
      processingProgress: (json['processingProgress'] as num?)?.toDouble() ?? 0.0,
      downloadUrl: json['downloadUrl'] as String?,
      errorMessage: json['errorMessage'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  @override
  List<Object?> get props => [
        id,
        jobId,
        fileName,
        fileSize,
        status,
        createdAt,
        updatedAt,
        completedAt,
        uploadProgress,
        processingProgress,
        downloadUrl,
        errorMessage,
        metadata,
        currentStage,
        estimatedTimeRemaining,
      ];

  @override
  String toString() {
    return 'UploadJob(id: $id, fileName: $fileName, status: $status, progress: ${(processingProgress * 100).toInt()}%)';
  }
}

// Extension for list operations
extension UploadJobListExtension on List<UploadJob> {
  List<UploadJob> get completed => where((job) => job.isCompleted).toList();
  List<UploadJob> get successful => where((job) => job.isSuccessful).toList();
  List<UploadJob> get failed => where((job) => job.isFailed).toList();
  List<UploadJob> get processing => where((job) => job.isProcessing).toList();
  List<UploadJob> get uploading => where((job) => job.isUploading).toList();
  
  List<UploadJob> sortedByDate() {
    final sorted = List<UploadJob>.from(this);
    sorted.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return sorted;
  }
  
  List<UploadJob> filterByStatus(UploadStatus status) {
    return where((job) => job.status == status).toList();
  }
  
  List<UploadJob> searchByFileName(String query) {
    if (query.isEmpty) return this;
    final lowerQuery = query.toLowerCase();
    return where((job) => 
        job.fileName.toLowerCase().contains(lowerQuery)
    ).toList();
  }
}