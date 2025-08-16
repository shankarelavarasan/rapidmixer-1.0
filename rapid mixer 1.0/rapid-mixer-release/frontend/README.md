# Rapid Mixer Frontend

Flutter-based cross-platform frontend for the Rapid Mixer audio production application.

## Features

🎵 **Audio Processing Interface**
- Drag & drop audio file upload
- Real-time processing progress
- AI-powered stem separation visualization

🎛️ **Professional Mixing Console**
- Multi-track audio mixing
- Volume, pan, and EQ controls
- Real-time waveform display
- Professional transport controls

📱 **Cross-Platform Support**
- Android mobile app
- iOS mobile app  
- Progressive Web App (PWA)
- Responsive design for all screen sizes

🎨 **Modern UI/UX**
- Material Design 3
- Dark/Light theme support
- Smooth animations and transitions
- Professional audio production interface

## Quick Start

### Prerequisites
- Flutter SDK 3.6+
- Dart SDK 3.6+
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

### Installation

1. **Install dependencies**:
```bash
flutter pub get
```

2. **Run on device/emulator**:
```bash
# Web
flutter run -d chrome

# Android
flutter run -d android

# iOS (macOS only)
flutter run -d ios
```

## Build Commands

### Development
```bash
# Hot reload development
flutter run

# Web development server
flutter run -d web-server --web-port 3000
```

### Production Builds

#### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

#### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

#### iOS (macOS only)
```bash
flutter build ios --release
# Then open ios/Runner.xcworkspace in Xcode to archive
```

#### Web (PWA)
```bash
flutter build web --release
# Output: build/web/
```

## Project Structure

```
lib/
├── core/                   # Core utilities and exports
├── presentation/           # UI screens and widgets
│   ├── ai_processing/     # Audio processing screen
│   ├── audio_import/      # File import interface
│   ├── beat_library/      # Beat library browser
│   ├── effects_panel/     # Audio effects controls
│   ├── export_options/    # Export configuration
│   └── track_editor/      # Main mixing interface
├── routes/                # App navigation
├── services/              # Business logic and API calls
├── theme/                 # App theming and styles
└── widgets/               # Reusable UI components
```

## Key Features

### Audio Import
- File picker integration
- Drag & drop support (web)
- URL-based audio import
- Format validation and preview

### AI Processing
- Real-time progress tracking
- Animated processing visualization
- Background processing support
- Error handling and retry logic

### Track Editor
- Professional mixing console
- Multi-track timeline
- Waveform visualization
- Transport controls (play, pause, stop, loop)

### Effects Panel
- EQ controls (3-band equalizer)
- Reverb effects
- Delay/Echo effects
- Compression controls
- Real-time audio visualization

### Export Options
- Multiple format support (MP3, WAV, FLAC, AAC)
- Quality settings (high, medium, low)
- Metadata editing
- Share integration

## Configuration

### Backend Connection
Update the API base URL in `lib/services/audio_service.dart`:
```dart
static const String baseUrl = 'https://your-backend-url.com';
```

### App Configuration
Edit `pubspec.yaml` for:
- App name and description
- Version number
- Dependencies

### Platform-Specific Configuration

#### Android
- `android/app/src/main/AndroidManifest.xml` - Permissions and app config
- `android/app/build.gradle` - Build configuration
- `android/app/src/main/res/` - App icons and resources

#### iOS
- `ios/Runner/Info.plist` - App permissions and configuration
- `ios/Runner/Assets.xcassets/` - App icons
- `ios/Runner.xcodeproj/` - Xcode project settings

#### Web
- `web/index.html` - PWA configuration
- `web/manifest.json` - Web app manifest
- `web/icons/` - PWA icons

## Deployment

### Android Play Store
1. Build app bundle: `flutter build appbundle --release`
2. Upload to Google Play Console
3. Configure store listing and publish

### iOS App Store
1. Build iOS app: `flutter build ios --release`
2. Archive in Xcode
3. Upload to App Store Connect
4. Submit for review

### Web Hosting
1. Build web app: `flutter build web --release`
2. Deploy `build/web/` to hosting service:
   - Firebase Hosting
   - Netlify
   - Vercel
   - GitHub Pages

### Example Web Deployment (Firebase)
```bash
flutter build web --release
firebase init hosting
firebase deploy
```

## Performance Optimization

### Audio Processing
- Efficient memory management for large audio files
- Background processing with isolates
- Optimized waveform rendering
- Lazy loading for audio visualization

### UI Performance
- Efficient list rendering with ListView.builder
- Image caching for album artwork
- Smooth animations with proper disposal
- Responsive design with Sizer package

## Troubleshooting

### Common Issues

1. **Build failures**:
   ```bash
   flutter clean
   flutter pub get
   flutter build [platform]
   ```

2. **Hot reload not working**:
   ```bash
   flutter run --hot
   ```

3. **Platform-specific issues**:
   - Android: Check SDK versions in `build.gradle`
   - iOS: Verify Xcode and iOS deployment target
   - Web: Check browser compatibility

4. **Audio playback issues**:
   - Verify backend connection
   - Check CORS configuration
   - Test with different audio formats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## License

MIT License - see LICENSE file for details.