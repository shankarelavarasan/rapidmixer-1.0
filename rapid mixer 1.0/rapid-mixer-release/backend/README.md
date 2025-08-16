# Rapid Mixer Backend

Node.js backend server for the Rapid Mixer audio processing application with AI-powered stem separation using Spleeter.

## Features

- **Audio Upload & Processing**: Support for multiple audio formats (MP3, WAV, FLAC, AAC, OGG, M4A)
- **AI Stem Separation**: Uses Spleeter 5-stem model for high-quality audio separation
- **Real-time Processing**: Background processing with status tracking
- **Audio Mixing**: FFmpeg-powered audio mixing and export
- **Multiple Export Formats**: MP3, WAV, FLAC, AAC with quality options
- **RESTful API**: Clean API endpoints for frontend integration

## Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Python 3.8+ with pip
- FFmpeg installed and accessible in PATH

### Installation

1. **Install dependencies**:
```bash
npm install
pip install -r requirements.txt
```

2. **Set up environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**:
```bash
npm run dev
```

4. **Start production server**:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Audio Processing
- `POST /api/audio/upload` - Upload audio file for processing
- `POST /api/audio/upload-url` - Process audio from URL
- `GET /api/audio/status/:processId` - Get processing status
- `POST /api/audio/export` - Export mixed audio

### File Serving
- `GET /stems/*` - Serve processed stem files
- `GET /exports/*` - Serve exported audio files

## Deployment

### Vercel
```bash
vercel --prod
```

### Render
```bash
# Push to GitHub and connect to Render
# render.yaml is configured for automatic deployment
```

### Docker
```bash
docker build -t rapid-mixer-backend .
docker run -p 3001:3001 rapid-mixer-backend
```

## Configuration

Key environment variables:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `MAX_FILE_SIZE`: Maximum upload size
- `ALLOWED_ORIGINS`: CORS allowed origins

## Audio Processing Pipeline

1. **Upload**: Audio file uploaded via multipart form
2. **Validation**: File type and size validation
3. **Preprocessing**: Audio normalization and format conversion
4. **Stem Separation**: Spleeter AI processing (vocals, drums, bass, piano, other)
5. **Storage**: High-quality 24-bit WAV stems saved
6. **Mixing**: FFmpeg-based real-time mixing
7. **Export**: Multiple format export with quality options

## Performance

- **Concurrent Processing**: Multiple audio files can be processed simultaneously
- **Memory Optimization**: Streaming audio processing to handle large files
- **Caching**: Processed stems cached for quick access
- **Quality Options**: Configurable audio quality for different use cases

## Troubleshooting

### Common Issues

1. **Python dependencies not found**:
   ```bash
   pip install -r requirements.txt
   ```

2. **FFmpeg not found**:
   - Install FFmpeg and ensure it's in your PATH
   - On Ubuntu: `sudo apt install ffmpeg`
   - On macOS: `brew install ffmpeg`
   - On Windows: Download from https://ffmpeg.org/

3. **Port already in use**:
   ```bash
   export PORT=3002
   npm start
   ```

4. **Memory issues with large files**:
   - Increase Node.js memory limit: `node --max-old-space-size=4096 server.js`
   - Configure upload limits in environment variables

## License

MIT License - see LICENSE file for details.