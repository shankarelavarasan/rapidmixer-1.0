import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/upload_provider.dart';
import '../providers/video_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/upload_zone.dart';
import '../widgets/processing_progress.dart';
import '../widgets/upload_history.dart';
import '../widgets/header.dart';
import '../widgets/feature_showcase.dart';
import '../widgets/footer.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _fadeController = AnimationController(
      duration: AppConstants.longAnimationDuration,
      vsync: this,
    );
    
    _slideController = AnimationController(
      duration: AppConstants.mediumAnimationDuration,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));

    // Start animations
    _fadeController.forward();
    _slideController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: themeProvider.primaryGradient,
              ),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(Spacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const RapidVideoHeader(),
                    const SizedBox(height: Spacing.xxl),
                
                Consumer<VideoProvider>(
                  builder: (context, videoProvider, child) {
                    return Column(
                      children: [
                        // Upload Section
                        if (videoProvider.currentStage == VideoProcessingStage.idle ||
                            videoProvider.currentStage == VideoProcessingStage.error)
                          const UploadZone(),
                        
                        // Processing Progress Section
                        Consumer<UploadProvider>(
                          builder: (context, uploadProvider, child) {
                            if (uploadProvider.hasActiveJob) {
                              return Column(
                                children: [
                                  const SizedBox(height: Spacing.xl),
                                  const ProcessingProgress(),
                                  const SizedBox(height: Spacing.xl),
                                ],
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        ),
                        
                        // Upload History Section
                        Consumer<UploadProvider>(
                          builder: (context, uploadProvider, child) {
                            if (uploadProvider.uploadHistory.isNotEmpty) {
                              return Column(
                                children: [
                                  const SizedBox(height: Spacing.xl),
                                  const UploadHistory(),
                                  const SizedBox(height: Spacing.xl),
                                ],
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        ),
                      ],
                    );
                  },
                ),
                
                    const SizedBox(height: Spacing.xxl),
                    const FeatureShowcase(),
                    const SizedBox(height: Spacing.xxl),
                    const Footer(),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}