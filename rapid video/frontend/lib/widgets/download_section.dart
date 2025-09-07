import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/video_provider.dart';
import '../utils/theme.dart';

class DownloadSection extends StatefulWidget {
  const DownloadSection({super.key});

  @override
  State<DownloadSection> createState() => _DownloadSectionState();
}

class _DownloadSectionState extends State<DownloadSection>
    with SingleTickerProviderStateMixin {
  late AnimationController _celebrationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;
  bool _isDownloading = false;

  @override
  void initState() {
    super.initState();
    _celebrationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _celebrationController,
      curve: Curves.elasticOut,
    ));
    
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 0.1,
    ).animate(CurvedAnimation(
      parent: _celebrationController,
      curve: Curves.easeInOut,
    ));
    
    // Start celebration animation
    _celebrationController.forward();
  }

  @override
  void dispose() {
    _celebrationController.dispose();
    super.dispose();
  }

  Future<void> _downloadVideo(String? downloadUrl) async {
    if (downloadUrl == null) return;
    
    setState(() {
      _isDownloading = true;
    });
    
    try {
      // For web, open download URL in new tab
      final uri = Uri.parse(downloadUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        
        // Show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(
                    Icons.download_done,
                    color: Colors.white,
                  ),
                  const SizedBox(width: RapidVideoTheme.spacingS),
                  const Expanded(
                    child: Text('Download started! Check your downloads folder.'),
                  ),
                ],
              ),
              backgroundColor: RapidVideoTheme.successColor,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
              ),
            ),
          );
        }
      } else {
        throw 'Could not launch download URL';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(
                  Icons.error_outline,
                  color: Colors.white,
                ),
                const SizedBox(width: RapidVideoTheme.spacingS),
                Expanded(
                  child: Text('Download failed: $e'),
                ),
              ],
            ),
            backgroundColor: RapidVideoTheme.errorColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isDownloading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<VideoProvider>(
      builder: (context, videoProvider, child) {
        return AnimatedBuilder(
          animation: _celebrationController,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: Transform.rotate(
                angle: _rotationAnimation.value,
                child: Container(
                  padding: const EdgeInsets.all(RapidVideoTheme.spacingXL),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        RapidVideoTheme.surfaceColor,
                        RapidVideoTheme.lightBlue.withOpacity(0.3),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(RapidVideoTheme.radiusLarge),
                    boxShadow: const [RapidVideoTheme.cardShadow],
                    border: Border.all(
                      color: RapidVideoTheme.neonGreen.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: Column(
                    children: [
                      // Success Header
                      Row(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              gradient: RapidVideoTheme.neonGradient,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: RapidVideoTheme.neonGreen.withOpacity(0.3),
                                  blurRadius: 20,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.check_circle,
                              color: Colors.white,
                              size: 32,
                            ),
                          ),
                          const SizedBox(width: RapidVideoTheme.spacingL),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '🎉 Your 3D Video is Ready!',
                                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: RapidVideoTheme.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'AI has successfully transformed your video into a stunning 3D animation',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: RapidVideoTheme.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: RapidVideoTheme.spacingXL),
                      
                      // Video Stats
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              Icons.movie_creation,
                              'Format',
                              'MP4 HD',
                              RapidVideoTheme.primaryBlue,
                            ),
                          ),
                          const SizedBox(width: RapidVideoTheme.spacingM),
                          Expanded(
                            child: _buildStatCard(
                              Icons.auto_awesome,
                              'Quality',
                              '3D Animation',
                              RapidVideoTheme.neonGreen,
                            ),
                          ),
                          const SizedBox(width: RapidVideoTheme.spacingM),
                          Expanded(
                            child: _buildStatCard(
                              Icons.timer,
                              'Processing',
                              'Completed',
                              RapidVideoTheme.successColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: RapidVideoTheme.spacingXL),
                      
                      // Download Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _isDownloading
                              ? null
                              : () => _downloadVideo(videoProvider.processedVideoUrl),
                          icon: _isDownloading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(Icons.download),
                          label: Text(
                            _isDownloading ? 'Downloading...' : 'Download 3D Video (MP4)',
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: RapidVideoTheme.neonGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              vertical: RapidVideoTheme.spacingL,
                            ),
                            textStyle: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
                            ),
                            elevation: 0,
                          ),
                        ),
                      ),
                      const SizedBox(height: RapidVideoTheme.spacingM),
                      
                      // Additional Actions
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                // Share functionality
                                _showShareDialog(context, videoProvider.processedVideoUrl);
                              },
                              icon: const Icon(Icons.share),
                              label: const Text('Share'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: RapidVideoTheme.primaryBlue,
                                side: const BorderSide(color: RapidVideoTheme.primaryBlue),
                                padding: const EdgeInsets.symmetric(
                                  vertical: RapidVideoTheme.spacingM,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: RapidVideoTheme.spacingM),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                // Preview functionality
                                _showPreviewDialog(context, videoProvider.processedVideoUrl);
                              },
                              icon: const Icon(Icons.preview),
                              label: const Text('Preview'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: RapidVideoTheme.neonGreen,
                                side: const BorderSide(color: RapidVideoTheme.neonGreen),
                                padding: const EdgeInsets.symmetric(
                                  vertical: RapidVideoTheme.spacingM,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: RapidVideoTheme.spacingL),
                      
                      // Success Message
                      Container(
                        padding: const EdgeInsets.all(RapidVideoTheme.spacingM),
                        decoration: BoxDecoration(
                          color: RapidVideoTheme.successColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
                          border: Border.all(
                            color: RapidVideoTheme.successColor.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.celebration,
                              color: RapidVideoTheme.successColor,
                              size: 20,
                            ),
                            const SizedBox(width: RapidVideoTheme.spacingS),
                            Expanded(
                              child: Text(
                                'Congratulations! Your video has been successfully converted to 3D animation using cutting-edge AI technology.',
                                style: TextStyle(
                                  color: RapidVideoTheme.successColor,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
  
  Widget _buildStatCard(IconData icon, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(RapidVideoTheme.spacingM),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 24,
          ),
          const SizedBox(height: RapidVideoTheme.spacingS),
          Text(
            label,
            style: TextStyle(
              color: RapidVideoTheme.textSecondary,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
  
  void _showShareDialog(BuildContext context, String? videoUrl) {
    if (videoUrl == null) return;
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(
                Icons.share,
                color: RapidVideoTheme.primaryBlue,
              ),
              SizedBox(width: RapidVideoTheme.spacingS),
              Text('Share Your 3D Video'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Share your amazing 3D animation with friends and family!',
                style: TextStyle(
                  color: RapidVideoTheme.textSecondary,
                ),
              ),
              const SizedBox(height: RapidVideoTheme.spacingL),
              TextField(
                readOnly: true,
                controller: TextEditingController(text: videoUrl),
                decoration: InputDecoration(
                  labelText: 'Video URL',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(RapidVideoTheme.radiusSmall),
                  ),
                  suffixIcon: IconButton(
                    onPressed: () {
                      // Copy to clipboard functionality
                    },
                    icon: const Icon(Icons.copy),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }
  
  void _showPreviewDialog(BuildContext context, String? videoUrl) {
    if (videoUrl == null) return;
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          child: Container(
            width: 600,
            height: 400,
            padding: const EdgeInsets.all(RapidVideoTheme.spacingL),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.preview,
                      color: RapidVideoTheme.primaryBlue,
                    ),
                    const SizedBox(width: RapidVideoTheme.spacingS),
                    const Text(
                      'Video Preview',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
                const SizedBox(height: RapidVideoTheme.spacingM),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
                    ),
                    child: const Center(
                      child: Text(
                        'Video preview would be displayed here',
                        style: TextStyle(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}