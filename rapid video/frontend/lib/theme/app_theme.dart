import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/constants.dart';

class RapidVideoTheme {
  // Color Scheme
  static final ColorScheme _lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: Color(AppConstants.colorPalette['primary']!),
    onPrimary: Colors.white,
    primaryContainer: Color(0xFFDEE7FF),
    onPrimaryContainer: Color(0xFF001B3D),
    secondary: Color(AppConstants.colorPalette['secondary']!),
    onSecondary: Colors.white,
    secondaryContainer: Color(0xFFB8E6FF),
    onSecondaryContainer: Color(0xFF001F2A),
    tertiary: Color(AppConstants.colorPalette['accent']!),
    onTertiary: Color(0xFF003300),
    tertiaryContainer: Color(0xFFB3FFB3),
    onTertiaryContainer: Color(0xFF002200),
    error: Color(AppConstants.colorPalette['error']!),
    onError: Colors.white,
    errorContainer: Color(0xFFFFDAD6),
    onErrorContainer: Color(0xFF410002),
    surface: Color(AppConstants.colorPalette['surface']!),
    onSurface: Color(AppConstants.colorPalette['textPrimary']!),
    surfaceContainerHighest: Color(0xFFF1F4F8),
    onSurfaceVariant: Color(AppConstants.colorPalette['textSecondary']!),
    outline: Color(AppConstants.colorPalette['border']!),
    outlineVariant: Color(0xFFF1F4F8),
    shadow: Colors.black26,
    scrim: Colors.black54,
    inverseSurface: Color(0xFF2F3033),
    onInverseSurface: Color(0xFFF1F0F4),
    inversePrimary: Color(0xFFB8C6FF),
    surfaceTint: Color(AppConstants.colorPalette['primary']!),
  );

  static final ColorScheme _darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: Color(0xFFB8C6FF),
    onPrimary: Color(0xFF002C71),
    primaryContainer: Color(0xFF00419E),
    onPrimaryContainer: Color(0xFFDEE7FF),
    secondary: Color(0xFF5DD5FC),
    onSecondary: Color(0xFF003544),
    secondaryContainer: Color(0xFF004D61),
    onSecondaryContainer: Color(0xFFB8E6FF),
    tertiary: Color(0xFF66FF99),
    onTertiary: Color(0xFF003300),
    tertiaryContainer: Color(0xFF005500),
    onTertiaryContainer: Color(0xFFB3FFB3),
    error: Color(0xFFFFB4AB),
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF93000A),
    onErrorContainer: Color(0xFFFFDAD6),
    surface: Color(0xFF16181D),
    onSurface: Color(0xFFE3E2E6),
    surfaceContainerHighest: Color(0xFF44474E),
    onSurfaceVariant: Color(0xFFC4C6D0),
    outline: Color(0xFF8E9099),
    outlineVariant: Color(0xFF44474E),
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: Color(0xFFE3E2E6),
    onInverseSurface: Color(0xFF2F3033),
    inversePrimary: Color(AppConstants.colorPalette['primary']!),
    surfaceTint: Color(0xFFB8C6FF),
  );

  // Text Themes
  static TextTheme _buildTextTheme(ColorScheme colorScheme) {
    return GoogleFonts.interTextTheme().copyWith(
      displayLarge: GoogleFonts.inter(
        fontSize: 57,
        fontWeight: FontWeight.w400,
        letterSpacing: -0.25,
        color: colorScheme.onSurface,
      ),
      displayMedium: GoogleFonts.inter(
        fontSize: 45,
        fontWeight: FontWeight.w400,
        color: colorScheme.onSurface,
      ),
      displaySmall: GoogleFonts.inter(
        fontSize: 36,
        fontWeight: FontWeight.w400,
        color: colorScheme.onSurface,
      ),
      headlineLarge: GoogleFonts.inter(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        color: colorScheme.onSurface,
      ),
      headlineMedium: GoogleFonts.inter(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: colorScheme.onSurface,
      ),
      headlineSmall: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: colorScheme.onSurface,
      ),
      titleLarge: GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w500,
        color: colorScheme.onSurface,
      ),
      titleMedium: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        color: colorScheme.onSurface,
      ),
      titleSmall: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        color: colorScheme.onSurface,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.5,
        color: colorScheme.onSurface,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        color: colorScheme.onSurface,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        color: colorScheme.onSurfaceVariant,
      ),
      labelLarge: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        color: colorScheme.onSurface,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        color: colorScheme.onSurface,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        color: colorScheme.onSurfaceVariant,
      ),
    );
  }

  // App Bar Theme
  static AppBarTheme _buildAppBarTheme(ColorScheme colorScheme) {
    return AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 1,
      backgroundColor: colorScheme.surface,
      foregroundColor: colorScheme.onSurface,
      surfaceTintColor: colorScheme.surfaceTint,
      iconTheme: IconThemeData(color: colorScheme.onSurface),
      actionsIconTheme: IconThemeData(color: colorScheme.onSurface),
      titleTextStyle: GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w500,
        color: colorScheme.onSurface,
      ),
      centerTitle: false,
    );
  }

  // Elevated Button Theme
  static ElevatedButtonThemeData _buildElevatedButtonTheme(ColorScheme colorScheme) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 2,
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        disabledBackgroundColor: colorScheme.onSurface.withOpacity(0.12),
        disabledForegroundColor: colorScheme.onSurface.withOpacity(0.38),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.1,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  // Outlined Button Theme
  static OutlinedButtonThemeData _buildOutlinedButtonTheme(ColorScheme colorScheme) {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: colorScheme.primary,
        disabledForegroundColor: colorScheme.onSurface.withOpacity(0.38),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.1,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        side: BorderSide(color: colorScheme.outline),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  // Text Button Theme
  static TextButtonThemeData _buildTextButtonTheme(ColorScheme colorScheme) {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: colorScheme.primary,
        disabledForegroundColor: colorScheme.onSurface.withOpacity(0.38),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.1,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  // Input Decoration Theme
  static InputDecorationTheme _buildInputDecorationTheme(ColorScheme colorScheme) {
    return InputDecorationTheme(
      filled: true,
      fillColor: colorScheme.surfaceContainerHighest,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.outline),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.outline),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: colorScheme.error, width: 2),
      ),
      labelStyle: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: colorScheme.onSurfaceVariant,
      ),
      hintStyle: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: colorScheme.onSurfaceVariant.withOpacity(0.6),
      ),
      errorStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: colorScheme.error,
      ),
    );
  }

  // Card Theme
  static CardThemeData _buildCardTheme(ColorScheme colorScheme) {
    return CardThemeData(
      elevation: 2,
      color: colorScheme.surface,
      surfaceTintColor: colorScheme.surfaceTint,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      clipBehavior: Clip.antiAlias,
    );
  }

  // Chip Theme
  static ChipThemeData _buildChipTheme(ColorScheme colorScheme) {
    return ChipThemeData(
      backgroundColor: colorScheme.surfaceContainerHighest,
      deleteIconColor: colorScheme.onSurfaceVariant,
      disabledColor: colorScheme.onSurface.withOpacity(0.12),
      selectedColor: colorScheme.secondaryContainer,
      secondarySelectedColor: colorScheme.secondaryContainer,
      labelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: colorScheme.onSurfaceVariant,
      ),
      secondaryLabelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: colorScheme.onSecondaryContainer,
      ),
      brightness: colorScheme.brightness,
      elevation: 0,
      pressElevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  // Dialog Theme
  static DialogThemeData _buildDialogTheme(ColorScheme colorScheme) {
    return DialogThemeData(
      backgroundColor: colorScheme.surface,
      surfaceTintColor: colorScheme.surfaceTint,
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      titleTextStyle: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: colorScheme.onSurface,
      ),
      contentTextStyle: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: colorScheme.onSurfaceVariant,
      ),
    );
  }

  // Floating Action Button Theme
  static FloatingActionButtonThemeData _buildFabTheme(ColorScheme colorScheme) {
    return FloatingActionButtonThemeData(
      backgroundColor: colorScheme.primaryContainer,
      foregroundColor: colorScheme.onPrimaryContainer,
      elevation: 6,
      focusElevation: 8,
      hoverElevation: 8,
      highlightElevation: 12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }

  // Progress Indicator Theme
  static ProgressIndicatorThemeData _buildProgressIndicatorTheme(ColorScheme colorScheme) {
    return ProgressIndicatorThemeData(
      color: colorScheme.primary,
      linearTrackColor: colorScheme.surfaceContainerHighest,
      circularTrackColor: colorScheme.surfaceContainerHighest,
    );
  }

  // Snack Bar Theme
  static SnackBarThemeData _buildSnackBarTheme(ColorScheme colorScheme) {
    return SnackBarThemeData(
      backgroundColor: colorScheme.inverseSurface,
      contentTextStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: colorScheme.onInverseSurface,
      ),
      actionTextColor: colorScheme.inversePrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      behavior: SnackBarBehavior.floating,
      elevation: 6,
    );
  }

  // Light Theme
  static ThemeData get lightTheme {
    final colorScheme = _lightColorScheme;
    final textTheme = _buildTextTheme(colorScheme);

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: textTheme,
      appBarTheme: _buildAppBarTheme(colorScheme),
      elevatedButtonTheme: _buildElevatedButtonTheme(colorScheme),
      outlinedButtonTheme: _buildOutlinedButtonTheme(colorScheme),
      textButtonTheme: _buildTextButtonTheme(colorScheme),
      inputDecorationTheme: _buildInputDecorationTheme(colorScheme),
      cardTheme: _buildCardTheme(colorScheme),
      chipTheme: _buildChipTheme(colorScheme),
      dialogTheme: _buildDialogTheme(colorScheme),
      floatingActionButtonTheme: _buildFabTheme(colorScheme),
      progressIndicatorTheme: _buildProgressIndicatorTheme(colorScheme),
      snackBarTheme: _buildSnackBarTheme(colorScheme),
      dividerColor: colorScheme.outline,
      scaffoldBackgroundColor: colorScheme.surface,
      visualDensity: VisualDensity.adaptivePlatformDensity,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.linux: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.windows: FadeUpwardsPageTransitionsBuilder(),
        },
      ),
    );
  }

  // Dark Theme
  static ThemeData get darkTheme {
    final colorScheme = _darkColorScheme;
    final textTheme = _buildTextTheme(colorScheme);

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: textTheme,
      appBarTheme: _buildAppBarTheme(colorScheme),
      elevatedButtonTheme: _buildElevatedButtonTheme(colorScheme),
      outlinedButtonTheme: _buildOutlinedButtonTheme(colorScheme),
      textButtonTheme: _buildTextButtonTheme(colorScheme),
      inputDecorationTheme: _buildInputDecorationTheme(colorScheme),
      cardTheme: _buildCardTheme(colorScheme),
      chipTheme: _buildChipTheme(colorScheme),
      dialogTheme: _buildDialogTheme(colorScheme),
      floatingActionButtonTheme: _buildFabTheme(colorScheme),
      progressIndicatorTheme: _buildProgressIndicatorTheme(colorScheme),
      snackBarTheme: _buildSnackBarTheme(colorScheme),
      dividerColor: colorScheme.outline,
      scaffoldBackgroundColor: colorScheme.surface,
      visualDensity: VisualDensity.adaptivePlatformDensity,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.linux: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.windows: FadeUpwardsPageTransitionsBuilder(),
        },
      ),
    );
  }
}

// Custom Colors Extension
extension CustomColors on ColorScheme {
  Color get success => brightness == Brightness.light
      ? Color(AppConstants.colorPalette['success']!)
      : const Color(0xFF4ADE80);
  
  Color get onSuccess => brightness == Brightness.light
      ? Colors.white
      : const Color(0xFF003300);
  
  Color get warning => brightness == Brightness.light
      ? Color(AppConstants.colorPalette['warning']!)
      : const Color(0xFFFBBF24);
  
  Color get onWarning => brightness == Brightness.light
      ? Colors.white
      : const Color(0xFF332200);
  
  Color get info => brightness == Brightness.light
      ? const Color(0xFF3B82F6)
      : const Color(0xFF60A5FA);
  
  Color get onInfo => brightness == Brightness.light
      ? Colors.white
      : const Color(0xFF001B3D);
}

// Theme Extensions
class AppThemeExtension extends ThemeExtension<AppThemeExtension> {
  final Color gradientStart;
  final Color gradientEnd;
  final Color shimmerBase;
  final Color shimmerHighlight;
  final Color videoPlayerBackground;
  final Color progressTrack;
  final Color uploadZoneBackground;
  final Color uploadZoneBorder;

  const AppThemeExtension({
    required this.gradientStart,
    required this.gradientEnd,
    required this.shimmerBase,
    required this.shimmerHighlight,
    required this.videoPlayerBackground,
    required this.progressTrack,
    required this.uploadZoneBackground,
    required this.uploadZoneBorder,
  });

  @override
  AppThemeExtension copyWith({
    Color? gradientStart,
    Color? gradientEnd,
    Color? shimmerBase,
    Color? shimmerHighlight,
    Color? videoPlayerBackground,
    Color? progressTrack,
    Color? uploadZoneBackground,
    Color? uploadZoneBorder,
  }) {
    return AppThemeExtension(
      gradientStart: gradientStart ?? this.gradientStart,
      gradientEnd: gradientEnd ?? this.gradientEnd,
      shimmerBase: shimmerBase ?? this.shimmerBase,
      shimmerHighlight: shimmerHighlight ?? this.shimmerHighlight,
      videoPlayerBackground: videoPlayerBackground ?? this.videoPlayerBackground,
      progressTrack: progressTrack ?? this.progressTrack,
      uploadZoneBackground: uploadZoneBackground ?? this.uploadZoneBackground,
      uploadZoneBorder: uploadZoneBorder ?? this.uploadZoneBorder,
    );
  }

  @override
  AppThemeExtension lerp(ThemeExtension<AppThemeExtension>? other, double t) {
    if (other is! AppThemeExtension) {
      return this;
    }
    return AppThemeExtension(
      gradientStart: Color.lerp(gradientStart, other.gradientStart, t)!,
      gradientEnd: Color.lerp(gradientEnd, other.gradientEnd, t)!,
      shimmerBase: Color.lerp(shimmerBase, other.shimmerBase, t)!,
      shimmerHighlight: Color.lerp(shimmerHighlight, other.shimmerHighlight, t)!,
      videoPlayerBackground: Color.lerp(videoPlayerBackground, other.videoPlayerBackground, t)!,
      progressTrack: Color.lerp(progressTrack, other.progressTrack, t)!,
      uploadZoneBackground: Color.lerp(uploadZoneBackground, other.uploadZoneBackground, t)!,
      uploadZoneBorder: Color.lerp(uploadZoneBorder, other.uploadZoneBorder, t)!,
    );
  }

  static const light = AppThemeExtension(
    gradientStart: Color(0xFF3B82F6),
    gradientEnd: Color(0xFF06B6D4),
    shimmerBase: Color(0xFFE5E7EB),
    shimmerHighlight: Color(0xFFF3F4F6),
    videoPlayerBackground: Color(0xFF000000),
    progressTrack: Color(0xFFE5E7EB),
    uploadZoneBackground: Color(0xFFF8FAFC),
    uploadZoneBorder: Color(0xFFD1D5DB),
  );

  static const dark = AppThemeExtension(
    gradientStart: Color(0xFF1E40AF),
    gradientEnd: Color(0xFF0891B2),
    shimmerBase: Color(0xFF374151),
    shimmerHighlight: Color(0xFF4B5563),
    videoPlayerBackground: Color(0xFF000000),
    progressTrack: Color(0xFF374151),
    uploadZoneBackground: Color(0xFF1F2937),
    uploadZoneBorder: Color(0xFF4B5563),
  );
}

// Responsive Breakpoints
class Breakpoints {
  static const double mobile = 640;
  static const double tablet = 768;
  static const double desktop = 1024;
  static const double wide = 1280;

  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < mobile;
  }

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= mobile && width < desktop;
  }

  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= desktop;
  }

  static bool isWide(BuildContext context) {
    return MediaQuery.of(context).size.width >= wide;
  }
}

// Spacing Constants
class Spacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  static const double xxxl = 64.0;
}

// Border Radius Constants
class BorderRadii {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double round = 999.0;
}