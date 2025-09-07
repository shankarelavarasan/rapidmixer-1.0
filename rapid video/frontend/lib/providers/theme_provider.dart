import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/storage_service.dart';
import '../utils/constants.dart';

class ThemeProvider extends ChangeNotifier {
  final StorageService _storageService;
  ThemeMode _themeMode = ThemeMode.system;
  bool _isInitialized = false;

  ThemeProvider(this._storageService);

  ThemeMode get themeMode => _themeMode;
  bool get isInitialized => _isInitialized;
  
  bool get isDarkMode {
    switch (_themeMode) {
      case ThemeMode.dark:
        return true;
      case ThemeMode.light:
        return false;
      case ThemeMode.system:
        return WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
    }
  }

  String get themeModeString {
    switch (_themeMode) {
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.light:
        return 'light';
      case ThemeMode.system:
        return 'system';
    }
  }

  Future<void> initialize() async {
    try {
      final savedTheme = await _storageService.getThemeMode();
      _themeMode = _parseThemeMode(savedTheme);
      _isInitialized = true;
      
      // Update system UI overlay style based on current theme
      _updateSystemUIOverlayStyle();
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error initializing theme: $e');
      _themeMode = ThemeMode.system;
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    if (_themeMode == mode) return;
    
    _themeMode = mode;
    
    try {
      await _storageService.setThemeMode(_themeModeToString(mode));
      _updateSystemUIOverlayStyle();
      notifyListeners();
    } catch (e) {
      debugPrint('Error saving theme mode: $e');
    }
  }

  Future<void> toggleTheme() async {
    final newMode = _themeMode == ThemeMode.light 
        ? ThemeMode.dark 
        : ThemeMode.light;
    await setThemeMode(newMode);
  }

  Future<void> setSystemTheme() async {
    await setThemeMode(ThemeMode.system);
  }

  void _updateSystemUIOverlayStyle() {
    final brightness = isDarkMode ? Brightness.dark : Brightness.light;
    final statusBarBrightness = isDarkMode ? Brightness.light : Brightness.dark;
    
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarBrightness: statusBarBrightness,
        statusBarIconBrightness: statusBarBrightness,
        systemNavigationBarColor: isDarkMode 
            ? const Color(0xFF16181D) 
            : const Color(0xFFF8FAFC),
        systemNavigationBarIconBrightness: statusBarBrightness,
        systemNavigationBarDividerColor: Colors.transparent,
      ),
    );
  }

  ThemeMode _parseThemeMode(String? themeString) {
    switch (themeString?.toLowerCase()) {
      case 'dark':
        return ThemeMode.dark;
      case 'light':
        return ThemeMode.light;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.light:
        return 'light';
      case ThemeMode.system:
        return 'system';
    }
  }

  // Get theme-aware colors
  Color getThemeAwareColor({
    required Color lightColor,
    required Color darkColor,
  }) {
    return isDarkMode ? darkColor : lightColor;
  }

  // Get theme-aware icon
  IconData getThemeAwareIcon({
    required IconData lightIcon,
    required IconData darkIcon,
  }) {
    return isDarkMode ? darkIcon : lightIcon;
  }

  // Get current theme colors
  Map<String, Color> get currentThemeColors {
    if (isDarkMode) {
      return {
        'primary': const Color(0xFFB8C6FF),
        'secondary': const Color(0xFF5DD5FC),
        'background': const Color(0xFF0F1419),
        'surface': const Color(0xFF16181D),
        'error': const Color(0xFFFFB4AB),
        'success': const Color(0xFF4ADE80),
        'warning': const Color(0xFFFBBF24),
        'info': const Color(0xFF60A5FA),
        'textPrimary': const Color(0xFFE3E2E6),
        'textSecondary': const Color(0xFFC4C6D0),
      };
    } else {
      return {
        'primary': Color(AppConstants.colorPalette['primary']!),
        'secondary': Color(AppConstants.colorPalette['secondary']!),
        'background': Color(AppConstants.colorPalette['background']!),
        'surface': Color(AppConstants.colorPalette['surface']!),
        'error': Color(AppConstants.colorPalette['error']!),
        'success': Color(AppConstants.colorPalette['success']!),
        'warning': Color(AppConstants.colorPalette['warning']!),
        'info': const Color(0xFF3B82F6),
        'textPrimary': Color(AppConstants.colorPalette['textPrimary']!),
        'textSecondary': Color(AppConstants.colorPalette['textSecondary']!),
      };
    }
  }

  // Animation duration based on theme
  Duration get themeTransitionDuration => AppConstants.mediumAnimationDuration;

  // Get gradient colors for current theme
  List<Color> get primaryGradient {
    if (isDarkMode) {
      return [
        const Color(0xFF1E40AF),
        const Color(0xFF0891B2),
      ];
    } else {
      return [
        const Color(0xFF3B82F6),
        const Color(0xFF06B6D4),
      ];
    }
  }

  List<Color> get secondaryGradient {
    if (isDarkMode) {
      return [
        const Color(0xFF7C3AED),
        const Color(0xFFEC4899),
      ];
    } else {
      return [
        const Color(0xFF8B5CF6),
        const Color(0xFFF472B6),
      ];
    }
  }

  List<Color> get successGradient {
    if (isDarkMode) {
      return [
        const Color(0xFF059669),
        const Color(0xFF10B981),
      ];
    } else {
      return [
        const Color(0xFF10B981),
        const Color(0xFF34D399),
      ];
    }
  }

  List<Color> get warningGradient {
    if (isDarkMode) {
      return [
        const Color(0xFFD97706),
        const Color(0xFFF59E0B),
      ];
    } else {
      return [
        const Color(0xFFF59E0B),
        const Color(0xFFFBBF24),
      ];
    }
  }

  List<Color> get errorGradient {
    if (isDarkMode) {
      return [
        const Color(0xFFDC2626),
        const Color(0xFFEF4444),
      ];
    } else {
      return [
        const Color(0xFFEF4444),
        const Color(0xFFF87171),
      ];
    }
  }

  // Shimmer colors for current theme
  Color get shimmerBaseColor {
    return isDarkMode 
        ? const Color(0xFF374151)
        : const Color(0xFFE5E7EB);
  }

  Color get shimmerHighlightColor {
    return isDarkMode 
        ? const Color(0xFF4B5563)
        : const Color(0xFFF3F4F6);
  }

  // Shadow colors for current theme
  List<BoxShadow> get cardShadow {
    if (isDarkMode) {
      return [
        BoxShadow(
          color: Colors.black.withOpacity(0.3),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ];
    } else {
      return [
        BoxShadow(
          color: Colors.black.withOpacity(0.1),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ];
    }
  }

  List<BoxShadow> get elevatedShadow {
    if (isDarkMode) {
      return [
        BoxShadow(
          color: Colors.black.withOpacity(0.4),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];
    } else {
      return [
        BoxShadow(
          color: Colors.black.withOpacity(0.15),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
        BoxShadow(
          color: Colors.black.withOpacity(0.1),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
      ];
    }
  }

  // Border colors for current theme
  Color get borderColor {
    return isDarkMode 
        ? const Color(0xFF374151)
        : const Color(0xFFE5E7EB);
  }

  Color get dividerColor {
    return isDarkMode 
        ? const Color(0xFF374151)
        : const Color(0xFFE5E7EB);
  }

  // Overlay colors for current theme
  Color get overlayColor {
    return isDarkMode 
        ? Colors.black.withOpacity(0.7)
        : Colors.black.withOpacity(0.5);
  }

  Color get modalBarrierColor {
    return isDarkMode 
        ? Colors.black.withOpacity(0.8)
        : Colors.black.withOpacity(0.6);
  }

  // Status colors with opacity variants
  Color successWithOpacity(double opacity) {
    return currentThemeColors['success']!.withOpacity(opacity);
  }

  Color warningWithOpacity(double opacity) {
    return currentThemeColors['warning']!.withOpacity(opacity);
  }

  Color errorWithOpacity(double opacity) {
    return currentThemeColors['error']!.withOpacity(opacity);
  }

  Color infoWithOpacity(double opacity) {
    return currentThemeColors['info']!.withOpacity(opacity);
  }

  // Text colors with opacity variants
  Color textPrimaryWithOpacity(double opacity) {
    return currentThemeColors['textPrimary']!.withOpacity(opacity);
  }

  Color textSecondaryWithOpacity(double opacity) {
    return currentThemeColors['textSecondary']!.withOpacity(opacity);
  }

  @override
  void dispose() {
    super.dispose();
  }
}