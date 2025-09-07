# 🎥 Rapid Video - AI-Powered 3D Animation Platform

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://shankarelavarasan.github.io/Rapid-video-maker/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-blue)](https://shankarelavarasan.github.io/Rapid-video-maker/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Flutter](https://img.shields.io/badge/Flutter-Web-blue)](https://flutter.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-red)](https://fastapi.tiangolo.com/)

> Transform your 2D videos into stunning 3D animations using cutting-edge artificial intelligence. Professional results in minutes, not months.

## 🌟 Live Demo

**🚀 [Visit Live Site](https://shankarelavarasan.github.io/Rapid-video-maker/)**

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🤖 AI-Powered Processing
- **Gemini AI Integration**: Advanced scene analysis and understanding
- **Veo 3 Generation**: State-of-the-art 3D scene generation
- **Banana.dev GPU**: High-performance cloud rendering
- **Intelligent Scene Splitting**: Automatic video segmentation

### ⚡ Performance & Speed
- **5-10 Minute Processing**: Lightning-fast video conversion
- **Real-time Progress**: Live status updates and notifications
- **Batch Processing**: Handle multiple videos simultaneously
- **Cloud Infrastructure**: Scalable GPU processing power

### 🌐 Web-First Experience
- **No Downloads Required**: Complete browser-based solution
- **Progressive Web App**: Installable across all devices
- **Cross-Platform**: Works on desktop, tablet, and mobile
- **Responsive Design**: Optimized for all screen sizes

### 🎨 Professional Quality
- **4K Output Support**: High-resolution video generation
- **Custom Styles**: Personalized 3D animation templates
- **Audio Synchronization**: Perfect audio-visual alignment
- **Multiple Formats**: Various export options

### 🔒 Security & Privacy
- **Firebase Authentication**: Secure user management
- **Encrypted Storage**: Protected file handling
- **GDPR Compliant**: Privacy-first approach
- **Enterprise Security**: Industry-standard protection

## 🛠 Technology Stack

### Frontend
```
┌─────────────────────────────────────────────────────────┐
│                    Flutter Web                         │
├─────────────────────────────────────────────────────────┤
│ • Dart Programming Language                            │
│ • Firebase Authentication                              │
│ • Provider State Management                            │
│ • Material Design Components                           │
│ • Progressive Web App (PWA)                            │
│ • Responsive UI Framework                              │
└─────────────────────────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────────────────────────┐
│                   FastAPI + Python                     │
├─────────────────────────────────────────────────────────┤
│ • FastAPI Web Framework                                │
│ • PostgreSQL Database                                  │
│ • SQLAlchemy ORM                                       │
│ • Redis Caching & Job Queue                            │
│ • Firebase Admin SDK                                   │
│ • Stripe Payment Integration                           │
└─────────────────────────────────────────────────────────┘
```

### AI & Processing
```
┌─────────────────────────────────────────────────────────┐
│                 AI Processing Pipeline                 │
├─────────────────────────────────────────────────────────┤
│ • Gemini AI (Scene Analysis)                           │
│ • Veo 3 (3D Generation)                                │
│ • Banana.dev (GPU Processing)                          │
│ • FFmpeg (Video Processing)                            │
│ • OpenCV (Computer Vision)                             │
└─────────────────────────────────────────────────────────┘
```

### Infrastructure
```
┌─────────────────────────────────────────────────────────┐
│                Cloud Infrastructure                     │
├─────────────────────────────────────────────────────────┤
│ • Google Cloud Platform                                │
│ • Docker Containerization                              │
│ • GitHub Actions CI/CD                                 │
│ • Render Cloud Hosting                                 │
│ • GitHub Pages (Documentation)                         │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
rapid-video/
├── 📁 frontend/                 # Flutter Web Application
│   ├── 📁 lib/
│   │   ├── 📁 core/             # Core utilities and constants
│   │   ├── 📁 models/           # Data models
│   │   ├── 📁 providers/        # State management
│   │   ├── 📁 screens/          # UI screens
│   │   ├── 📁 services/         # API and Firebase services
│   │   ├── 📁 theme/            # App theming
│   │   ├── 📁 utils/            # Helper utilities
│   │   ├── 📁 widgets/          # Reusable UI components
│   │   └── 📄 main.dart         # App entry point
│   ├── 📁 web/                  # Web-specific files
│   ├── 📄 pubspec.yaml          # Flutter dependencies
│   └── 📄 pubspec.lock          # Dependency lock file
├── 📁 backend/                  # FastAPI Backend
│   ├── 📁 api/                  # API endpoints
│   │   ├── 📄 ai_conversion.py  # AI processing endpoints
│   │   ├── 📄 upload.py         # File upload handling
│   │   ├── 📄 payment.py        # Payment processing
│   │   └── 📄 scene_split.py    # Video processing
│   ├── 📁 models/               # Database models
│   ├── 📁 services/             # Business logic services
│   ├── 📄 main.py               # FastAPI application
│   ├── 📄 config.py             # Configuration settings
│   ├── 📄 requirements.txt      # Python dependencies
│   └── 📄 Dockerfile            # Container configuration
├── 📁 docs/                     # Documentation website
│   └── 📄 index.html            # GitHub Pages site
├── 📁 .github/                  # GitHub workflows
│   └── 📁 workflows/
│       └── 📄 deploy.yml        # CI/CD pipeline
├── 📄 render.yaml               # Render deployment config
├── 📄 README.md                 # Project documentation
├── 📄 PITCH_DECK.md             # Business pitch deck
└── 📄 PROJECT_STATUS_REPORT.md  # Development status
```

## 🚀 Quick Start

### Prerequisites

- **Flutter SDK** (3.0+)
- **Python** (3.9+)
- **Node.js** (16+)
- **Docker** (optional)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/shankarelavarasan/rapidmixer-1.0.git
cd rapidmixer-1.0
```

### 2. Frontend Setup

```bash
cd frontend
flutter pub get
flutter run -d web-server --web-port 3000
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure environment variables
uvicorn main:app --reload --port 8000
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Installation

### Development Environment

#### Frontend (Flutter Web)

```bash
# Install Flutter dependencies
cd frontend
flutter pub get

# Run in development mode
flutter run -d web-server --web-port 3000

# Build for production
flutter build web --release
```

#### Backend (FastAPI)

```bash
# Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8000
```

### Production Deployment

#### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t rapid-video-backend ./backend
docker build -t rapid-video-frontend ./frontend
```

#### Manual Deployment

```bash
# Backend deployment
cd backend
pip install -r requirements.txt
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# Frontend deployment
cd frontend
flutter build web --release
# Deploy build/web/ to your hosting provider
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/rapidvideo
REDIS_URL=redis://localhost:6379

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# AI Services
GEMINI_API_KEY=your-gemini-api-key
VEO3_API_KEY=your-veo3-api-key
BANANA_API_KEY=your-banana-api-key

# Payment
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Storage
GCS_BUCKET_NAME=your-gcs-bucket
GCS_CREDENTIALS_PATH=path/to/credentials.json

# Security
JWT_SECRET_KEY=your-jwt-secret
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Firebase Configuration

1. Create a Firebase project
2. Enable Authentication and Firestore
3. Download service account key
4. Configure environment variables

### Payment Setup

1. Create Stripe account
2. Get API keys from dashboard
3. Configure webhook endpoints
4. Set up payment methods

## 💻 Development

### Code Style

```bash
# Flutter formatting
cd frontend
dart format .
flutter analyze

# Python formatting
cd backend
black .
flake8 .
mypy .
```

### Testing

```bash
# Frontend tests
cd frontend
flutter test

# Backend tests
cd backend
pytest
pytest --cov=. --cov-report=html
```

### Database Migrations

```bash
# Create migration
cd backend
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

## 🚀 Deployment

### GitHub Pages (Documentation)

The documentation site is automatically deployed to GitHub Pages:

- **URL**: https://shankarelavarasan.github.io/Rapid-video-maker/
- **Source**: `docs/index.html`
- **Trigger**: Push to main branch

### Render (Backend)

```yaml
# render.yaml
services:
  - type: web
    name: rapid-video-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: rapid-video-db
          property: connectionString
```

### Vercel/Netlify (Frontend)

```bash
# Build command
flutter build web --release

# Publish directory
build/web
```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /auth/login
POST /auth/register
POST /auth/refresh
DELETE /auth/logout
```

### Video Processing Endpoints

```http
POST /api/upload          # Upload video file
GET /api/jobs/{job_id}    # Get job status
POST /api/process         # Start AI processing
GET /api/download/{id}    # Download result
```

### Payment Endpoints

```http
POST /api/payment/create-intent
POST /api/payment/webhook
GET /api/payment/history
```

### Interactive API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Guidelines

- Follow existing code style
- Write comprehensive tests
- Update documentation
- Use meaningful commit messages

### Issue Reporting

Please use GitHub Issues for:
- Bug reports
- Feature requests
- Documentation improvements
- Performance issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced scene analysis
- **Veo 3** for 3D generation capabilities
- **Banana.dev** for GPU processing infrastructure
- **Flutter Team** for the amazing web framework
- **FastAPI** for the high-performance backend framework

## 📞 Support

- **Documentation**: [GitHub Pages](https://shankarelavarasan.github.io/Rapid-video-maker/)
- **Issues**: [GitHub Issues](https://github.com/shankarelavarasan/rapidmixer-1.0/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shankarelavarasan/rapidmixer-1.0/discussions)

---

<div align="center">
  <p><strong>Built with ❤️ and AI</strong></p>
  <p>
    <a href="https://shankarelavarasan.github.io/Rapid-video-maker/">🌐 Live Demo</a> |
    <a href="./PITCH_DECK.md">📊 Pitch Deck</a> |
    <a href="./PROJECT_STATUS_REPORT.md">📋 Status Report</a>
  </p>
</div>

> Transform your videos into stunning 3D animations with AI

[![Deploy to GitHub Pages](https://github.com/your-username/rapid-video/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/rapid-video/actions/workflows/deploy.yml)
[![Flutter](https://img.shields.io/badge/Flutter-3.16.0-blue.svg)](https://flutter.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Live Demo

**Frontend:** [https://your-username.github.io/rapid-video/](https://your-username.github.io/rapid-video/)  
**Backend API:** [https://rapid-video-backend.onrender.com](https://rapid-video-backend.onrender.com)

## ✨ Features

- 🎥 **Video Upload** - Max 3 minutes, drag & drop interface
- ✂️ **Auto Scene Split** - 8 seconds per chunk using FFmpeg
- 🤖 **AI Conversion** - 2D → 3D animated scenes
- 🔊 **Auto Sound FX** - Voice sync and audio enhancement
- 🔗 **Scene Merging** - Full 3D animation output
- 💾 **One-Click Download** - MP4 format ready to share

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter Web   │───▶│   FastAPI       │───▶│  AI Pipeline    │
│  (GitHub Pages) │    │   (Render)      │    │  (Google AI)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   PostgreSQL    │    │  Cloud Storage  │
│   (PWA Ready)   │    │   (Database)    │    │   (GCS/Local)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Flutter Web** - Cross-platform UI framework
- **Provider** - State management
- **HTTP** - API communication
- **Video Player** - Media playback
- **Dropzone** - File upload interface

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Production database
- **Redis** - Caching and job queue
- **FFmpeg** - Video processing
- **MoviePy** - Python video editing

### AI Services
- **Gemini API** - Scene understanding
- **Vertex AI** - Job orchestration
- **Veo 3** - 3D scene generation
- **Banana.dev** - GPU-powered rendering

### Infrastructure
- **GitHub Pages** - Frontend hosting
- **Render** - Backend hosting
- **Google Cloud Storage** - File storage
- **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start

### Prerequisites

- **Flutter SDK** 3.16.0+
- **Python** 3.11+
- **Node.js** 18+ (for web tools)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/shankarelavarasan/rapidmixer-1.0.git
cd rapidmixer-1.0
```

### 2. Frontend Setup

```bash
cd frontend

# Install Flutter dependencies
flutter pub get

# Enable web support
flutter config --enable-web

# Run development server
flutter run -d chrome
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
# nano .env

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Environment Variables

Create `backend/.env` file:

```env
# Application
APP_NAME="Rapid Video API"
APP_VERSION="1.0.0"
ENVIRONMENT="development"
DEBUG=true

# Server
HOST="0.0.0.0"
PORT=8000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rapidvideo"

# Redis
REDIS_URL="redis://localhost:6379/0"

# Google Cloud
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# AI APIs
GEMINI_API_KEY="your-gemini-api-key"
VERTEX_AI_PROJECT="your-vertex-project"
VEO_3_API_KEY="your-veo-3-key"
BANANA_API_KEY="your-banana-key"

# Storage
STORAGE_BUCKET="your-gcs-bucket"
UPLOAD_DIR="uploads"
OUTPUT_DIR="outputs"
```

## 📦 Deployment

### Frontend (GitHub Pages)

1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Update workflow** in `.github/workflows/deploy.yml`:
   ```yaml
   flutter build web --release --web-renderer canvaskit --base-href "/your-repo-name/"
   ```
4. **Push to main branch** - Auto-deployment will trigger

### Backend (Render)

1. **Create Render account** at [render.com](https://render.com)
2. **Connect GitHub repository**
3. **Deploy using** `render.yaml` configuration
4. **Set environment variables** in Render dashboard
5. **Update frontend** API URL in `web/index.html`

### Manual Deployment

#### Frontend Build
```bash
cd frontend
flutter build web --release --web-renderer canvaskit
# Deploy build/web/ to your hosting provider
```

#### Backend Build
```bash
cd backend
docker build -t rapid-video-backend .
docker run -p 8000:8000 rapid-video-backend
```

## Tech Stack
- **Frontend**: Flutter Web
- **Backend**: FastAPI (Python)
- **AI Services**: Gemini API, Vertex AI, Veo 3
- **Storage**: Google Cloud Storage
- **Deployment**: GitHub Pages (Frontend), Render (Backend)

## Project Structure
```
rapid-video/
├── frontend/          # Flutter web app
├── backend/           # FastAPI server
├── docs/             # Documentation
└── deploy/           # Deployment configs
```

## Quick Start

### Frontend (Flutter Web)
```bash
cd frontend
flutter pub get
flutter run -d chrome
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Deployment
- Frontend: GitHub Pages
- Backend: Render
- Storage: Google Cloud Storage

## Development Roadmap
- Week 1: Frontend setup (upload, preview)
- Week 2: Scene split + Gemini integration
- Week 3: Veo 3 + 3D generation
- Week 4: Merge + audio sync + download

---
*Made with Google AI* 🚀