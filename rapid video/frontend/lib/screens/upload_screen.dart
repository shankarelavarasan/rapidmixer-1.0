import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'dart:html' as html;
import '../services/firebase_service.dart';
import '../services/api_service.dart';
import '../widgets/upload_zone.dart';
import '../widgets/custom_button.dart';
import '../widgets/progress_bar.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/spacing.dart';
import 'payment_screen.dart';
import 'preview_screen.dart';
import 'login_screen.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({Key? key}) : super(key: key);

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  PlatformFile? _selectedFile;
  bool _isUploading = false;
  bool _isProcessing = false;
  double _uploadProgress = 0.0;
  double _processingProgress = 0.0;
  String? _jobId;
  String? _errorMessage;
  Map<String, dynamic>? _userQuota;
  bool _isLoadingQuota = true;

  @override
  void initState() {
    super.initState();
    _loadUserQuota();
  }

  Future<void> _loadUserQuota() async {
    try {
      final firebaseService = Provider.of<FirebaseService>(context, listen: false);
      final user = firebaseService.currentUser;
      
      if (user != null) {
        final apiService = Provider.of<ApiService>(context, listen: false);
        final quota = await apiService.getUserQuota(user.uid);
        
        setState(() {
          _userQuota = quota;
          _isLoadingQuota = false;
        });
      } else {
        setState(() {
          _isLoadingQuota = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load user quota: ${e.toString()}';
        _isLoadingQuota = false;
      });
    }
  }

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.video,
        allowMultiple: false,
        withData: true,
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        
        // Validate file size (max 100MB for 3 minutes)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
          setState(() {
            _errorMessage = 'File too large. Maximum size is 100MB (approximately 3 minutes).';
          });
          return;
        }

        // Validate file type
        if (file.extension == null || !['mp4', 'mov', 'avi', 'mkv', 'webm'].contains(file.extension!.toLowerCase())) {
          setState(() {
            _errorMessage = 'Unsupported file format. Please upload MP4, MOV, AVI, MKV, or WebM files.';
          });
          return;
        }

        setState(() {
          _selectedFile = file;
          _errorMessage = null;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to pick file: ${e.toString()}';
      });
    }
  }

  Future<void> _uploadAndProcess() async {
    if (_selectedFile == null) return;

    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
      _errorMessage = null;
    });

    try {
      final firebaseService = Provider.of<FirebaseService>(context, listen: false);
      final apiService = Provider.of<ApiService>(context, listen: false);
      final user = firebaseService.currentUser;

      // Upload file
      final uploadResult = await apiService.uploadVideo(
        _selectedFile!,
        userId: user?.uid,
        onProgress: (progress) {
          setState(() {
            _uploadProgress = progress;
          });
        },
      );

      if (uploadResult['success'] == true) {
        final jobId = uploadResult['job_id'];
        final cost = uploadResult['cost']?.toDouble() ?? 1.0;
        final duration = uploadResult['duration']?.toDouble() ?? 30.0;

        setState(() {
          _jobId = jobId;
          _isUploading = false;
        });

        // Check if payment is required
        final canCreateFree = _userQuota?['can_create_free_video'] ?? false;
        
        if (!canCreateFree && cost > 0) {
          // Navigate to payment screen
          if (mounted) {
            final paymentResult = await Navigator.of(context).push<bool>(
              MaterialPageRoute(
                builder: (context) => PaymentScreen(
                  amount: cost,
                  videoDuration: duration,
                  jobId: jobId,
                ),
              ),
            );

            if (paymentResult == true) {
              await _startProcessing(jobId);
            } else {
              setState(() {
                _errorMessage = 'Payment required to process this video.';
              });
            }
          }
        } else {
          // Free video or user has balance
          await _startProcessing(jobId);
        }
      } else {
        setState(() {
          _errorMessage = uploadResult['error'] ?? 'Upload failed';
          _isUploading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Upload failed: ${e.toString()}';
        _isUploading = false;
      });
    }
  }

  Future<void> _startProcessing(String jobId) async {
    setState(() {
      _isProcessing = true;
      _processingProgress = 0.0;
    });

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);

      // Start scene splitting
      await apiService.splitScenes(jobId);
      setState(() => _processingProgress = 25.0);

      // Start AI conversion
      await apiService.convertToAI(jobId);
      setState(() => _processingProgress = 70.0);

      // Start merging
      final mergeResult = await apiService.mergeVideo(jobId);
      setState(() => _processingProgress = 100.0);

      if (mergeResult['success'] == true) {
        // Navigate to preview screen
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => PreviewScreen(
                jobId: jobId,
                downloadUrl: mergeResult['download_url'],
              ),
            ),
          );
        }
      } else {
        setState(() {
          _errorMessage = mergeResult['error'] ?? 'Processing failed';
          _isProcessing = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Processing failed: ${e.toString()}';
        _isProcessing = false;
      });
    }
  }

  Future<void> _signOut() async {
    try {
      final firebaseService = Provider.of<FirebaseService>(context, listen: false);
      await firebaseService.signOut();
      
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Sign out failed: ${e.toString()}';
      });
    }
  }

  Widget _buildUserInfo() {
    final firebaseService = Provider.of<FirebaseService>(context, listen: false);
    final user = firebaseService.currentUser;

    if (user == null) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Spacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundImage: user.photoURL != null 
                      ? NetworkImage(user.photoURL!) 
                      : null,
                  child: user.photoURL == null 
                      ? Text(user.displayName?.substring(0, 1).toUpperCase() ?? 'U')
                      : null,
                ),
                const SizedBox(width: Spacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.displayName ?? user.email ?? 'Anonymous User',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      if (user.email != null)
                        Text(
                          user.email!,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: _signOut,
                  icon: const Icon(Icons.logout),
                  tooltip: 'Sign Out',
                ),
              ],
            ),
            if (_userQuota != null) ..[
              const SizedBox(height: Spacing.md),
              const Divider(),
              const SizedBox(height: Spacing.sm),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Videos Created:',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '${_userQuota!['videos_created'] ?? 0}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Spacing.xs),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Balance Paid:',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '\$${(_userQuota!['balance_paid'] ?? 0.0).toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ],
              ),
              if (_userQuota!['can_create_free_video'] == true) ..[
                const SizedBox(height: Spacing.xs),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Spacing.sm,
                    vertical: Spacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '🎉 First 30-second video is FREE!',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rapid Video - Upload'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
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
                constraints: const BoxConstraints(maxWidth: 600),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // User Info
                    if (!_isLoadingQuota) _buildUserInfo(),
                    const SizedBox(height: Spacing.xl),

                    // Upload Section
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.xl),
                        child: Column(
                          children: [
                            Icon(
                              Icons.cloud_upload,
                              size: 64,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(height: Spacing.md),
                            Text(
                              'Upload Your Video',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: Spacing.sm),
                            Text(
                              'Transform your 2D video into stunning 3D experience',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: Spacing.xl),

                            // Upload Zone
                            UploadZone(
                              selectedFile: _selectedFile,
                              onFilePicked: _pickFile,
                              isUploading: _isUploading,
                              uploadProgress: _uploadProgress,
                            ),
                            const SizedBox(height: Spacing.lg),

                            // Upload Button
                            CustomButton(
                              onPressed: _selectedFile != null && !_isUploading && !_isProcessing
                                  ? _uploadAndProcess
                                  : null,
                              isLoading: _isUploading,
                              child: Text(
                                _isUploading
                                    ? 'Uploading...'
                                    : _selectedFile != null
                                        ? 'Start Processing'
                                        : 'Select a Video First',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Processing Progress
                    if (_isProcessing) ..[
                      const SizedBox(height: Spacing.xl),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(Spacing.xl),
                          child: Column(
                            children: [
                              Icon(
                                Icons.auto_awesome,
                                size: 48,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              const SizedBox(height: Spacing.md),
                              Text(
                                'Processing Your Video',
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: Spacing.sm),
                              Text(
                                'AI is converting your 2D video to 3D...',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                              ),
                              const SizedBox(height: Spacing.lg),
                              ProgressBar(
                                progress: _processingProgress,
                                showPercentage: true,
                              ),
                              const SizedBox(height: Spacing.md),
                              Text(
                                _getProcessingStage(_processingProgress),
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],

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

                    // Info Section
                    const SizedBox(height: Spacing.xl),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.lg),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'How it works',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: Spacing.md),
                            _buildInfoStep('1', 'Upload your 2D video (max 3 minutes)'),
                            _buildInfoStep('2', 'AI analyzes and splits into scenes'),
                            _buildInfoStep('3', 'Advanced AI converts each scene to 3D'),
                            _buildInfoStep('4', 'Audio is enhanced and synchronized'),
                            _buildInfoStep('5', 'Download your stunning 3D video'),
                            const SizedBox(height: Spacing.md),
                            Container(
                              padding: const EdgeInsets.all(Spacing.sm),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.primaryContainer,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.info_outline,
                                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                                    size: 20,
                                  ),
                                  const SizedBox(width: Spacing.sm),
                                  Expanded(
                                    child: Text(
                                      'First 30-second video is free! Additional videos cost \$1 per 30 seconds.',
                                      style: TextStyle(
                                        color: Theme.of(context).colorScheme.onPrimaryContainer,
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

  Widget _buildInfoStep(String number, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Spacing.sm),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: Spacing.sm),
          Expanded(
            child: Text(
              description,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  String _getProcessingStage(double progress) {
    if (progress < 25) {
      return 'Analyzing and splitting video into scenes...';
    } else if (progress < 70) {
      return 'Converting scenes to 3D using AI...';
    } else if (progress < 100) {
      return 'Merging scenes and enhancing audio...';
    } else {
      return 'Processing complete!';
    }
  }
}