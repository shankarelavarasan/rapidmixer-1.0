import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:percent_indicator/percent_indicator.dart';
import '../providers/video_provider.dart';
import '../utils/theme.dart';

class ProgressTracker extends StatefulWidget {
  const ProgressTracker({super.key});

  @override
  State<ProgressTracker> createState() => _ProgressTrackerState();
}

class _ProgressTrackerState extends State<ProgressTracker>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late AnimationController _progressController;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _progressController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<VideoProvider>(
      builder: (context, videoProvider, child) {
        // Update progress animation when progress changes
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _progressController.animateTo(videoProvider.processingProgress);
        });
        
        return Container(
          padding: const EdgeInsets.all(RapidVideoTheme.spacingXL),
          decoration: BoxDecoration(
            color: RapidVideoTheme.surfaceColor,
            borderRadius: BorderRadius.circular(RapidVideoTheme.radiusLarge),
            boxShadow: const [RapidVideoTheme.cardShadow],
          ),
          child: Column(
            children: [
              // Header
              Row(
                children: [
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _pulseAnimation.value,
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            gradient: RapidVideoTheme.neonGradient,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.auto_awesome,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: RapidVideoTheme.spacingM),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'AI Processing in Progress',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: RapidVideoTheme.textPrimary,
                          ),
                        ),
                        Text(
                          videoProvider.stageDescription,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: RapidVideoTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '${(videoProvider.processingProgress * 100).toInt()}%',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: RapidVideoTheme.primaryBlue,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: RapidVideoTheme.spacingXL),
              
              // Progress Bar
              AnimatedBuilder(
                animation: _progressAnimation,
                builder: (context, child) {
                  return LinearPercentIndicator(
                    width: MediaQuery.of(context).size.width - 120,
                    lineHeight: 8.0,
                    percent: _progressAnimation.value,
                    backgroundColor: RapidVideoTheme.borderColor,
                    progressColor: RapidVideoTheme.neonGreen,
                    barRadius: const Radius.circular(4),
                    animation: false,
                  );
                },
              ),
              const SizedBox(height: RapidVideoTheme.spacingXL),
              
              // Stage Indicators
              Row(
                children: [
                  Expanded(
                    child: _buildStageIndicator(
                      'Upload',
                      Icons.cloud_upload,
                      _getStageStatus(VideoProcessingStage.uploading, videoProvider.currentStage),
                    ),
                  ),
                  _buildConnector(_getStageStatus(VideoProcessingStage.uploading, videoProvider.currentStage)),
                  Expanded(
                    child: _buildStageIndicator(
                      'Split',
                      Icons.content_cut,
                      _getStageStatus(VideoProcessingStage.splitting, videoProvider.currentStage),
                    ),
                  ),
                  _buildConnector(_getStageStatus(VideoProcessingStage.splitting, videoProvider.currentStage)),
                  Expanded(
                    child: _buildStageIndicator(
                      'AI Magic',
                      Icons.auto_awesome,
                      _getStageStatus(VideoProcessingStage.aiProcessing, videoProvider.currentStage),
                    ),
                  ),
                  _buildConnector(_getStageStatus(VideoProcessingStage.aiProcessing, videoProvider.currentStage)),
                  Expanded(
                    child: _buildStageIndicator(
                      'Render',
                      Icons.movie_creation,
                      _getStageStatus(VideoProcessingStage.rendering, videoProvider.currentStage),
                    ),
                  ),
                  _buildConnector(_getStageStatus(VideoProcessingStage.rendering, videoProvider.currentStage)),
                  Expanded(
                    child: _buildStageIndicator(
                      'Merge',
                      Icons.merge,
                      _getStageStatus(VideoProcessingStage.merging, videoProvider.currentStage),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: RapidVideoTheme.spacingL),
              
              // Processing Info
              Container(
                padding: const EdgeInsets.all(RapidVideoTheme.spacingM),
                decoration: BoxDecoration(
                  color: RapidVideoTheme.lightBlue,
                  borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: RapidVideoTheme.primaryBlue,
                      size: 20,
                    ),
                    const SizedBox(width: RapidVideoTheme.spacingS),
                    Expanded(
                      child: Text(
                        _getProcessingTip(videoProvider.currentStage),
                        style: const TextStyle(
                          color: RapidVideoTheme.primaryBlue,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildStageIndicator(String label, IconData icon, StageStatus status) {
    Color color;
    Widget iconWidget;
    
    switch (status) {
      case StageStatus.completed:
        color = RapidVideoTheme.successColor;
        iconWidget = const Icon(Icons.check_circle, color: Colors.white, size: 16);
        break;
      case StageStatus.active:
        color = RapidVideoTheme.neonGreen;
        iconWidget = AnimatedBuilder(
          animation: _pulseAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: _pulseAnimation.value * 0.3 + 0.7,
              child: Icon(icon, color: Colors.white, size: 16),
            );
          },
        );
        break;
      case StageStatus.pending:
        color = RapidVideoTheme.borderColor;
        iconWidget = Icon(icon, color: RapidVideoTheme.textMuted, size: 16);
        break;
    }
    
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
          child: iconWidget,
        ),
        const SizedBox(height: RapidVideoTheme.spacingS),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: status == StageStatus.pending
                ? RapidVideoTheme.textMuted
                : RapidVideoTheme.textPrimary,
          ),
        ),
      ],
    );
  }
  
  Widget _buildConnector(StageStatus status) {
    return Container(
      width: 20,
      height: 2,
      margin: const EdgeInsets.only(bottom: 20),
      color: status == StageStatus.completed
          ? RapidVideoTheme.successColor
          : RapidVideoTheme.borderColor,
    );
  }
  
  StageStatus _getStageStatus(VideoProcessingStage targetStage, VideoProcessingStage currentStage) {
    final stageOrder = [
      VideoProcessingStage.uploading,
      VideoProcessingStage.splitting,
      VideoProcessingStage.aiProcessing,
      VideoProcessingStage.rendering,
      VideoProcessingStage.merging,
    ];
    
    final targetIndex = stageOrder.indexOf(targetStage);
    final currentIndex = stageOrder.indexOf(currentStage);
    
    if (currentIndex > targetIndex) {
      return StageStatus.completed;
    } else if (currentIndex == targetIndex) {
      return StageStatus.active;
    } else {
      return StageStatus.pending;
    }
  }
  
  String _getProcessingTip(VideoProcessingStage stage) {
    switch (stage) {
      case VideoProcessingStage.uploading:
        return 'Uploading your video to our secure servers...';
      case VideoProcessingStage.splitting:
        return 'Breaking down your video into 8-second scene chunks for optimal processing.';
      case VideoProcessingStage.aiProcessing:
        return 'Our AI is analyzing each scene and creating detailed 3D conversion prompts.';
      case VideoProcessingStage.rendering:
        return 'Generating stunning 3D animations using advanced AI models. This may take a few minutes.';
      case VideoProcessingStage.merging:
        return 'Combining all 3D scenes with synchronized audio and effects.';
      default:
        return 'Processing your video with cutting-edge AI technology.';
    }
  }
}

enum StageStatus {
  pending,
  active,
  completed,
}