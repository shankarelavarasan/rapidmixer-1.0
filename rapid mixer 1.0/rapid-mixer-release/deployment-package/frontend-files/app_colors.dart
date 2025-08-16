import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Colors
  static const Color primaryColor = Color(0xFF6C5CE7);      // Purple
  static const Color primaryDark = Color(0xFF5A4FCF);       // Darker Purple
  static const Color primaryLight = Color(0xFF8B7ED8);      // Lighter Purple
  
  static const Color secondaryColor = Color(0xFF00CEC9);    // Teal
  static const Color secondaryDark = Color(0xFF00B894);     // Darker Teal
  static const Color secondaryLight = Color(0xFF55EAE6);    // Lighter Teal
  
  static const Color accentColor = Color(0xFFFF6B6B);       // Coral Red
  static const Color accentDark = Color(0xFFE55656);        // Darker Coral
  static const Color accentLight = Color(0xFFFF8E8E);       // Lighter Coral
  
  // Audio Visualization Colors
  static const Color waveformActive = Color(0xFF00CEC9);
  static const Color waveformInactive = Color(0xFF636E72);
  static const Color spectrumLow = Color(0xFF00B894);
  static const Color spectrumMid = Color(0xFFFFD93D);
  static const Color spectrumHigh = Color(0xFFFF6B6B);
  
  // Mixing Console Colors
  static const Color faderTrack = Color(0xFF2D3436);
  static const Color faderThumb = Color(0xFF6C5CE7);
  static const Color knobBase = Color(0xFF636E72);
  static const Color knobActive = Color(0xFF00CEC9);
  static const Color ledOn = Color(0xFF00B894);
  static const Color ledOff = Color(0xFF636E72);
  
  // Status Colors
  static const Color success = Color(0xFF00B894);
  static const Color warning = Color(0xFFFFD93D);
  static const Color error = Color(0xFFFF6B6B);
  static const Color info = Color(0xFF74B9FF);
  
  // Premium Colors
  static const Color premiumGold = Color(0xFFFFD700);
  static const Color premiumGradientStart = Color(0xFFFFD700);
  static const Color premiumGradientEnd = Color(0xFFFFA500);
  
  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF1A1A1A);
  static const Color darkSurface = Color(0xFF2D2D2D);
  static const Color darkCard = Color(0xFF3A3A3A);
  static const Color darkBorder = Color(0xFF4A4A4A);
  
  // Light Theme Colors
  static const Color lightBackground = Color(0xFFF8F9FA);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFF1F3F4);
  static const Color lightBorder = Color(0xFFE1E5E9);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF2D3436);
  static const Color textSecondary = Color(0xFF636E72);
  static const Color textHint = Color(0xFFB2BEC3);
  static const Color textOnDark = Color(0xFFFFFFFF);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  
  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryColor, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondaryColor, secondaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient premiumGradient = LinearGradient(
    colors: [premiumGradientStart, premiumGradientEnd],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient waveformGradient = LinearGradient(
    colors: [spectrumLow, spectrumMid, spectrumHigh],
    stops: [0.0, 0.5, 1.0],
  );
}