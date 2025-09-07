import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../providers/upload_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';

class UploadZone extends StatefulWidget {
  const UploadZone({super.key});

  @override
  State<UploadZone> createState() => _UploadZoneState();
}

class _UploadZoneState extends State<UploadZone>
    with SingleTickerProviderStateMixin {
  late DropzoneViewController? _dropzoneController;
  late AnimationController _hoverController;
  late Animation<double> _scaleAnimation;
  late Animation<Color?> _colorAnimation;
  
  bool _isHovering = false;
  bool _isDragActive = false;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _hoverController = AnimationController(
      duration: AppConstants.shortAnimationDuration,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.02,
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: Curves.easeInOut,
    ));

    _colorAnimation = ColorTween(
      begin: Colors.transparent,
      end: Theme.of(context).colorScheme.primary.withOpacity(0.1),
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _hoverController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<UploadProvider>(
      builder: (context, uploadProvider, child) {
        if (uploadProvider.isUploading) {
          return _buildUploadingState(context, uploadProvider);
        }
        
        return _buildUploadZone(context, uploadProvider);
      },
    );
  }

  Widget _buildUploadZone(BuildContext context, UploadProvider uploadProvider) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    return AnimatedBuilder(
      animation: _hoverController,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            height: 300,
            decoration: BoxDecoration(
              color: _colorAnimation.value,
              border: Border.all(
                color: _isDragActive 
                    ? theme.colorScheme.primary
                    : theme.colorScheme.outline.withOpacity(0.5),
                width: _isDragActive ? 2 : 1,
                style: BorderStyle.solid,
              ),
              borderRadius: BorderRadius.circular(BorderRadii.lg),
            ),
            child: Stack(
              children: [
                // Dropzone for web
                if (PlatformInfo.isWeb)
                  DropzoneView(
                    operation: DragOperation.copy,
                    cursor: CursorType.pointer,
                    onCreated: (controller) => _dropzoneController = controller,
                    onLoaded: () => debugPrint('Dropzone loaded'),
                    onError: (error) => debugPrint('Dropzone error: $error'),
                    onHover: () => _setHoverState(true),
                    onLeave: () => _setHoverState(false),
                    onDrop: _handleFileDrop,
                  ),
                
                // Upload UI
                _buildUploadUI(context, uploadProvider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildUploadUI(BuildContext context, UploadProvider uploadProvider) {
    final theme = Theme.of(context);
    
    return InkWell(
      onTap: () => _pickFile(uploadProvider),
      onHover: (hovering) => _setHoverState(hovering),
      borderRadius: BorderRadius.circular(BorderRadii.lg),
      child: Container(
        width: double.infinity,
        height: double.infinity,
        padding: const EdgeInsets.all(Spacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Upload Icon
            Container(
              padding: const EdgeInsets.all(Spacing.lg),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.cloud_upload_outlined,
                size: 48,
                color: theme.colorScheme.primary,
              ),
            ),
            
            const SizedBox(height: Spacing.lg),
            
            // Main Text
            Text(
              PlatformInfo.isWeb 
                  ? 'Drag and drop your video here'
                  : 'Tap to select your video',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: Spacing.sm),
            
            // Secondary Text
            Text(
              PlatformInfo.isWeb 
                  ? 'or click to browse files'
                  : 'Select from your device',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: Spacing.lg),
            
            // Browse Button
            ElevatedButton.icon(
              onPressed: () => _pickFile(uploadProvider),
              icon: const Icon(Icons.folder_open),
              label: const Text('Browse Files'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: Spacing.xl,
                  vertical: Spacing.md,
                ),
              ),
            ),
            
            const SizedBox(height: Spacing.lg),
            
            // Supported Formats
            _buildSupportedFormats(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportedFormats(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Spacing.md,
        vertical: Spacing.sm,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
        borderRadius: BorderRadius.circular(BorderRadii.sm),
      ),
      child: Text(
        'Supported: MP4, MOV, AVI, MKV, WebM',
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }

  Widget _buildUploadingState(BuildContext context, UploadProvider uploadProvider) {
    final theme = Theme.of(context);
    final progress = uploadProvider.uploadProgress;
    
    return Container(
      height: 300,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
        border: Border.all(
          color: theme.colorScheme.primary,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(BorderRadii.lg),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Upload Icon
          Container(
            padding: const EdgeInsets.all(Spacing.lg),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.cloud_upload,
              size: 48,
              color: theme.colorScheme.primary,
            ),
          ),
          
          const SizedBox(height: Spacing.lg),
          
          // Upload Text
          Text(
            'Uploading Video...',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          
          const SizedBox(height: Spacing.sm),
          
          // File Name
          if (uploadProvider.currentJob != null)
            Text(
              uploadProvider.currentJob!.fileName,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          
          const SizedBox(height: Spacing.xl),
          
          // Progress Bar
          Container(
            width: 200,
            child: Column(
              children: [
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: theme.colorScheme.surfaceContainerHighest,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    theme.colorScheme.primary,
                  ),
                ),
                
                const SizedBox(height: Spacing.sm),
                
                Text(
                  '${(progress * 100).toInt()}%',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: Spacing.xl),
          
          // Cancel Button
          TextButton.icon(
            onPressed: () => uploadProvider.cancelCurrentJob(),
            icon: const Icon(Icons.close),
            label: const Text('Cancel'),
            style: TextButton.styleFrom(
              foregroundColor: theme.colorScheme.error,
            ),
          ),
        ],
      ),
    );
  }

  void _setHoverState(bool hovering) {
    if (_isHovering != hovering) {
      setState(() {
        _isHovering = hovering;
      });
      
      if (hovering) {
        _hoverController.forward();
      } else {
        _hoverController.reverse();
      }
    }
  }

  Future<void> _pickFile(UploadProvider uploadProvider) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.video,
        allowMultiple: false,
        withData: PlatformInfo.isWeb,
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        await _handleFileSelection(uploadProvider, file);
      }
    } catch (e) {
      _showErrorSnackBar(context, 'Failed to pick file: $e');
    }
  }

  Future<void> _handleFileDrop(dynamic event) async {
    try {
      setState(() {
        _isDragActive = false;
      });
      
      final uploadProvider = context.read<UploadProvider>();
      
      if (_dropzoneController != null) {
        final name = await _dropzoneController!.getFilename(event);
        final size = await _dropzoneController!.getFileSize(event);
        final data = await _dropzoneController!.getFileData(event);
        
        final file = PlatformFile(
          name: name,
          size: size,
          bytes: data,
        );
        
        await _handleFileSelection(uploadProvider, file);
      }
    } catch (e) {
      _showErrorSnackBar(context, 'Failed to handle dropped file: $e');
    }
  }

  Future<void> _handleFileSelection(UploadProvider uploadProvider, PlatformFile file) async {
    // Validate file
    final validation = _validateFile(file);
    if (validation != null) {
      _showErrorSnackBar(context, validation);
      return;
    }

    // Start upload
    try {
      await uploadProvider.uploadVideo(file);
    } catch (e) {
      _showErrorSnackBar(context, 'Upload failed: $e');
    }
  }

  String? _validateFile(PlatformFile file) {
    // Check file size
    if (file.size > AppConstants.maxFileSizeBytes) {
      return 'File size exceeds ${Utils.formatFileSize(AppConstants.maxFileSizeBytes)} limit';
    }

    // Check file extension
    final extension = file.extension?.toLowerCase();
    if (extension == null || !AppConstants.supportedVideoFormats.contains(extension)) {
      return 'Unsupported file format. Please use: ${AppConstants.supportedVideoFormats.join(', ')}';
    }

    return null;
  }
  
  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.error,
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }
}