# Rapid Mixer Deployment Guide

Complete deployment guide for the Rapid Mixer audio production application.

## Quick Deploy Options

### 1. Local Development Setup

**Backend Setup:**
```bash
cd backend
npm install
pip install -r requirements.txt
cp .env.example .env
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
flutter pub get
flutter run -d chrome
```

### 2. Docker Deployment (Recommended)

```bash
cd deploy
docker-compose up -d
```

Access the app at `http://localhost`

### 3. Cloud Deployment

## Backend Deployment Options

### Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `cd backend && vercel --prod`
3. Configure environment variables in Vercel dashboard

### Render (Full Server)
1. Connect GitHub repository to Render
2. Use `render.yaml` configuration
3. Automatic deployments on git push

### Railway
1. Connect GitHub repository
2. Configure environment variables
3. Automatic deployments

### DigitalOcean App Platform
1. Create new app from GitHub
2. Configure build and run commands
3. Set environment variables

## Frontend Deployment Options

### Web Deployment

#### Netlify
```bash
cd frontend
flutter build web --release
# Drag build/web folder to Netlify deploy
```

#### Vercel
```bash
cd frontend
flutter build web --release
vercel --prod
```

#### Firebase Hosting
```bash
cd frontend
flutter build web --release
firebase init hosting
firebase deploy
```

#### GitHub Pages
```bash
cd frontend
flutter build web --release --base-href "/rapid-mixer/"
# Push build/web contents to gh-pages branch
```

### Mobile App Deployment

#### Android (Google Play Store)
1. **Build App Bundle:**
   ```bash
   cd frontend
   flutter build appbundle --release
   ```

2. **Upload to Play Console:**
   - Create developer account
   - Upload `build/app/outputs/bundle/release/app-release.aab`
   - Configure store listing
   - Submit for review

#### iOS (Apple App Store)
1. **Build iOS App:**
   ```bash
   cd frontend
   flutter build ios --release
   ```

2. **Archive in Xcode:**
   - Open `ios/Runner.xcworkspace`
   - Product → Archive
   - Upload to App Store Connect

## Environment Configuration

### Backend Environment Variables

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=./database.db

# File Upload
MAX_FILE_SIZE=100MB
UPLOAD_DIR=./uploads

# Audio Processing
SPLEETER_MODEL=5stems-16kHz
AUDIO_QUALITY=high

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Security
JWT_SECRET=your-secure-jwt-secret
API_KEY=your-api-key
```

### Frontend Configuration

Update API endpoint in `lib/services/audio_service.dart`:
```dart
static const String baseUrl = 'https://your-backend-url.com';
```

## Production Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] File upload directories created
- [ ] Python dependencies installed
- [ ] FFmpeg available in PATH
- [ ] CORS origins configured
- [ ] SSL certificate configured
- [ ] Health check endpoint working
- [ ] Error logging configured
- [ ] Rate limiting enabled

### Frontend
- [ ] API endpoint updated
- [ ] App icons configured
- [ ] Splash screen configured
- [ ] App permissions configured
- [ ] Store listings prepared
- [ ] Privacy policy created
- [ ] Terms of service created

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /health`
- Frontend: Check app loading and functionality

### Logging
- Backend: Check server logs for errors
- Frontend: Monitor crash reports

### Performance
- Monitor API response times
- Check audio processing performance
- Monitor storage usage

### Updates
- Regular dependency updates
- Security patches
- Feature releases

## Scaling Considerations

### Backend Scaling
- **Horizontal Scaling**: Multiple server instances
- **Load Balancing**: Distribute requests
- **Database Scaling**: Consider PostgreSQL for production
- **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage)
- **Audio Processing**: Dedicated processing servers

### Frontend Scaling
- **CDN**: Use CDN for static assets
- **Caching**: Implement proper caching strategies
- **Progressive Loading**: Lazy load components
- **Offline Support**: Service worker for offline functionality

## Security Best Practices

### Backend Security
- Input validation and sanitization
- Rate limiting on API endpoints
- File type validation for uploads
- Secure file storage with proper permissions
- Regular security updates

### Frontend Security
- Secure API communication (HTTPS)
- Input validation on client side
- Secure storage of sensitive data
- Content Security Policy (CSP)

## Troubleshooting

### Common Deployment Issues

1. **Backend not starting:**
   - Check Node.js version compatibility
   - Verify Python dependencies
   - Check port availability
   - Review environment variables

2. **Frontend build failures:**
   - Run `flutter clean && flutter pub get`
   - Check Flutter SDK version
   - Verify platform-specific configurations

3. **Audio processing failures:**
   - Verify Spleeter installation
   - Check FFmpeg availability
   - Monitor memory usage
   - Check file permissions

4. **CORS errors:**
   - Configure allowed origins
   - Check request headers
   - Verify API endpoints

## Support

For deployment issues:
1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Test with minimal configuration first
4. Check platform-specific documentation

## Cost Estimation

### Free Tier Options
- **Backend**: Render (750 hours/month), Railway (500 hours/month)
- **Frontend**: Netlify, Vercel, Firebase Hosting (generous free tiers)
- **Database**: SQLite (included), PostgreSQL free tiers

### Paid Options
- **Backend**: $7-25/month for basic VPS
- **Frontend**: $0-10/month for hosting
- **Storage**: $0.02-0.05/GB/month for cloud storage
- **CDN**: $0.08-0.12/GB for data transfer

Total estimated cost: $10-50/month depending on usage and features.