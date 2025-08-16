import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/format_info_banner.dart';
import './widgets/import_option_card.dart';
import './widgets/recent_file_item.dart';
import './widgets/sample_track_card.dart';
import './widgets/selected_file_preview.dart';

class AudioImport extends StatefulWidget {
  const AudioImport({super.key});

  @override
  State<AudioImport> createState() => _AudioImportState();
}

class _AudioImportState extends State<AudioImport> {
  Map<String, dynamic>? selectedFile;
  bool isPlaying = false;
  bool isProcessing = false;

  // Mock data for recent files
  final List<Map<String, dynamic>> recentFiles = [
    {
      "id": 1,
      "name": "Summer Vibes.mp3",
      "duration": "3:24",
      "size": "8.2 MB",
      "format": "MP3",
      "path": "/storage/music/summer_vibes.mp3",
      "lastAccessed": DateTime.now().subtract(const Duration(hours: 2)),
    },
    {
      "id": 2,
      "name": "Electronic Beat.wav",
      "duration": "2:47",
      "size": "12.5 MB",
      "format": "WAV",
      "path": "/storage/music/electronic_beat.wav",
      "lastAccessed": DateTime.now().subtract(const Duration(days: 1)),
    },
    {
      "id": 3,
      "name": "Acoustic Guitar.mp3",
      "duration": "4:12",
      "size": "9.8 MB",
      "format": "MP3",
      "path": "/storage/music/acoustic_guitar.mp3",
      "lastAccessed": DateTime.now().subtract(const Duration(days: 3)),
    },
  ];

  // Mock data for sample tracks
  final List<Map<String, dynamic>> sampleTracks = [
    {
      "id": 1,
      "title": "Upbeat Pop Demo",
      "artist": "Demo Artist",
      "duration": "3:15",
      "bpm": 128,
      "artwork":
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      "genre": "Pop",
      "size": "7.5 MB",
      "format": "MP3",
    },
    {
      "id": 2,
      "title": "Chill Hip-Hop",
      "artist": "Sample Beats",
      "duration": "2:58",
      "bpm": 95,
      "artwork":
          "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop",
      "genre": "Hip-Hop",
      "size": "6.8 MB",
      "format": "MP3",
    },
    {
      "id": 3,
      "title": "Rock Anthem",
      "artist": "Demo Rock",
      "duration": "4:32",
      "bpm": 140,
      "artwork":
          "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop",
      "genre": "Rock",
      "size": "10.2 MB",
      "format": "WAV",
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: selectedFile != null
                  ? _buildSelectedFileView()
                  : _buildImportOptionsView(),
            ),
            if (selectedFile != null) _buildProcessButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: EdgeInsets.all(2.w),
              decoration: BoxDecoration(
                color: AppTheme.darkTheme.colorScheme.surface,
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppTheme.borderColor,
                  width: 1,
                ),
              ),
              child: CustomIconWidget(
                iconName: 'close',
                color: AppTheme.textPrimary,
                size: 6.w,
              ),
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Import Audio",
                  style: AppTheme.darkTheme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  "Select audio file for AI stem separation",
                  style: AppTheme.darkTheme.textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImportOptionsView() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FormatInfoBanner(),
          SizedBox(height: 2.h),
          // Import options
          ImportOptionCard(
            title: "Device Storage",
            iconName: 'folder',
            onTap: _selectFromDevice,
          ),
          ImportOptionCard(
            title: "Recent Files",
            iconName: 'history',
            onTap: () => _showRecentFiles(),
          ),
          ImportOptionCard(
            title: "Sample Tracks",
            iconName: 'star',
            onTap: () => _showSampleTracks(),
          ),
          SizedBox(height: 4.h),
        ],
      ),
    );
  }

  Widget _buildSelectedFileView() {
    return SingleChildScrollView(
      child: Column(
        children: [
          SelectedFilePreview(
            fileData: selectedFile!,
            onRemove: () => setState(() => selectedFile = null),
            onPlay: _togglePlayback,
            isPlaying: isPlaying,
          ),
          SizedBox(height: 2.h),
          _buildProcessingInfo(),
          SizedBox(height: 4.h),
        ],
      ),
    );
  }

  Widget _buildProcessingInfo() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.darkTheme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.borderColor,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'auto_awesome',
                color: AppTheme.successColor,
                size: 5.w,
              ),
              SizedBox(width: 3.w),
              Text(
                "AI Processing Preview",
                style: AppTheme.darkTheme.textTheme.titleMedium?.copyWith(
                  color: AppTheme.successColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          Text(
            "Your audio will be separated into 5 individual tracks:",
            style: AppTheme.darkTheme.textTheme.bodyMedium,
          ),
          SizedBox(height: 2.h),
          ...['Vocals', 'Drums', 'Bass', 'Piano', 'Other Instruments'].map(
            (track) => Padding(
              padding: EdgeInsets.symmetric(vertical: 0.5.h),
              child: Row(
                children: [
                  CustomIconWidget(
                    iconName: 'check_circle_outline',
                    color: AppTheme.accentColor,
                    size: 4.w,
                  ),
                  SizedBox(width: 3.w),
                  Text(
                    track,
                    style: AppTheme.darkTheme.textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 2.h),
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: AppTheme.warningColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: AppTheme.warningColor.withValues(alpha: 0.3),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                CustomIconWidget(
                  iconName: 'schedule',
                  color: AppTheme.warningColor,
                  size: 4.w,
                ),
                SizedBox(width: 3.w),
                Expanded(
                  child: Text(
                    "Processing time: ~2-3 minutes",
                    style: AppTheme.darkTheme.textTheme.bodySmall?.copyWith(
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProcessButton() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.darkTheme.colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: AppTheme.borderColor,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isProcessing ? null : _processWithAI,
              style: ElevatedButton.styleFrom(
                backgroundColor: isProcessing
                    ? AppTheme.textSecondary
                    : AppTheme.accentColor,
                foregroundColor: AppTheme.primaryDark,
                padding: EdgeInsets.symmetric(vertical: 2.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: isProcessing
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 5.w,
                          height: 5.w,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppTheme.primaryDark,
                            ),
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Text(
                          "Processing...",
                          style: AppTheme.darkTheme.textTheme.titleMedium
                              ?.copyWith(
                            color: AppTheme.primaryDark,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    )
                  : Text(
                      "Process with AI",
                      style: AppTheme.darkTheme.textTheme.titleMedium?.copyWith(
                        color: AppTheme.primaryDark,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            "Free processing • No watermarks",
            style: AppTheme.darkTheme.textTheme.bodySmall?.copyWith(
              color: AppTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _selectFromDevice() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['mp3', 'wav'],
        allowMultiple: false,
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        final fileSizeInMB = (file.size / (1024 * 1024)).toStringAsFixed(1);

        setState(() {
          selectedFile = {
            "name": file.name,
            "size": "\$fileSizeInMB MB",
            "format": file.extension?.toUpperCase() ?? "Unknown",
            "duration":
                "3:24", // Mock duration - would be calculated from actual file
            "path": file.path ?? "",
          };
        });
      }
    } catch (e) {
      _showErrorSnackBar("Failed to select file. Please try again.");
    }
  }

  void _showRecentFiles() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: 70.h,
        decoration: BoxDecoration(
          color: AppTheme.darkTheme.colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(4.w),
              child: Row(
                children: [
                  Text(
                    "Recent Files",
                    style: AppTheme.darkTheme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: CustomIconWidget(
                      iconName: 'close',
                      color: AppTheme.textSecondary,
                      size: 6.w,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: recentFiles.isEmpty
                  ? _buildEmptyState("No recent files found")
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      child: Row(
                        children: recentFiles
                            .map((file) => RecentFileItem(
                                  fileData: file,
                                  onTap: () {
                                    setState(() => selectedFile = file);
                                    Navigator.pop(context);
                                  },
                                  onPreview: () => _previewFile(file),
                                ))
                            .toList(),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSampleTracks() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: 80.h,
        decoration: BoxDecoration(
          color: AppTheme.darkTheme.colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(4.w),
              child: Row(
                children: [
                  Text(
                    "Sample Tracks",
                    style: AppTheme.darkTheme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: CustomIconWidget(
                      iconName: 'close',
                      color: AppTheme.textSecondary,
                      size: 6.w,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.symmetric(vertical: 2.h),
                itemCount: sampleTracks.length,
                itemBuilder: (context, index) {
                  final track = sampleTracks[index];
                  return SampleTrackCard(
                    trackData: track,
                    onTap: () {
                      setState(() {
                        selectedFile = {
                          "name":
                              "${track["title"]}.${(track["format"] as String).toLowerCase()}",
                          "duration": track["duration"],
                          "size": track["size"],
                          "format": track["format"],
                          "artist": track["artist"],
                          "bpm": track["bpm"],
                        };
                      });
                      Navigator.pop(context);
                    },
                    onPreview: () => _previewFile(track),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CustomIconWidget(
            iconName: 'music_off',
            color: AppTheme.textSecondary,
            size: 15.w,
          ),
          SizedBox(height: 2.h),
          Text(
            message,
            style: AppTheme.darkTheme.textTheme.bodyLarge?.copyWith(
              color: AppTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _previewFile(Map<String, dynamic> file) {
    // Mock preview functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Playing preview: ${file["name"] ?? file["title"]}"),
        backgroundColor: AppTheme.accentColor,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _togglePlayback() {
    setState(() {
      isPlaying = !isPlaying;
    });

    // Mock playback toggle
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(isPlaying ? "Playing audio..." : "Paused"),
        backgroundColor: AppTheme.accentColor,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  Future<void> _processWithAI() async {
    setState(() {
      isProcessing = true;
    });

    // Mock processing delay
    await Future.delayed(const Duration(seconds: 3));

    setState(() {
      isProcessing = false;
    });

    // Navigate to AI processing screen
    Navigator.pushNamed(context, '/ai-processing');
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.errorColor,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}