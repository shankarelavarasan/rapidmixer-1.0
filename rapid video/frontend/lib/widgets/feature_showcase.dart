import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';

class FeatureShowcase extends StatefulWidget {
  const FeatureShowcase({super.key});

  @override
  State<FeatureShowcase> createState() => _FeatureShowcaseState();
}

class _FeatureShowcaseState extends State<FeatureShowcase>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _floatingController;
  late List<Animation<double>> _itemAnimations;
  late Animation<double> _floatingAnimation;

  final List<FeatureItem> _features = [
    FeatureItem(
      icon: Icons.auto_awesome,
      title: 'AI-Powered Processing',
      description: 'Advanced AI algorithms enhance your videos with intelligent processing and optimization.',
      color: Colors.purple,
    ),
    FeatureItem(
      icon: Icons.speed,
      title: 'Lightning Fast',
      description: 'Process videos in minutes, not hours. Our optimized pipeline delivers results quickly.',
      color: Colors.blue,
    ),
    FeatureItem(
      icon: Icons.high_quality,
      title: 'Premium Quality',
      description: 'Maintain the highest quality output with our advanced compression and enhancement.',
      color: Colors.green,
    ),
    FeatureItem(
      icon: Icons.cloud_upload,
      title: 'Cloud Processing',
      description: 'Leverage powerful cloud infrastructure for seamless video processing at scale.',
      color: Colors.orange,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _floatingController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    // Create staggered animations for each feature item
    _itemAnimations = List.generate(_features.length, (index) {
      final start = index * 0.1;
      final end = start + 0.6;
      
      return Tween<double>(
        begin: 0.0,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: _animationController,
        curve: Interval(
          start.clamp(0.0, 1.0),
          end.clamp(0.0, 1.0),
          curve: Curves.easeOutCubic,
        ),
      ));
    });

    _floatingAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _floatingController,
      curve: Curves.easeInOut,
    ));

    _animationController.forward();
    _floatingController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    _floatingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Spacing.xl,
        vertical: Spacing.xxl,
      ),
      child: Column(
        children: [
          // Section Header
          _buildSectionHeader(context),
          
          const SizedBox(height: Spacing.xxl),
          
          // Features Grid
          _buildFeaturesGrid(context),
          
          const SizedBox(height: Spacing.xxl),
          
          // Call to Action
          _buildCallToAction(context),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context) {
    final theme = Theme.of(context);
    
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - _animationController.value)),
          child: Opacity(
            opacity: _animationController.value,
            child: Column(
              children: [
                Text(
                  'Powerful Features',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: Spacing.md),
                
                Text(
                  'Experience the future of video processing with our cutting-edge AI technology',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFeaturesGrid(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = Breakpoints.isDesktop(context);
        final isTablet = Breakpoints.isTablet(context);
        
        int crossAxisCount;
        if (isDesktop) {
          crossAxisCount = 4;
        } else if (isTablet) {
          crossAxisCount = 2;
        } else {
          crossAxisCount = 1;
        }
        
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: Spacing.lg,
            mainAxisSpacing: Spacing.lg,
            childAspectRatio: isDesktop ? 0.8 : (isTablet ? 1.0 : 1.2),
          ),
          itemCount: _features.length,
          itemBuilder: (context, index) {
            return AnimatedBuilder(
              animation: _itemAnimations[index],
              builder: (context, child) {
                return Transform.translate(
                  offset: Offset(0, 50 * (1 - _itemAnimations[index].value)),
                  child: Opacity(
                    opacity: _itemAnimations[index].value,
                    child: _buildFeatureCard(context, _features[index], index),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildFeatureCard(BuildContext context, FeatureItem feature, int index) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    return AnimatedBuilder(
      animation: _floatingAnimation,
      builder: (context, child) {
        final offset = 5 * _floatingAnimation.value * (index % 2 == 0 ? 1 : -1);
        
        return Transform.translate(
          offset: Offset(0, offset),
          child: Card(
            elevation: 4,
            shadowColor: theme.colorScheme.shadow.withOpacity(0.1),
            child: Container(
              padding: const EdgeInsets.all(Spacing.xl),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(BorderRadii.lg),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    theme.colorScheme.surface,
                    theme.colorScheme.surface.withOpacity(0.8),
                  ],
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Feature Icon
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          feature.color,
                          feature.color.withOpacity(0.7),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(BorderRadii.round),
                      boxShadow: [
                        BoxShadow(
                          color: feature.color.withOpacity(0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(
                      feature.icon,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                  
                  const SizedBox(height: Spacing.lg),
                  
                  // Feature Title
                  Text(
                    feature.title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: Spacing.md),
                  
                  // Feature Description
                  Text(
                    feature.description,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildCallToAction(BuildContext context) {
    final theme = Theme.of(context);
    
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        final delay = 0.8;
        final progress = (_animationController.value - delay) / (1 - delay);
        final clampedProgress = progress.clamp(0.0, 1.0);
        
        return Transform.translate(
          offset: Offset(0, 30 * (1 - clampedProgress)),
          child: Opacity(
            opacity: clampedProgress,
            child: Container(
              padding: const EdgeInsets.all(Spacing.xl),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary.withOpacity(0.1),
                    theme.colorScheme.secondary.withOpacity(0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(BorderRadii.lg),
                border: Border.all(
                  color: theme.colorScheme.outline.withOpacity(0.2),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    'Ready to Transform Your Videos?',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: Spacing.md),
                  
                  Text(
                    'Join thousands of creators who trust Rapid Video for their content',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: Spacing.xl),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: () {
                          // Scroll to upload zone
                          Scrollable.ensureVisible(
                            context,
                            duration: AppConstants.mediumAnimationDuration,
                            curve: Curves.easeInOut,
                          );
                        },
                        icon: const Icon(Icons.cloud_upload),
                        label: const Text('Start Processing'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: Spacing.xl,
                            vertical: Spacing.md,
                          ),
                        ),
                      ),
                      
                      const SizedBox(width: Spacing.lg),
                      
                      OutlinedButton.icon(
                        onPressed: () {
                          // TODO: Show demo or tutorial
                        },
                        icon: const Icon(Icons.play_circle_outline),
                        label: const Text('Watch Demo'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: Spacing.xl,
                            vertical: Spacing.md,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class FeatureItem {
  final IconData icon;
  final String title;
  final String description;
  final Color color;

  const FeatureItem({
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
  });
}