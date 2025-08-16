class AppConfig {
  // App Branding
  static const String appName = 'Rapid Mixer Pro';
  static const String appTagline = 'Professional AI-Powered Music Production';
  static const String appVersion = '1.0.0';
  static const String companyName = 'Rapid Audio Labs';
  
  // App Store Information
  static const String appId = 'com.rapidaudiolabs.rapidmixer';
  static const String playStoreUrl = 'https://play.google.com/store/apps/details?id=$appId';
  static const String appStoreUrl = 'https://apps.apple.com/app/rapid-mixer-pro/id123456789';
  
  // API Configuration
  static const String apiBaseUrl = 'https://rapid-mixer-2-0-1.onrender.com';
  static const String websocketUrl = 'wss://rapid-mixer-2-0-1.onrender.com';
  
  // Feature Flags
  static const bool enablePremiumFeatures = true;
  static const bool enableCollaboration = true;
  static const bool enableCloudStorage = true;
  static const bool enableAnalytics = true;
  
  // Subscription Plans
  static const String freeTrialDays = '7';
  static const String premiumMonthlyPrice = '\$9.99';
  static const String premiumYearlyPrice = '\$99.99';
  
  // Limits
  static const int freeUserMaxProjects = 3;
  static const int freeUserMaxExportsPerDay = 5;
  static const int premiumUserMaxProjects = 100;
  static const int premiumUserMaxExportsPerDay = 100;
  
  // Social Links
  static const String websiteUrl = 'https://rapidmixer.pro';
  static const String supportEmail = 'support@rapidmixer.pro';
  static const String twitterUrl = 'https://twitter.com/rapidmixer';
  static const String instagramUrl = 'https://instagram.com/rapidmixer';
  static const String youtubeUrl = 'https://youtube.com/@rapidmixer';
}