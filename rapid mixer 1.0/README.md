# Rapid Mixer 🎵

A Flutter-based audio mixing application with AI-powered stem separation using Spleeter technology.

## Features

- **AI-Powered Audio Separation**: Uses Google's Spleeter to separate audio tracks into stems (vocals, drums, bass, other)
- **Real-time Audio Processing**: Process and mix audio files in real-time
- **Cross-Platform**: Built with Flutter for iOS, Android, and Web
- **Modern UI**: Clean and intuitive user interface
- **Export Options**: Multiple export formats and quality settings

## Architecture

### Frontend (Flutter)
- **Framework**: Flutter
- **Language**: Dart
- **UI Components**: Custom audio controls, track editor, export options
- **Services**: Audio processing, import/export, AI processing

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: SQLite
- **AI Processing**: Python with Spleeter
- **File Upload**: Multer middleware
- **API Endpoints**: RESTful API for audio processing

## Project Structure

```
rapid mixer 1.0/
├── backend/backend/          # Node.js backend server
│   ├── controllers/          # API controllers
│   ├── routes/              # API routes
│   ├── services/            # Database and other services
│   ├── config/              # Configuration files
│   ├── process_audio.py     # Python Spleeter integration
│   └── server.js            # Main server file
├── lib/                     # Flutter app (if using standard structure)
├── *.dart                  # Flutter Dart files
├── pubspec.yaml            # Flutter dependencies
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Node.js (v14 or higher)
- Python 3.7+ with pip
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd "backend/backend"
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   node server.js
   ```

   The server will run on `http://localhost:3001`

### Frontend Setup

1. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

2. Run the Flutter app:
   ```bash
   flutter run
   ```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/audio/samples` - Get sample audio tracks
- `POST /api/audio/upload` - Upload audio file for processing
- `GET /api/audio/recent` - Get recently processed files

## Deployment

### Backend Deployment (Render)

The backend is configured for deployment on Render with the included `render.yaml` file.

### Frontend Deployment (GitHub Pages)

The Flutter web app can be deployed to GitHub Pages:

1. Build for web:
   ```bash
   flutter build web
   ```

2. Deploy the `build/web` directory to GitHub Pages

## Live Demos

- **Frontend**: [https://shankarelavarasan.github.io/rapidmixer-1.0/](https://shankarelavarasan.github.io/rapidmixer-1.0/)
- **Backend**: [https://rapid-mixer-backend.onrender.com](https://rapid-mixer-backend.onrender.com)

## Technologies Used

- **Frontend**: Flutter, Dart
- **Backend**: Node.js, Express.js, SQLite
- **AI Processing**: Python, Spleeter, TensorFlow
- **Deployment**: Render (backend), GitHub Pages (frontend)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google's Spleeter for audio source separation
- Flutter team for the amazing framework
- Node.js and Express.js communities

---

**Note**: This is a development version. For production use, ensure proper security measures and production-grade configurations are implemented.