import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';
import '../providers/video_provider.dart';
import '../utils/theme.dart';

class VideoPreview extends StatefulWidget {
  const VideoPreview({super.key});

  @override
  State<VideoPreview> createState() => _VideoPreviewState();
}

class _VideoPreviewState extends State<VideoPreview> {
  VideoPlayerController? _controller;
  int _currentSceneIndex = 0;
  bool _isPlaying = false;

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _initializeVideo(String videoUrl) {
    _controller?.dispose();
    _controller = VideoPlayerController.networkUrl(Uri.parse(videoUrl))
      ..initialize().then((_) {
        setState(() {});
      });
  }

  void _playPause() {
    if (_controller == null) return;
    
    setState(() {
      if (_controller!.value.isPlaying) {
        _controller!.pause();
        _isPlaying = false;
      } else {
        _controller!.play();
        _isPlaying = true;
      }
    });
  }

  void _changeScene(int index) {
    setState(() {
      _currentSceneIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<VideoProvider>(
      builder: (context, videoProvider, child) {
        if (videoProvider.sceneUrls.isEmpty) {
          return const SizedBox.shrink();
        }

        // Initialize video if not already done
        if (_controller == null && videoProvider.sceneUrls.isNotEmpty) {
          _initializeVideo(videoProvider.sceneUrls[_currentSceneIndex]);
        }

        return Container(
          padding: const EdgeInsets.all(RapidVideoTheme.spacingL),
          decoration: BoxDecoration(
            color: RapidVideoTheme.surfaceColor,
            borderRadius: BorderRadius.circular(RapidVideoTheme.radiusLarge),
            boxShadow: const [RapidVideoTheme.cardShadow],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(RapidVideoTheme.spacingS),
                    decoration: BoxDecoration(
                      gradient: RapidVideoTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(RapidVideoTheme.radiusSmall),
                    ),
                    child: const Icon(
                      Icons.preview,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: RapidVideoTheme.spacingM),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Scene Preview',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: RapidVideoTheme.textPrimary,
                          ),
                        ),
                        Text(
                          'Preview your 3D animated scenes as they\'re generated',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: RapidVideoTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: RapidVideoTheme.spacingM,
                      vertical: RapidVideoTheme.spacingS,
                    ),
                    decoration: BoxDecoration(
                      color: RapidVideoTheme.neonGreen.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(RapidVideoTheme.radiusSmall),
                      border: Border.all(
                        color: RapidVideoTheme.neonGreen.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      '${videoProvider.sceneUrls.length} scenes',
                      style: const TextStyle(
                        color: RapidVideoTheme.neonGreen,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: RapidVideoTheme.spacingL),
              
              // Video Player
              Container(
                width: double.infinity,
                height: 300,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
                  border: Border.all(color: RapidVideoTheme.borderColor),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(RapidVideoTheme.radiusMedium),
                  child: _controller != null && _controller!.value.isInitialized
                      ? Stack(
                          alignment: Alignment.center,
                          children: [
                            AspectRatio(
                              aspectRatio: _controller!.value.aspectRatio,
                              child: VideoPlayer(_controller!),
                            ),
                            // Play/Pause Overlay
                            if (!_isPlaying)
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.3),
                                  shape: BoxShape.circle,
                                ),
                                child: IconButton(
                                  onPressed: _playPause,
                                  icon: const Icon(
                                    Icons.play_arrow,
                                    color: Colors.white,
                                    size: 48,
                                  ),
                                ),
                              ),
                            // Controls
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(RapidVideoTheme.spacingS),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withOpacity(0.7),
                                    ],
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    IconButton(
                                      onPressed: _playPause,
                                      icon: Icon(
                                        _isPlaying ? Icons.pause : Icons.play_arrow,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Expanded(
                                      child: VideoProgressIndicator(
                                        _controller!,
                                        allowScrubbing: true,
                                        colors: const VideoProgressColors(
                                          playedColor: RapidVideoTheme.neonGreen,
                                          bufferedColor: Colors.white30,
                                          backgroundColor: Colors.white12,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: RapidVideoTheme.spacingS),
                                    Text(
                                      _formatDuration(_controller!.value.position),
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        )
                      : const Center(
                          child: CircularProgressIndicator(
                            color: RapidVideoTheme.neonGreen,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: RapidVideoTheme.spacingL),
              
              // Scene Selector
              Text(
                'Scenes',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: RapidVideoTheme.textPrimary,
                ),
              ),
              const SizedBox(height: RapidVideoTheme.spacingM),
              SizedBox(
                height: 80,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: videoProvider.sceneUrls.length,
                  itemBuilder: (context, index) {
                    final isSelected = index == _currentSceneIndex;
                    return GestureDetector(
                      onTap: () {
                        _changeScene(index);
                        _initializeVideo(videoProvider.sceneUrls[index]);
                      },
                      child: Container(
                        width: 120,
                        margin: EdgeInsets.only(
                          right: index < videoProvider.sceneUrls.length - 1
                              ? RapidVideoTheme.spacingM
                              : 0,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(RapidVideoTheme.radiusSmall),
                          border: Border.all(
                            color: isSelected
                                ? RapidVideoTheme.neonGreen
                                : RapidVideoTheme.borderColor,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  color: RapidVideoTheme.lightBlue,
                                  borderRadius: const BorderRadius.only(
                                    topLeft: Radius.circular(RapidVideoTheme.radiusSmall),
                                    topRight: Radius.circular(RapidVideoTheme.radiusSmall),
                                  ),
                                ),
                                child: Center(
                                  child: Icon(
                                    isSelected ? Icons.play_circle_filled : Icons.movie,
                                    color: isSelected
                                        ? RapidVideoTheme.neonGreen
                                        : RapidVideoTheme.primaryBlue,
                                    size: 24,
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                vertical: RapidVideoTheme.spacingS,
                              ),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? RapidVideoTheme.neonGreen.withOpacity(0.1)
                                    : RapidVideoTheme.surfaceColor,
                                borderRadius: const BorderRadius.only(
                                  bottomLeft: Radius.circular(RapidVideoTheme.radiusSmall),
                                  bottomRight: Radius.circular(RapidVideoTheme.radiusSmall),
                                ),
                              ),
                              child: Text(
                                'Scene ${index + 1}',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: isSelected
                                      ? RapidVideoTheme.neonGreen
                                      : RapidVideoTheme.textSecondary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }
}