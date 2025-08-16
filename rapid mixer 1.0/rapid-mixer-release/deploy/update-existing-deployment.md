# Update Existing Deployment Guide

## Current Deployment Status
- **Frontend**: https://shankarelavarasan.github.io/rapidmixer-1.0/
- **Backend**: https://rapid-mixer-2-0-1.onrender.com

## Integration Steps

### 1. Backend Updates (Render Deployment)

#### Update Environment Variables on Render:
```env
# Existing
PORT=10000
NODE_ENV=production

# New Premium Features
JWT_SECRET=your-super-secure-jwt-secret-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLOUD_STORAGE_PROVIDER=local
MIXPANEL_TOKEN=your_mixpanel_token
GA_PROPERTY_ID=your_ga_property_id

# Database
DATABASE_URL=./database.db

# CORS
ALLOWED_ORIGINS=https://shankarelavarasan.github.io,https://rapid-mixer-2-0-1.onrender.com
```

#### Deploy Backend Updates:
1. Copy all new backend files to your existing repository
2. Update package.json with new dependencies
3. Push to GitHub (Render will auto-deploy)

### 2. Frontend Updates (GitHub Pages)

#### Update API Configuration:
Update `lib/core/app_config.dart`:
```dart
static const String apiBaseUrl = 'https://rapid-mixer-2-0-1.onrender.com';
```

#### Build and Deploy:
```bash
cd frontend
flutter build web --release --base-href "/rapidmixer-1.0/"
# Copy build/web/* to your GitHub Pages repository
```

### 3. Testing Checklist

#### Backend API Tests:
- [ ] Health check: https://rapid-mixer-2-0-1.onrender.com/health
- [ ] Audio upload: POST /api/audio/upload
- [ ] User registration: POST /api/auth/register
- [ ] Subscription plans: GET /api/subscription/plans

#### Frontend Tests:
- [ ] App loads: https://shankarelavarasan.github.io/rapidmixer-1.0/
- [ ] Audio upload works
- [ ] User registration works
- [ ] Premium features show upgrade prompts

#### Integration Tests:
- [ ] Frontend connects to backend
- [ ] CORS configured correctly
- [ ] Authentication flow works
- [ ] File upload/processing works