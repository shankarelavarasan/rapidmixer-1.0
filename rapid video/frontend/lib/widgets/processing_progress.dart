import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/upload_provider.dart';
import '../providers/theme_provider.dart';
import '../models/upload_job.dart';
import '../models/processing_stage.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';

class ProcessingProgress extends StatefulWidget {
  const ProcessingProgress({super.key});

  @override
  State<ProcessingProgress> createState() => _ProcessingProgressState();
}

class _ProcessingProgressState extends State<ProcessingProgress>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _progressController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _progressController = AnimationController(
      duration: AppConstants.longAnimationDuration,
      vsync: this,
    );

    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _progressController,
      curve: Curves.easeInOut,
    ));

    _pulseController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<UploadProvider>(
      builder: (context, uploadProvider, child) {
        final job = uploadProvider.currentJob;
        if (job == null) {
          return const SizedBox.shrink();
        }

        return _buildProgressContent(context, job);
      },
    );
  }

  Widget _buildProgressContent(BuildContext context, UploadJob job) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Overall Progress
        _buildOverallProgress(context, job, themeProvider),
        
        const SizedBox(height: Spacing.xl),
        
        // Processing Stages
        _buildProcessingStages(context, job, themeProvider),
        
        const SizedBox(height: Spacing.xl),
        
        // Current Stage Details
        if (job.currentStage != null)
          _buildCurrentStageDetails(context, job, themeProvider),
        
        const SizedBox(height: Spacing.lg),
        
        // Estimated Time
        _buildEstimatedTime(context, job),
      ],
    );
  }

  Widget _buildOverallProgress(BuildContext context, UploadJob job, ThemeProvider themeProvider) {
    final theme = Theme.of(context);
    final overallProgress = job.overallProgress;
    
    return Container(
      padding: const EdgeInsets.all(Spacing.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: themeProvider.primaryGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(BorderRadii.lg),
        boxShadow: themeProvider.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: job.isProcessing ? _pulseAnimation.value : 1.0,
                    child: Container(
                      padding: const EdgeInsets.all(Spacing.sm),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _getStatusIcon(job.status),
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  );
                },
              ),
              
              const SizedBox(width: Spacing.md),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getStatusTitle(job.status),
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    
                    const SizedBox(height: Spacing.xs),
                    
                    Text(
                      _getStatusDescription(job.status),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Progress Percentage
              Text(
                '${(overallProgress * 100).toInt()}%',
                style: theme.textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: Spacing.lg),
          
          // Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(BorderRadii.sm),
            child: LinearProgressIndicator(
              value: overallProgress,
              backgroundColor: Colors.white.withOpacity(0.3),
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProcessingStages(BuildContext context, UploadJob job, ThemeProvider themeProvider) {
    final theme = Theme.of(context);
    
    return Consumer<UploadProvider>(
      builder: (context, uploadProvider, child) {
        final stages = uploadProvider.processingStages;
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Processing Stages',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: Spacing.md),
            
            ...stages.asMap().entries.map((entry) {
              final index = entry.key;
              final stage = entry.value;
              final isLast = index == stages.length - 1;
              
              return _buildStageItem(context, stage, isLast, themeProvider);
            }),
          ],
        );
      },
    );
  }

  Widget _buildStageItem(BuildContext context, ProcessingStage stage, bool isLast, ThemeProvider themeProvider) {
    final theme = Theme.of(context);
    
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Stage Indicator
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _getStageColor(stage, theme),
                shape: BoxShape.circle,
                border: Border.all(
                  color: _getStageColor(stage, theme),
                  width: 2,
                ),
              ),
              child: Icon(
                _getStageIcon(stage),
                color: Colors.white,
                size: 16,
              ),
            ),
            
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: theme.colorScheme.outline.withOpacity(0.3),
              ),
          ],
        ),
        
        const SizedBox(width: Spacing.md),
        
        // Stage Content
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: Spacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stage Title
                Text(
                  stage.name,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: stage.isCompleted 
                        ? theme.colorScheme.onSurface
                        : theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                
                const SizedBox(height: Spacing.xs),
                
                // Stage Description
                Text(
                  stage.description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                
                // Stage Progress
                if (stage.isActive && stage.progress > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: Spacing.sm),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Progress',
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              '${(stage.progress * 100).toInt()}%',
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: Spacing.xs),
                        
                        ClipRRect(
                          borderRadius: BorderRadius.circular(BorderRadii.xs),
                          child: LinearProgressIndicator(
                            value: stage.progress,
                            backgroundColor: theme.colorScheme.surfaceContainerHighest,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              theme.colorScheme.primary,
                            ),
                            minHeight: 4,
                          ),
                        ),
                      ],
                    ),
                  ),
                
                // Error Message
                if (stage.hasFailed && stage.errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(top: Spacing.sm),
                    child: Container(
                      padding: const EdgeInsets.all(Spacing.sm),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.error.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(BorderRadii.sm),
                        border: Border.all(
                          color: theme.colorScheme.error.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: theme.colorScheme.error,
                            size: 16,
                          ),
                          const SizedBox(width: Spacing.xs),
                          Expanded(
                            child: Text(
                              stage.errorMessage!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.error,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrentStageDetails(BuildContext context, UploadJob job, ThemeProvider themeProvider) {
    final theme = Theme.of(context);
    final currentStage = job.currentStage!;
    
    return Container(
      padding: const EdgeInsets.all(Spacing.lg),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
        borderRadius: BorderRadius.circular(BorderRadii.md),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.settings,
                color: theme.colorScheme.primary,
                size: 20,
              ),
              const SizedBox(width: Spacing.sm),
              Text(
                'Current Stage',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: Spacing.sm),
          
          Text(
            currentStage.name,
            style: theme.textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          
          const SizedBox(height: Spacing.xs),
          
          Text(
            currentStage.description,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEstimatedTime(BuildContext context, UploadJob job) {
    final theme = Theme.of(context);
    final estimatedTime = job.estimatedTimeRemaining;
    
    if (estimatedTime == null || job.isCompleted) {
      return const SizedBox.shrink();
    }
    
    return Row(
      children: [
        Icon(
          Icons.schedule,
          color: theme.colorScheme.onSurfaceVariant,
          size: 16,
        ),
        const SizedBox(width: Spacing.xs),
        Text(
          'Estimated time remaining: ${Utils.formatDuration(estimatedTime)}',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  IconData _getStatusIcon(UploadStatus status) {
    switch (status) {
      case UploadStatus.uploading:
        return Icons.cloud_upload;
      case UploadStatus.processing:
        return Icons.auto_awesome;
      case UploadStatus.completed:
        return Icons.check_circle;
      case UploadStatus.failed:
        return Icons.error;
      default:
        return Icons.hourglass_empty;
    }
  }

  String _getStatusTitle(UploadStatus status) {
    switch (status) {
      case UploadStatus.uploading:
        return 'Uploading Video';
      case UploadStatus.processing:
        return 'AI Processing in Progress';
      case UploadStatus.completed:
        return 'Processing Complete!';
      case UploadStatus.failed:
        return 'Processing Failed';
      default:
        return 'Preparing...';
    }
  }

  String _getStatusDescription(UploadStatus status) {
    switch (status) {
      case UploadStatus.uploading:
        return 'Uploading your video to our servers...';
      case UploadStatus.processing:
        return 'Our AI is transforming your video into a 3D animation...';
      case UploadStatus.completed:
        return 'Your 3D animation is ready for download!';
      case UploadStatus.failed:
        return 'Something went wrong during processing.';
      default:
        return 'Getting everything ready...';
    }
  }

  Color _getStageColor(ProcessingStage stage, ThemeData theme) {
    if (stage.isCompleted) {
      return theme.colorScheme.primary;
    } else if (stage.isActive) {
      return theme.colorScheme.secondary;
    } else if (stage.hasFailed) {
      return theme.colorScheme.error;
    } else {
      return theme.colorScheme.outline;
    }
  }

  IconData _getStageIcon(ProcessingStage stage) {
    if (stage.isCompleted) {
      return Icons.check;
    } else if (stage.isActive) {
      return Icons.play_arrow;
    } else if (stage.hasFailed) {
      return Icons.close;
    } else {
      return Icons.radio_button_unchecked;
    }
  }
}