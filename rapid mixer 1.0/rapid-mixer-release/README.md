# Rapid Mixer - Music Production App 🎵

A powerful, professional-grade music production application that allows users to upload songs, split them into individual instruments and beats using AI, mix multiple tracks, and export high-quality audio.

## ✨ Features

### 🎵 **AI-Powered Audio Processing**
- Upload any song format (MP3, WAV, FLAC, AAC, OGG, M4A)
- AI-powered stem separation using Spleeter (vocals, drums, bass, piano, other)
- Real-time processing with progress tracking
- High-quality 24-bit audio processing
- Background processing support

### 🎛️ **Professional Mixing Console**
- Multi-track mixing interface
- Volume, pan, and EQ controls (3-band equalizer)
- Real-time waveform visualization
- Professional transport controls (play, pause, stop, loop)
- Audio effects (reverb, delay, compression)
- Beat matching and tempo synchronization

### 📱 **Cross-Platform Support**
- Flutter mobile app (Android/iOS)
- Progressive Web App (PWA)
- Responsive design for all screen sizes
- Native performance on all platforms

### 🎨 **Modern UI/UX**
- Material Design 3 interface
- Dark/Light theme support
- Smooth animations and transitions
- Professional audio production workflow

### 📤 **Export & Sharing**
- Multiple export formats (MP3, WAV, FLAC, AAC)
- Quality settings (high, medium, low)
- Metadata editing support
- Direct sharing integration

## 🏗️ Architecture

- **Frontend**: Flutter 3.6+ (Dart) with responsive UI
- **Backend**: Node.js 18+ with Express
- **Audio Processing**: Python 3.8+ with Spleeter AI
- **Database**: SQLite for metadata storage
- **File Storage**: Organized file system with cloud support
- **Audio Engine**: FFmpeg for mixing and export

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Python 3.8+ with pip
- Flutter SDK 3.6+
- FFmpeg installed and in PATH
- Android Studio (for mobile builds)
- Xcode (for iOS builds, macOS only)

### Option 1: Automated Setup (Windows)
```bash
# Setup backend
.\build-scripts\setup-backend.bat

# Setup frontend
.\build-scripts\setup-frontend.bat
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
flutter pub get
flutter run -d chrome
```

### Option 3: Docker (Recommended for Production)
```bash
cd deploy
docker-compose up -d
```
Access at `http://localhost`

## 📦 Build & Release

### Android APK
```bash
.\build-scripts\build-android.bat
# Output: frontend/build/app/outputs/flutter-apk/
```

### Web App
```bash
.\build-scripts\build-web.bat
# Output: frontend/build/web/
```

### iOS (macOS only)
```bash
cd frontend
flutter build ios --release
# Then archive in Xcode
```

## 🌐 Deployment Options

### Backend Deployment
- **Vercel**: Serverless deployment with `vercel.json`
- **Render**: Full server deployment with `render.yaml`
- **Railway**: Git-based deployment
- **DigitalOcean**: App Platform deployment
- **Docker**: Container deployment with `Dockerfile`

### Frontend Deployment
- **Web**: Netlify, Vercel, Firebase Hosting, GitHub Pages
- **Android**: Google Play Store (`.aab` bundle)
- **iOS**: Apple App Store (Xcode archive)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📁 Project Structure

```
rapid-mixer-release/
├── backend/                 # Node.js backend server
│   ├── config/             # Server configuration
│   ├── controllers/        # API controllers
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── server.js           # Main server file
│   ├── process_audio.py    # Spleeter processing script
│   └── requirements.txt    # Python dependencies
├── frontend/               # Flutter frontend app
│   ├── lib/
│   │   ├── presentation/   # UI screens and widgets
│   │   ├── services/       # API and business logic
│   │   ├── theme/          # App theming
│   │   └── widgets/        # Reusable components
│   ├── android/            # Android-specific files
│   ├── ios/                # iOS-specific files
│   └── web/                # Web-specific files
├── build-scripts/          # Automated build scripts
├── deploy/                 # Deployment configurations
└── docs/                   # Documentation
```

## 🔧 Configuration

### Backend Configuration
Key environment variables in `.env`:
```env
PORT=3001
NODE_ENV=production
MAX_FILE_SIZE=100MB
SPLEETER_MODEL=5stems-16kHz
ALLOWED_ORIGINS=https://your-domain.com
```

### Frontend Configuration
Update API endpoint in `lib/services/audio_service.dart`:
```dart
static const String baseUrl = 'https://your-backend-url.com';
```

## 🎯 API Endpoints

### Audio Processing
- `POST /api/audio/upload` - Upload audio file
- `POST /api/audio/upload-url` - Process from URL
- `GET /api/audio/status/:id` - Processing status
- `POST /api/audio/export` - Export mixed audio

### Health & Monitoring
- `GET /health` - Server health check
- `GET /stems/*` - Serve processed stems
- `GET /exports/*` - Serve exported files

## 🔒 Security Features

- Input validation and sanitization
- File type and size validation
- Rate limiting on API endpoints
- CORS configuration
- Secure file storage
- Error handling and logging

## 📊 Performance

- **Concurrent Processing**: Multiple audio files
- **Memory Optimization**: Streaming for large files
- **Quality Options**: Configurable audio quality
- **Caching**: Processed stems cached
- **Background Processing**: Non-blocking operations

## 🛠️ Development

### Running Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && flutter test
```

### Code Quality
- ESLint for JavaScript
- Flutter analyzer for Dart
- Prettier for code formatting

## 📱 Platform Support

- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 11.0+
- **Web**: Modern browsers with Web Audio API
- **Desktop**: Windows, macOS, Linux (via Flutter)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues
- **Build failures**: Run `flutter clean && flutter pub get`
- **Audio processing errors**: Check Python dependencies
- **CORS errors**: Configure allowed origins
- **Memory issues**: Increase Node.js memory limit

### Getting Help
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
- Review backend/frontend README files
- Check logs for error messages

## 🎉 Release Notes

### Version 1.0.0
- Initial release with full audio processing pipeline
- AI-powered stem separation with Spleeter
- Professional mixing console interface
- Cross-platform support (Android, iOS, Web)
- Multiple export formats and quality options
- Docker deployment support
- Comprehensive documentation

---

**Ready for production deployment!** 🚀

Choose your deployment method and start processing audio with AI-powered precision.