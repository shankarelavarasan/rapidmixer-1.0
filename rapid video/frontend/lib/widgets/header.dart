import 'package:flutter/material.dart';
import '../utils/theme.dart';

class RapidVideoHeader extends StatelessWidget {
  const RapidVideoHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        vertical: RapidVideoTheme.spacingL,
        horizontal: RapidVideoTheme.spacingXL,
      ),
      decoration: BoxDecoration(
        color: RapidVideoTheme.surfaceColor,
        borderRadius: BorderRadius.circular(RapidVideoTheme.radiusLarge),
        boxShadow: const [RapidVideoTheme.cardShadow],
      ),
      child: Row(
        children: [
          // Logo
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              gradient: RapidVideoTheme.primaryGradient,
              borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
            ),
            child: const Icon(
              Icons.play_circle_filled,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: RapidVideoTheme.spacingM),
          
          // Brand Text
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Rapid',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: RapidVideoTheme.primaryBlue,
                      ),
                    ),
                    Text(
                      'Video',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: RapidVideoTheme.neonGreen,
                      ),
                    ),
                    const SizedBox(width: RapidVideoTheme.spacingS),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: RapidVideoTheme.spacingS,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: RapidVideoTheme.neonGreen.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(RapidVideoTheme.radiusSmall),
                        border: Border.all(
                          color: RapidVideoTheme.neonGreen.withOpacity(0.3),
                        ),
                      ),
                      child: const Text(
                        'AI',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: RapidVideoTheme.neonGreen,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Transform videos into 3D animations with AI',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: RapidVideoTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          
          // Action Buttons
          Row(
            children: [
              IconButton(
                onPressed: () {
                  // Show help dialog
                  _showHelpDialog(context);
                },
                icon: const Icon(
                  Icons.help_outline,
                  color: RapidVideoTheme.textSecondary,
                ),
                tooltip: 'Help & FAQ',
              ),
              const SizedBox(width: RapidVideoTheme.spacingS),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: RapidVideoTheme.spacingM,
                  vertical: RapidVideoTheme.spacingS,
                ),
                decoration: BoxDecoration(
                  gradient: RapidVideoTheme.neonGradient,
                  borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.flash_on,
                      color: Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'BETA',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  void _showHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              const Icon(
                Icons.help_outline,
                color: RapidVideoTheme.primaryBlue,
              ),
              const SizedBox(width: RapidVideoTheme.spacingS),
              const Text('How to Use Rapid Video'),
            ],
          ),
          content: SizedBox(
            width: 400,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHelpItem(
                  '1. Upload Video',
                  'Select a video file (max 3 minutes, under 100MB)',
                ),
                _buildHelpItem(
                  '2. AI Processing',
                  'Our AI will split, analyze, and convert your video',
                ),
                _buildHelpItem(
                  '3. Download Result',
                  'Get your stunning 3D animated video in MP4 format',
                ),
                const SizedBox(height: RapidVideoTheme.spacingM),
                Container(
                  padding: const EdgeInsets.all(RapidVideoTheme.spacingM),
                  decoration: BoxDecoration(
                    color: RapidVideoTheme.lightBlue,
                    borderRadius: BorderRadius.circular(RapidVideoTheme.radiusSmall),
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
                          'Processing typically takes 2-5 minutes depending on video length.',
                          style: TextStyle(
                            color: RapidVideoTheme.primaryBlue,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Got it!'),
            ),
          ],
        );
      },
    );
  }
  
  Widget _buildHelpItem(String title, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: RapidVideoTheme.spacingM),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 6,
            height: 6,
            margin: const EdgeInsets.only(top: 6),
            decoration: const BoxDecoration(
              color: RapidVideoTheme.neonGreen,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: RapidVideoTheme.spacingS),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: RapidVideoTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: const TextStyle(
                    color: RapidVideoTheme.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}