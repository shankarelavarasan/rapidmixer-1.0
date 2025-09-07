import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'dart:html' as html;
import 'package:flutter/foundation.dart';

class CustomVideoPlayer extends StatefulWidget {
  final String? videoUrl;
  final String? videoPath;
  final bool autoPlay;
  final bool showControls;
  final bool looping;
  final double? aspectRatio;
  final Widget? placeholder;
  final Widget? errorWidget;
  final Function(VideoPlayerController)? onControllerInitialized;
  final Function()? onVideoEnd;
  final Function(Duration)? onPositionChanged;

  const CustomVideoPlayer({
    Key? key,
    this.videoUrl,
    this.videoPath,
    this.autoPlay = false,
    this.showControls = true,
    this.looping = false,
    this.aspectRatio,
    this.placeholder,
    this.errorWidget,
    this.onControllerInitialized,
    this.onVideoEnd,
    this.onPositionChanged,
  }) : super(key: key);

  @override
  State<CustomVideoPlayer> createState() => _CustomVideoPlayerState();
}

class _CustomVideoPlayerState extends State<CustomVideoPlayer> {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;
  String? _errorMessage;
  bool _showControls = true;
  bool _isPlaying = false;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  @override
  void didUpdateWidget(CustomVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl ||
        oldWidget.videoPath != widget.videoPath) {
      _disposeController();
      _initializeVideo();
    }
  }

  void _initializeVideo() {
    if (widget.videoUrl != null) {
      _controller = VideoPlayerController.network(widget.videoUrl!);
    } else if (widget.videoPath != null) {
      _controller = VideoPlayerController.asset(widget.videoPath!);
    } else {
      return;
    }

    _controller!.initialize().then((_) {
      if (mounted) {
        setState(() {
          _isInitialized = true;
          _duration = _controller!.value.duration;
        });
        
        if (widget.autoPlay) {
          _controller!.play();
          _isPlaying = true;
        }
        
        if (widget.looping) {
          _controller!.setLooping(true);
        }
        
        widget.onControllerInitialized?.call(_controller!);
        
        // Listen to position changes
        _controller!.addListener(_videoListener);
      }
    }).catchError((error) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _errorMessage = error.toString();
        });
      }
    });
  }

  void _videoListener() {
    if (_controller != null && mounted) {
      final position = _controller!.value.position;
      final isPlaying = _controller!.value.isPlaying;
      
      if (_position != position) {
        setState(() {
          _position = position;
        });
        widget.onPositionChanged?.call(position);
      }
      
      if (_isPlaying != isPlaying) {
        setState(() {
          _isPlaying = isPlaying;
        });
      }
      
      // Check if video ended
      if (position >= _duration && _duration > Duration.zero) {
        widget.onVideoEnd?.call();
      }
    }
  }

  void _disposeController() {
    _controller?.removeListener(_videoListener);
    _controller?.dispose();
    _controller = null;
    _isInitialized = false;
    _hasError = false;
    _errorMessage = null;
  }

  @override
  void dispose() {
    _disposeController();
    super.dispose();
  }

  void _togglePlayPause() {
    if (_controller != null) {
      if (_isPlaying) {
        _controller!.pause();
      } else {
        _controller!.play();
      }
    }
  }

  void _seekTo(Duration position) {
    _controller?.seekTo(position);
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);
    
    if (hours > 0) {
      return '$hours:${twoDigits(minutes)}:${twoDigits(seconds)}';
    } else {
      return '${twoDigits(minutes)}:${twoDigits(seconds)}';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return widget.errorWidget ??
          Container(
            color: Colors.black,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: Colors.white,
                    size: 48,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error loading video',
                    style: const TextStyle(color: Colors.white),
                  ),
                  if (_errorMessage != null) ..[
                    const SizedBox(height: 8),
                    Text(
                      _errorMessage!,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              ),
            ),
          );
    }

    if (!_isInitialized) {
      return widget.placeholder ??
          Container(
            color: Colors.black,
            child: const Center(
              child: CircularProgressIndicator(),
            ),
          );
    }

    final videoAspectRatio = widget.aspectRatio ?? _controller!.value.aspectRatio;

    return GestureDetector(
      onTap: () {
        if (widget.showControls) {
          setState(() {
            _showControls = !_showControls;
          });
        }
      },
      child: Container(
        color: Colors.black,
        child: AspectRatio(
          aspectRatio: videoAspectRatio,
          child: Stack(
            children: [
              VideoPlayer(_controller!),
              if (widget.showControls && _showControls)
                _buildControls(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withOpacity(0.3),
            Colors.transparent,
            Colors.black.withOpacity(0.7),
          ],
        ),
      ),
      child: Column(
        children: [
          // Top controls (if needed)
          const Spacer(),
          // Center play/pause button
          Center(
            child: GestureDetector(
              onTap: _togglePlayPause,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isPlaying ? Icons.pause : Icons.play_arrow,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            ),
          ),
          const Spacer(),
          // Bottom controls
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Progress bar
                Row(
                  children: [
                    Text(
                      _formatDuration(_position),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          trackHeight: 2,
                          thumbShape: const RoundSliderThumbShape(
                            enabledThumbRadius: 6,
                          ),
                          overlayShape: const RoundSliderOverlayShape(
                            overlayRadius: 12,
                          ),
                        ),
                        child: Slider(
                          value: _duration.inMilliseconds > 0
                              ? _position.inMilliseconds / _duration.inMilliseconds
                              : 0.0,
                          onChanged: (value) {
                            final position = Duration(
                              milliseconds: (value * _duration.inMilliseconds).round(),
                            );
                            _seekTo(position);
                          },
                          activeColor: Colors.white,
                          inactiveColor: Colors.white.withOpacity(0.3),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _formatDuration(_duration),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                // Control buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      onPressed: () {
                        _seekTo(_position - const Duration(seconds: 10));
                      },
                      icon: const Icon(
                        Icons.replay_10,
                        color: Colors.white,
                      ),
                    ),
                    IconButton(
                      onPressed: _togglePlayPause,
                      icon: Icon(
                        _isPlaying ? Icons.pause : Icons.play_arrow,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        _seekTo(_position + const Duration(seconds: 10));
                      },
                      icon: const Icon(
                        Icons.forward_10,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Web-specific video player using HTML5 video element
class WebVideoPlayer extends StatefulWidget {
  final String videoUrl;
  final bool autoPlay;
  final bool showControls;
  final bool looping;
  final double? width;
  final double? height;
  final Widget? placeholder;
  final Widget? errorWidget;

  const WebVideoPlayer({
    Key? key,
    required this.videoUrl,
    this.autoPlay = false,
    this.showControls = true,
    this.looping = false,
    this.width,
    this.height,
    this.placeholder,
    this.errorWidget,
  }) : super(key: key);

  @override
  State<WebVideoPlayer> createState() => _WebVideoPlayerState();
}

class _WebVideoPlayerState extends State<WebVideoPlayer> {
  late html.VideoElement _videoElement;
  bool _isLoaded = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    if (kIsWeb) {
      _initializeWebVideo();
    }
  }

  void _initializeWebVideo() {
    _videoElement = html.VideoElement()
      ..src = widget.videoUrl
      ..autoplay = widget.autoPlay
      ..controls = widget.showControls
      ..loop = widget.looping
      ..style.width = '100%'
      ..style.height = '100%'
      ..style.objectFit = 'contain';

    _videoElement.onLoadedData.listen((_) {
      if (mounted) {
        setState(() {
          _isLoaded = true;
        });
      }
    });

    _videoElement.onError.listen((_) {
      if (mounted) {
        setState(() {
          _hasError = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!kIsWeb) {
      return CustomVideoPlayer(
        videoUrl: widget.videoUrl,
        autoPlay: widget.autoPlay,
        showControls: widget.showControls,
        looping: widget.looping,
        placeholder: widget.placeholder,
        errorWidget: widget.errorWidget,
      );
    }

    if (_hasError) {
      return widget.errorWidget ??
          Container(
            width: widget.width,
            height: widget.height,
            color: Colors.black,
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    color: Colors.white,
                    size: 48,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Error loading video',
                    style: TextStyle(color: Colors.white),
                  ),
                ],
              ),
            ),
          );
    }

    if (!_isLoaded) {
      return widget.placeholder ??
          Container(
            width: widget.width,
            height: widget.height,
            color: Colors.black,
            child: const Center(
              child: CircularProgressIndicator(),
            ),
          );
    }

    return SizedBox(
      width: widget.width,
      height: widget.height,
      child: HtmlElementView(
        viewType: 'video-${widget.videoUrl.hashCode}',
        creationParams: {
          'element': _videoElement,
        },
      ),
    );
  }

  @override
  void dispose() {
    if (kIsWeb) {
      _videoElement.remove();
    }
    super.dispose();
  }
}