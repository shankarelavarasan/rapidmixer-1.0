class AppConstants {
  // App Information
  static const String appName = 'Rapid Video';
  static const String appDescription = 'Transform your videos into stunning 3D animations with AI';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';
  
  // API Configuration
  static const String defaultApiBaseUrl = 'https://rapid-video-backend.onrender.com';
  static const String localApiBaseUrl = 'http://localhost:8000';
  
  // File Upload Limits
  static const int maxFileSizeBytes = 500 * 1024 * 1024; // 500MB
  static const int maxVideoDurationSeconds = 180; // 3 minutes
  static const List<String> supportedVideoFormats = [
    'mp4',
    'mov',
    'avi',
    'mkv',
    'webm',
    'flv',
    'm4v',
  ];
  
  // Processing Configuration
  static const int sceneChunkDurationSeconds = 8;
  static const int maxScenesPerVideo = 22; // 180s / 8s
  static const int pollingIntervalSeconds = 2;
  static const int maxPollingAttempts = 300; // 10 minutes
  
  // UI Configuration
  static const double maxContentWidth = 1200.0;
  static const double mobileBreakpoint = 768.0;
  static const double tabletBreakpoint = 1024.0;
  
  // Animation Durations
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 400);
  static const Duration longAnimationDuration = Duration(milliseconds: 600);
  
  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration uploadTimeout = Duration(minutes: 10);
  static const Duration downloadTimeout = Duration(minutes: 5);
  
  // Storage Keys
  static const String storageKeyTheme = 'theme_mode';
  static const String storageKeyApiUrl = 'api_base_url';
  static const String storageKeyUserPrefs = 'user_preferences';
  static const String storageKeyUploadHistory = 'upload_history';
  static const String storageKeyProcessingJobs = 'processing_jobs';
  
  // Error Messages
  static const String errorNetworkConnection = 'Please check your internet connection and try again.';
  static const String errorFileTooBig = 'File size exceeds the maximum limit of 500MB.';
  static const String errorVideoTooLong = 'Video duration exceeds the maximum limit of 3 minutes.';
  static const String errorUnsupportedFormat = 'Unsupported video format. Please use MP4, MOV, AVI, MKV, or WebM.';
  static const String errorUploadFailed = 'Failed to upload video. Please try again.';
  static const String errorProcessingFailed = 'Video processing failed. Please try again.';
  static const String errorDownloadFailed = 'Failed to download processed video.';
  static const String errorGeneric = 'An unexpected error occurred. Please try again.';
  
  // Success Messages
  static const String successUploadComplete = 'Video uploaded successfully!';
  static const String successProcessingComplete = 'Video processing completed!';
  static const String successDownloadReady = 'Your 3D animation is ready for download!';
  
  // Processing Stages
  static const List<String> processingStages = [
    'Uploading',
    'Analyzing',
    'Splitting',
    'AI Processing',
    'Rendering',
    'Merging',
    'Finalizing',
    'Complete',
  ];
  
  // Processing Stage Descriptions
  static const Map<String, String> stageDescriptions = {
    'uploading': 'Uploading your video to our servers...',
    'analyzing': 'Analyzing video content and structure...',
    'splitting': 'Splitting video into 8-second scenes...',
    'ai_processing': 'Converting scenes to 3D with AI magic...',
    'rendering': 'Rendering high-quality 3D animations...',
    'merging': 'Combining scenes into final video...',
    'finalizing': 'Adding finishing touches and optimizing...',
    'complete': 'Your 3D animation is ready!',
  };
  
  // Estimated Processing Times (in seconds)
  static const Map<String, int> stageEstimatedTimes = {
    'uploading': 30,
    'analyzing': 15,
    'splitting': 10,
    'ai_processing': 120, // 2 minutes per scene average
    'rendering': 60,
    'merging': 30,
    'finalizing': 15,
  };
  
  // Feature Flags
  static const bool enableBetaFeatures = false;
  static const bool enableAnalytics = true;
  static const bool enableErrorReporting = true;
  static const bool enableOfflineMode = false;
  
  // Social Links
  static const String githubUrl = 'https://github.com/your-username/rapid-video';
  static const String documentationUrl = 'https://your-username.github.io/rapid-video/docs';
  static const String supportEmail = 'support@rapidvideo.com';
  static const String feedbackUrl = 'https://forms.gle/your-feedback-form';
  
  // Legal
  static const String privacyPolicyUrl = 'https://your-website.com/privacy';
  static const String termsOfServiceUrl = 'https://your-website.com/terms';
  
  // Video Quality Settings
  static const Map<String, Map<String, dynamic>> videoQualityPresets = {
    'low': {
      'width': 720,
      'height': 480,
      'bitrate': '1M',
      'fps': 24,
    },
    'medium': {
      'width': 1280,
      'height': 720,
      'bitrate': '2M',
      'fps': 30,
    },
    'high': {
      'width': 1920,
      'height': 1080,
      'bitrate': '4M',
      'fps': 30,
    },
  };
  
  // Default Settings
  static const String defaultVideoQuality = 'medium';
  static const bool defaultAutoDownload = false;
  static const bool defaultNotifications = true;
  static const String defaultTheme = 'system';
  
  // Cache Configuration
  static const int maxCacheSize = 100 * 1024 * 1024; // 100MB
  static const Duration cacheExpiration = Duration(days: 7);
  static const int maxHistoryItems = 50;
  
  // Rate Limiting
  static const int maxUploadsPerHour = 10;
  static const int maxUploadsPerDay = 50;
  
  // Development
  static const bool isDebugMode = true;
  static const String debugApiUrl = 'http://localhost:8000';
  
  // Regex Patterns
  static const String emailPattern = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
  static const String urlPattern = r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$';
  
  // File Extensions
  static const Map<String, String> mimeTypes = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'webm': 'video/webm',
    'flv': 'video/x-flv',
    'm4v': 'video/x-m4v',
  };
  
  // Color Palette
  static const Map<String, int> colorPalette = {
    'primary': 0xFF3B82F6,
    'primaryDark': 0xFF1E3A8A,
    'secondary': 0xFF06B6D4,
    'accent': 0xFF00FF88,
    'success': 0xFF10B981,
    'warning': 0xFFF59E0B,
    'error': 0xFFEF4444,
    'background': 0xFFF8FAFC,
    'surface': 0xFFFFFFFF,
    'textPrimary': 0xFF1F2937,
    'textSecondary': 0xFF6B7280,
    'border': 0xFFE5E7EB,
  };
  
  // Breakpoints
  static const Map<String, double> breakpoints = {
    'xs': 0,
    'sm': 640,
    'md': 768,
    'lg': 1024,
    'xl': 1280,
    '2xl': 1536,
  };
  
  // Z-Index Values
  static const Map<String, int> zIndex = {
    'dropdown': 1000,
    'modal': 1050,
    'popover': 1060,
    'tooltip': 1070,
    'toast': 1080,
    'loading': 9999,
  };
}

// Environment Configuration
class Environment {
  static const String development = 'development';
  static const String staging = 'staging';
  static const String production = 'production';
  
  static const String current = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: development,
  );
  
  static bool get isDevelopment => current == development;
  static bool get isStaging => current == staging;
  static bool get isProduction => current == production;
  
  static String get apiBaseUrl {
    switch (current) {
      case production:
        return AppConstants.defaultApiBaseUrl;
      case staging:
        return 'https://rapid-video-staging.onrender.com';
      case development:
      default:
        return AppConstants.localApiBaseUrl;
    }
  }
}

// Platform Detection
class PlatformInfo {
  static bool get isWeb => identical(0, 0.0);
  static bool get isMobile => !isWeb;
  static bool get isDesktop => !isWeb;
}

// Utility Functions
class Utils {
  static String formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
  
  static String formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);
    
    if (hours > 0) {
      return '${hours}h ${minutes}m ${seconds}s';
    } else if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    } else {
      return '${seconds}s';
    }
  }
  
  static bool isValidEmail(String email) {
    return RegExp(AppConstants.emailPattern).hasMatch(email);
  }
  
  static bool isValidUrl(String url) {
    return RegExp(AppConstants.urlPattern).hasMatch(url);
  }
  
  static String getFileExtension(String fileName) {
    return fileName.split('.').last.toLowerCase();
  }
  
  static bool isSupportedVideoFormat(String fileName) {
    final extension = getFileExtension(fileName);
    return AppConstants.supportedVideoFormats.contains(extension);
  }
  
  static String getMimeType(String fileName) {
    final extension = getFileExtension(fileName);
    return AppConstants.mimeTypes[extension] ?? 'application/octet-stream';
  }
}