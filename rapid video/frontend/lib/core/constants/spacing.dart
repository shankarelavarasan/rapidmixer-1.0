import 'package:flutter/material.dart';

/// App spacing constants for consistent UI layout
class AppSpacing {
  // Base spacing unit
  static const double baseUnit = 8.0;
  
  // Spacing values
  static const double xs = baseUnit * 0.5; // 4.0
  static const double sm = baseUnit; // 8.0
  static const double md = baseUnit * 2; // 16.0
  static const double lg = baseUnit * 3; // 24.0
  static const double xl = baseUnit * 4; // 32.0
  static const double xxl = baseUnit * 6; // 48.0
  static const double xxxl = baseUnit * 8; // 64.0
  
  // Specific spacing values
  static const double tiny = 2.0;
  static const double small = 4.0;
  static const double medium = 12.0;
  static const double large = 20.0;
  static const double extraLarge = 28.0;
  static const double huge = 36.0;
  static const double massive = 44.0;
  
  // Padding values
  static const EdgeInsets paddingXS = EdgeInsets.all(xs);
  static const EdgeInsets paddingSM = EdgeInsets.all(sm);
  static const EdgeInsets paddingMD = EdgeInsets.all(md);
  static const EdgeInsets paddingLG = EdgeInsets.all(lg);
  static const EdgeInsets paddingXL = EdgeInsets.all(xl);
  static const EdgeInsets paddingXXL = EdgeInsets.all(xxl);
  
  // Horizontal padding
  static const EdgeInsets paddingHorizontalXS = EdgeInsets.symmetric(horizontal: xs);
  static const EdgeInsets paddingHorizontalSM = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets paddingHorizontalMD = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets paddingHorizontalLG = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets paddingHorizontalXL = EdgeInsets.symmetric(horizontal: xl);
  
  // Vertical padding
  static const EdgeInsets paddingVerticalXS = EdgeInsets.symmetric(vertical: xs);
  static const EdgeInsets paddingVerticalSM = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets paddingVerticalMD = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets paddingVerticalLG = EdgeInsets.symmetric(vertical: lg);
  static const EdgeInsets paddingVerticalXL = EdgeInsets.symmetric(vertical: xl);
  
  // Margin values
  static const EdgeInsets marginXS = EdgeInsets.all(xs);
  static const EdgeInsets marginSM = EdgeInsets.all(sm);
  static const EdgeInsets marginMD = EdgeInsets.all(md);
  static const EdgeInsets marginLG = EdgeInsets.all(lg);
  static const EdgeInsets marginXL = EdgeInsets.all(xl);
  static const EdgeInsets marginXXL = EdgeInsets.all(xxl);
  
  // Horizontal margin
  static const EdgeInsets marginHorizontalXS = EdgeInsets.symmetric(horizontal: xs);
  static const EdgeInsets marginHorizontalSM = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets marginHorizontalMD = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets marginHorizontalLG = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets marginHorizontalXL = EdgeInsets.symmetric(horizontal: xl);
  
  // Vertical margin
  static const EdgeInsets marginVerticalXS = EdgeInsets.symmetric(vertical: xs);
  static const EdgeInsets marginVerticalSM = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets marginVerticalMD = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets marginVerticalLG = EdgeInsets.symmetric(vertical: lg);
  static const EdgeInsets marginVerticalXL = EdgeInsets.symmetric(vertical: xl);
  
  // SizedBox spacing widgets
  static const Widget verticalSpaceXS = SizedBox(height: xs);
  static const Widget verticalSpaceSM = SizedBox(height: sm);
  static const Widget verticalSpaceMD = SizedBox(height: md);
  static const Widget verticalSpaceLG = SizedBox(height: lg);
  static const Widget verticalSpaceXL = SizedBox(height: xl);
  static const Widget verticalSpaceXXL = SizedBox(height: xxl);
  
  static const Widget horizontalSpaceXS = SizedBox(width: xs);
  static const Widget horizontalSpaceSM = SizedBox(width: sm);
  static const Widget horizontalSpaceMD = SizedBox(width: md);
  static const Widget horizontalSpaceLG = SizedBox(width: lg);
  static const Widget horizontalSpaceXL = SizedBox(width: xl);
  static const Widget horizontalSpaceXXL = SizedBox(width: xxl);
  
  // Border radius values
  static const double radiusXS = 2.0;
  static const double radiusSM = 4.0;
  static const double radiusMD = 8.0;
  static const double radiusLG = 12.0;
  static const double radiusXL = 16.0;
  static const double radiusXXL = 24.0;
  static const double radiusCircular = 999.0;
  
  // BorderRadius objects
  static const BorderRadius borderRadiusXS = BorderRadius.all(Radius.circular(radiusXS));
  static const BorderRadius borderRadiusSM = BorderRadius.all(Radius.circular(radiusSM));
  static const BorderRadius borderRadiusMD = BorderRadius.all(Radius.circular(radiusMD));
  static const BorderRadius borderRadiusLG = BorderRadius.all(Radius.circular(radiusLG));
  static const BorderRadius borderRadiusXL = BorderRadius.all(Radius.circular(radiusXL));
  static const BorderRadius borderRadiusXXL = BorderRadius.all(Radius.circular(radiusXXL));
  static const BorderRadius borderRadiusCircular = BorderRadius.all(Radius.circular(radiusCircular));
  
  // Icon sizes
  static const double iconXS = 12.0;
  static const double iconSM = 16.0;
  static const double iconMD = 20.0;
  static const double iconLG = 24.0;
  static const double iconXL = 32.0;
  static const double iconXXL = 48.0;
  static const double iconHuge = 64.0;
  
  // Button heights
  static const double buttonHeightSM = 32.0;
  static const double buttonHeightMD = 40.0;
  static const double buttonHeightLG = 48.0;
  static const double buttonHeightXL = 56.0;
  
  // Input field heights
  static const double inputHeightSM = 36.0;
  static const double inputHeightMD = 44.0;
  static const double inputHeightLG = 52.0;
  
  // Card elevations
  static const double elevationNone = 0.0;
  static const double elevationSM = 1.0;
  static const double elevationMD = 2.0;
  static const double elevationLG = 4.0;
  static const double elevationXL = 8.0;
  static const double elevationXXL = 16.0;
  
  // Divider thickness
  static const double dividerThin = 0.5;
  static const double dividerMedium = 1.0;
  static const double dividerThick = 2.0;
  
  // Screen breakpoints
  static const double mobileBreakpoint = 600.0;
  static const double tabletBreakpoint = 900.0;
  static const double desktopBreakpoint = 1200.0;
  
  // Container constraints
  static const double maxContentWidth = 1200.0;
  static const double minButtonWidth = 88.0;
  static const double maxButtonWidth = 280.0;
  
  // Animation durations (in milliseconds)
  static const int animationFast = 150;
  static const int animationNormal = 300;
  static const int animationSlow = 500;
  static const int animationVerySlow = 1000;
}

/// Extension methods for easy spacing access
extension SpacingExtension on num {
  /// Convert number to SizedBox with height
  Widget get verticalSpace => SizedBox(height: toDouble());
  
  /// Convert number to SizedBox with width
  Widget get horizontalSpace => SizedBox(width: toDouble());
  
  /// Convert number to EdgeInsets.all
  EdgeInsets get padding => EdgeInsets.all(toDouble());
  
  /// Convert number to EdgeInsets.all
  EdgeInsets get margin => EdgeInsets.all(toDouble());
  
  /// Convert number to horizontal padding
  EdgeInsets get paddingHorizontal => EdgeInsets.symmetric(horizontal: toDouble());
  
  /// Convert number to vertical padding
  EdgeInsets get paddingVertical => EdgeInsets.symmetric(vertical: toDouble());
  
  /// Convert number to horizontal margin
  EdgeInsets get marginHorizontal => EdgeInsets.symmetric(horizontal: toDouble());
  
  /// Convert number to vertical margin
  EdgeInsets get marginVertical => EdgeInsets.symmetric(vertical: toDouble());
  
  /// Convert number to BorderRadius.circular
  BorderRadius get borderRadius => BorderRadius.circular(toDouble());
  
  /// Convert number to Radius.circular
  Radius get radius => Radius.circular(toDouble());
}

/// Responsive spacing helper
class ResponsiveSpacing {
  static double getSpacing(BuildContext context, {
    double mobile = AppSpacing.md,
    double tablet = AppSpacing.lg,
    double desktop = AppSpacing.xl,
  }) {
    final width = MediaQuery.of(context).size.width;
    
    if (width >= AppSpacing.desktopBreakpoint) {
      return desktop;
    } else if (width >= AppSpacing.tabletBreakpoint) {
      return tablet;
    } else {
      return mobile;
    }
  }
  
  static EdgeInsets getPadding(BuildContext context, {
    EdgeInsets mobile = AppSpacing.paddingMD,
    EdgeInsets tablet = AppSpacing.paddingLG,
    EdgeInsets desktop = AppSpacing.paddingXL,
  }) {
    final width = MediaQuery.of(context).size.width;
    
    if (width >= AppSpacing.desktopBreakpoint) {
      return desktop;
    } else if (width >= AppSpacing.tabletBreakpoint) {
      return tablet;
    } else {
      return mobile;
    }
  }
}