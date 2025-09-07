import 'package:equatable/equatable.dart';

class ProcessingStage extends Equatable {
  final String id;
  final String name;
  final String description;
  final int estimatedDuration; // in seconds
  final bool isCompleted;
  final bool isActive;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final double progress; // 0.0 to 1.0
  final String? errorMessage;
  final Map<String, dynamic>? metadata;

  const ProcessingStage({
    required this.id,
    required this.name,
    required this.description,
    required this.estimatedDuration,
    this.isCompleted = false,
    this.isActive = false,
    this.startedAt,
    this.completedAt,
    this.progress = 0.0,
    this.errorMessage,
    this.metadata,
  });

  // Computed properties
  bool get isInProgress => isActive && !isCompleted;
  bool get isPending => !isActive && !isCompleted;
  bool get hasFailed => errorMessage != null;
  
  Duration? get actualDuration {
    if (startedAt != null && completedAt != null) {
      return completedAt!.difference(startedAt!);
    }
    if (startedAt != null && isActive) {
      return DateTime.now().difference(startedAt!);
    }
    return null;
  }
  
  Duration get estimatedDurationDuration => Duration(seconds: estimatedDuration);
  
  String get statusDisplayName {
    if (hasFailed) return 'Failed';
    if (isCompleted) return 'Completed';
    if (isActive) return 'In Progress';
    return 'Pending';
  }
  
  String get progressDisplayText {
    if (hasFailed) return 'Failed';
    if (isCompleted) return 'Completed';
    if (isActive) return '${(progress * 100).toInt()}%';
    return 'Waiting';
  }
  
  String get timeDisplayText {
    final actual = actualDuration;
    if (actual != null) {
      return _formatDuration(actual);
    }
    return _formatDuration(estimatedDurationDuration);
  }
  
  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    
    if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    } else {
      return '${seconds}s';
    }
  }

  ProcessingStage copyWith({
    String? id,
    String? name,
    String? description,
    int? estimatedDuration,
    bool? isCompleted,
    bool? isActive,
    DateTime? startedAt,
    DateTime? completedAt,
    double? progress,
    String? errorMessage,
    Map<String, dynamic>? metadata,
  }) {
    return ProcessingStage(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      estimatedDuration: estimatedDuration ?? this.estimatedDuration,
      isCompleted: isCompleted ?? this.isCompleted,
      isActive: isActive ?? this.isActive,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      progress: progress ?? this.progress,
      errorMessage: errorMessage ?? this.errorMessage,
      metadata: metadata ?? this.metadata,
    );
  }

  ProcessingStage start() {
    return copyWith(
      isActive: true,
      isCompleted: false,
      startedAt: DateTime.now(),
      errorMessage: null,
    );
  }

  ProcessingStage complete() {
    return copyWith(
      isActive: false,
      isCompleted: true,
      completedAt: DateTime.now(),
      progress: 1.0,
      errorMessage: null,
    );
  }

  ProcessingStage fail(String error) {
    return copyWith(
      isActive: false,
      isCompleted: false,
      errorMessage: error,
      completedAt: DateTime.now(),
    );
  }

  ProcessingStage updateProgress(double newProgress) {
    return copyWith(
      progress: newProgress.clamp(0.0, 1.0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'estimatedDuration': estimatedDuration,
      'isCompleted': isCompleted,
      'isActive': isActive,
      'startedAt': startedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'progress': progress,
      'errorMessage': errorMessage,
      'metadata': metadata,
    };
  }

  factory ProcessingStage.fromJson(Map<String, dynamic> json) {
    return ProcessingStage(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      estimatedDuration: json['estimatedDuration'] as int,
      isCompleted: json['isCompleted'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? false,
      startedAt: json['startedAt'] != null 
          ? DateTime.parse(json['startedAt'] as String)
          : null,
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      progress: (json['progress'] as num?)?.toDouble() ?? 0.0,
      errorMessage: json['errorMessage'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        estimatedDuration,
        isCompleted,
        isActive,
        startedAt,
        completedAt,
        progress,
        errorMessage,
        metadata,
      ];

  @override
  String toString() {
    return 'ProcessingStage(id: $id, name: $name, status: $statusDisplayName, progress: ${(progress * 100).toInt()}%)';
  }
}

// Predefined stage templates
class ProcessingStageTemplates {
  static const List<Map<String, dynamic>> defaultStages = [
    {
      'id': 'uploading',
      'name': 'Uploading',
      'description': 'Uploading your video to our servers...',
      'estimatedDuration': 30,
    },
    {
      'id': 'analyzing',
      'name': 'Analyzing',
      'description': 'Analyzing video content and structure...',
      'estimatedDuration': 15,
    },
    {
      'id': 'splitting',
      'name': 'Splitting',
      'description': 'Splitting video into 8-second scenes...',
      'estimatedDuration': 10,
    },
    {
      'id': 'ai_processing',
      'name': 'AI Processing',
      'description': 'Converting scenes to 3D with AI magic...',
      'estimatedDuration': 120,
    },
    {
      'id': 'rendering',
      'name': 'Rendering',
      'description': 'Rendering high-quality 3D animations...',
      'estimatedDuration': 60,
    },
    {
      'id': 'merging',
      'name': 'Merging',
      'description': 'Combining scenes into final video...',
      'estimatedDuration': 30,
    },
    {
      'id': 'finalizing',
      'name': 'Finalizing',
      'description': 'Adding finishing touches and optimizing...',
      'estimatedDuration': 15,
    },
  ];

  static List<ProcessingStage> createDefaultStages() {
    return defaultStages.map((stageData) => ProcessingStage(
      id: stageData['id'] as String,
      name: stageData['name'] as String,
      description: stageData['description'] as String,
      estimatedDuration: stageData['estimatedDuration'] as int,
    )).toList();
  }

  static ProcessingStage createStage({
    required String id,
    required String name,
    required String description,
    int estimatedDuration = 30,
  }) {
    return ProcessingStage(
      id: id,
      name: name,
      description: description,
      estimatedDuration: estimatedDuration,
    );
  }
}

// Extension for list operations
extension ProcessingStageListExtension on List<ProcessingStage> {
  List<ProcessingStage> get completed => where((stage) => stage.isCompleted).toList();
  List<ProcessingStage> get active => where((stage) => stage.isActive).toList();
  List<ProcessingStage> get pending => where((stage) => stage.isPending).toList();
  List<ProcessingStage> get failed => where((stage) => stage.hasFailed).toList();
  
  ProcessingStage? get currentStage => active.isNotEmpty ? active.first : null;
  ProcessingStage? get nextStage {
    final currentIndex = indexWhere((stage) => stage.isActive);
    if (currentIndex != -1 && currentIndex < length - 1) {
      return this[currentIndex + 1];
    }
    return null;
  }
  
  double get overallProgress {
    if (isEmpty) return 0.0;
    
    double totalProgress = 0.0;
    for (final stage in this) {
      if (stage.isCompleted) {
        totalProgress += 1.0;
      } else if (stage.isActive) {
        totalProgress += stage.progress;
      }
    }
    
    return totalProgress / length;
  }
  
  Duration get totalEstimatedDuration {
    final totalSeconds = fold<int>(0, (sum, stage) => sum + stage.estimatedDuration);
    return Duration(seconds: totalSeconds);
  }
  
  Duration? get totalActualDuration {
    final completedStages = completed;
    if (completedStages.isEmpty) return null;
    
    int totalSeconds = 0;
    for (final stage in completedStages) {
      final duration = stage.actualDuration;
      if (duration != null) {
        totalSeconds += duration.inSeconds;
      }
    }
    
    return Duration(seconds: totalSeconds);
  }
  
  List<ProcessingStage> updateStageProgress(String stageId, double progress) {
    return map((stage) {
      if (stage.id == stageId) {
        return stage.updateProgress(progress);
      }
      return stage;
    }).toList();
  }
  
  List<ProcessingStage> activateStage(String stageId) {
    return map((stage) {
      if (stage.id == stageId) {
        return stage.start();
      } else if (stage.isActive) {
        return stage.copyWith(isActive: false);
      }
      return stage;
    }).toList();
  }
  
  List<ProcessingStage> completeStage(String stageId) {
    return map((stage) {
      if (stage.id == stageId) {
        return stage.complete();
      }
      return stage;
    }).toList();
  }
  
  List<ProcessingStage> failStage(String stageId, String error) {
    return map((stage) {
      if (stage.id == stageId) {
        return stage.fail(error);
      }
      return stage;
    }).toList();
  }
}