import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/firebase_service.dart';
import '../services/api_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/video_player.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/spacing.dart';
import 'upload_screen.dart';
import 'login_screen.dart';
import 'dart:html' as html;

class PreviewScreen extends StatefulWidget {
  final String jobId;
  final String? downloadUrl;

  const PreviewScreen({
    Key? key,
    required this.jobId,
    this.downloadUrl,
  }) : super(key: key);

  @override
  State<PreviewScreen> createState() => _PreviewScreenState();
}

class _PreviewScreenState extends State<PreviewScreen> {
  String? _downloadUrl;
  bool _isLoadingDownloadUrl = false;
  String? _errorMessage;
  Map<String, dynamic>? _jobDetails;
  bool _isDownloading = false;

  @override
  void initState() {
    super.initState();
    _downloadUrl = widget.downloadUrl;
    if (_downloadUrl == null) {
      _loadDownloadUrl();
    }
    _loadJobDetails();
  }

  Future<void> _loadDownloadUrl() async {
    setState(() {
      _isLoadingDownloadUrl = true;
      _errorMessage = null;
    });

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final result = await apiService.getDownloadUrl(widget.jobId);

      if (result['success'] == true) {
        setState(() {
          _downloadUrl = result['download_url'];
          _isLoadingDownloadUrl = false;
        });
      } else {
        setState(() {
          _errorMessage = result['error'] ?? 'Failed to get download URL';
          _isLoadingDownloadUrl = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load download URL: ${e.toString()}';
        _isLoadingDownloadUrl = false;
      });
    }
  }

  Future<void> _loadJobDetails() async {
    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final details = await apiService.getJobDetails(widget.jobId);
      
      setState(() {
        _jobDetails = details;
      });
    } catch (e) {
      // Job details are optional, don't show error for this
      print('Failed to load job details: $e');
    }
  }

  Future<void> _downloadVideo() async {
    if (_downloadUrl == null) return;

    setState(() {
      _isDownloading = true;
      _errorMessage = null;
    });

    try {
      // Create a download link and trigger download
      final anchor = html.AnchorElement(href: _downloadUrl!)
        ..setAttribute('download', 'rapid_video_3d_${widget.jobId}.mp4')
        ..style.display = 'none';
      
      html.document.body?.children.add(anchor);
      anchor.click();
      html.document.body?.children.remove(anchor);

      // Show success message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.download_done, color: Colors.white),
                SizedBox(width: Spacing.sm),
                Text('Download started successfully!'),
              ],
            ),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Download failed: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isDownloading = false;
      });
    }
  }

  Future<void> _shareVideo() async {
    if (_downloadUrl == null) return;

    try {
      // Use Web Share API if available
      await html.window.navigator.share({
        'title': 'My 3D Video from Rapid Video',
        'text': 'Check out this amazing 3D video I created!',
        'url': _downloadUrl!,
      });
        } catch (e) {
      setState(() {
        _errorMessage = 'Share failed: ${e.toString()}';
      });
    }
  }

  void _createNewVideo() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const UploadScreen()),
    );
  }

  Future<void> _signOut() async {
    try {
      final firebaseService = Provider.of<FirebaseService>(context, listen: false);
      await firebaseService.signOut();
      
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Sign out failed: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your 3D Video'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _signOut,
            icon: const Icon(Icons.logout),
            tooltip: 'Sign Out',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).colorScheme.surface,
              Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.3),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(Spacing.lg),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 800),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Success Header
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.xl),
                        child: Column(
                          children: [
                            Icon(
                              Icons.check_circle,
                              size: 64,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(height: Spacing.md),
                            Text(
                              'Video Processing Complete!',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: Spacing.sm),
                            Text(
                              'Your 2D video has been successfully converted to stunning 3D',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: Spacing.lg),

                    // Video Player
                    if (_downloadUrl != null)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(Spacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Preview Your 3D Video',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: Spacing.md),
                              VideoPlayerWidget(
                                videoUrl: _downloadUrl!,
                                autoPlay: false,
                              ),
                            ],
                          ),
                        ),
                      ),

                    // Loading State
                    if (_isLoadingDownloadUrl)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(Spacing.xl),
                          child: Column(
                            children: [
                              const CircularProgressIndicator(),
                              const SizedBox(height: Spacing.md),
                              Text(
                                'Preparing your video...',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ),

                    const SizedBox(height: Spacing.lg),

                    // Job Details
                    if (_jobDetails != null)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(Spacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Processing Details',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: Spacing.md),
                              if (_jobDetails!['original_duration'] != null)
                                _buildDetailRow(
                                  'Original Duration:',
                                  '${_jobDetails!['original_duration'].toStringAsFixed(1)} seconds',
                                ),
                              if (_jobDetails!['scenes_count'] != null)
                                _buildDetailRow(
                                  'Scenes Processed:',
                                  '${_jobDetails!['scenes_count']} scenes',
                                ),
                              if (_jobDetails!['processing_time'] != null)
                                _buildDetailRow(
                                  'Processing Time:',
                                  '${_jobDetails!['processing_time']} seconds',
                                ),
                              if (_jobDetails!['file_size'] != null)
                                _buildDetailRow(
                                  'File Size:',
                                  _formatFileSize(_jobDetails!['file_size']),
                                ),
                              _buildDetailRow(
                                'Job ID:',
                                widget.jobId,
                              ),
                            ],
                          ),
                        ),
                      ),

                    const SizedBox(height: Spacing.lg),

                    // Action Buttons
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.lg),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'What would you like to do?',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: Spacing.lg),
                            
                            // Download Button
                            CustomButton(
                              onPressed: _downloadUrl != null && !_isDownloading
                                  ? _downloadVideo
                                  : null,
                              isLoading: _isDownloading,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.download,
                                    color: Theme.of(context).colorScheme.onPrimary,
                                  ),
                                  const SizedBox(width: Spacing.sm),
                                  Text(
                                    _isDownloading
                                        ? 'Downloading...'
                                        : 'Download Video',
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: Spacing.md),
                            
                            // Share Button
                            OutlinedButton(
                              onPressed: _downloadUrl != null ? _shareVideo : null,
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.share),
                                  SizedBox(width: Spacing.sm),
                                  Text('Share Video'),
                                ],
                              ),
                            ),
                            const SizedBox(height: Spacing.md),
                            
                            // Create New Video Button
                            TextButton(
                              onPressed: _createNewVideo,
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add_circle_outline),
                                  SizedBox(width: Spacing.sm),
                                  Text('Create Another Video'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Error Message
                    if (_errorMessage != null) ..[
                      const SizedBox(height: Spacing.lg),
                      Container(
                        padding: const EdgeInsets.all(Spacing.md),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.errorContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Theme.of(context).colorScheme.error,
                            ),
                            const SizedBox(width: Spacing.sm),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.error,
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed: () => setState(() => _errorMessage = null),
                              icon: Icon(
                                Icons.close,
                                color: Theme.of(context).colorScheme.error,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: Spacing.xl),

                    // Footer
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.lg),
                        child: Column(
                          children: [
                            Icon(
                              Icons.auto_awesome,
                              color: Theme.of(context).colorScheme.primary,
                              size: 32,
                            ),
                            const SizedBox(height: Spacing.sm),
                            Text(
                              'Thank you for using Rapid Video!',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: Spacing.xs),
                            Text(
                              'Share your amazing 3D videos with friends and family',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Spacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          Flexible(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  String _formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
}