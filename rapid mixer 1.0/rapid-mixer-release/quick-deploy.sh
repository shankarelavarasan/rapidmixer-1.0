#!/bin/bash

echo "🚀 Rapid Mixer Pro - Quick Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://rapid-mixer-2-0-1.onrender.com"
FRONTEND_URL="https://shankarelavarasan.github.io/rapidmixer-1.0/"

echo -e "${BLUE}📋 Deployment Checklist${NC}"
echo "========================"

# Check if backend is accessible
echo -e "${YELLOW}1. Testing backend connectivity...${NC}"
if curl -s --head "$BACKEND_URL/health" | head -n 1 | grep -q "200 OK"; then
    echo -e "${GREEN}   ✅ Backend is accessible${NC}"
else
    echo -e "${RED}   ❌ Backend is not accessible (502 error)${NC}"
    echo -e "${YELLOW}   📝 Action needed: Update backend deployment${NC}"
fi

# Check if frontend is accessible
echo -e "${YELLOW}2. Testing frontend connectivity...${NC}"
if curl -s --head "$FRONTEND_URL" | head -n 1 | grep -q "200 OK"; then
    echo -e "${GREEN}   ✅ Frontend is accessible${NC}"
else
    echo -e "${RED}   ❌ Frontend is not accessible${NC}"
fi

echo ""
echo -e "${BLUE}📦 Files Ready for Deployment${NC}"
echo "=============================="

# List essential backend files
echo -e "${YELLOW}Backend files to upload:${NC}"
echo "  ✓ backend/package.json (updated dependencies)"
echo "  ✓ backend/server.js (premium features)"
echo "  ✓ backend/config/config.js (configuration)"
echo "  ✓ backend/models/User.js (authentication)"
echo "  ✓ backend/middleware/auth.js (security)"
echo "  ✓ backend/routes/api/auth.js (auth endpoints)"
echo "  ✓ backend/routes/api/subscription.js (payments)"
echo "  ✓ backend/services/ (all premium services)"

echo ""
echo -e "${YELLOW}Frontend files to upload:${NC}"
echo "  ✓ frontend/lib/core/app_config.dart (API config)"
echo "  ✓ frontend/lib/core/api_service.dart (API layer)"
echo "  ✓ frontend/lib/theme/app_colors.dart (premium theme)"
echo "  ✓ frontend/lib/widgets/premium_badge_widget.dart"
echo "  ✓ frontend/lib/widgets/advanced_mixer_console.dart"
echo "  ✓ frontend/lib/services/subscription_service.dart"

echo ""
echo -e "${BLUE}🔧 Environment Variables for Render${NC}"
echo "===================================="
echo "Add these to your Render dashboard:"
echo ""
echo "JWT_SECRET=rapid-mixer-super-secure-jwt-secret-2024"
echo "ALLOWED_ORIGINS=https://shankarelavarasan.github.io,https://rapid-mixer-2-0-1.onrender.com"
echo "NODE_ENV=production"
echo "PORT=10000"
echo "ENABLE_PREMIUM=true"
echo "ENABLE_COLLABORATION=true"
echo "ENABLE_ANALYTICS=true"

echo ""
echo -e "${BLUE}📋 Deployment Steps${NC}"
echo "==================="
echo "1. 📤 Upload backend files to your GitHub repository"
echo "2. 🔧 Add environment variables to Render dashboard"
echo "3. 🚀 Trigger manual deploy on Render (or push to auto-deploy)"
echo "4. ⏳ Wait for deployment (5-10 minutes)"
echo "5. 🧪 Test backend: curl $BACKEND_URL/health"
echo "6. 📱 Update frontend API configuration"
echo "7. 🏗️  Build frontend: flutter build web --release"
echo "8. 📤 Deploy frontend to GitHub Pages"
echo "9. ✅ Test full integration"

echo ""
echo -e "${BLUE}🎯 Expected Results${NC}"
echo "=================="
echo "✅ Backend health check returns 200 OK"
echo "✅ Frontend loads without errors"
echo "✅ Audio upload/processing works"
echo "✅ User authentication works"
echo "✅ Premium features show upgrade prompts"
echo "✅ Real-time collaboration enabled"

echo ""
echo -e "${GREEN}🎉 Ready to deploy your premium music platform!${NC}"
echo ""
echo -e "${YELLOW}💡 Pro tip: Test locally first with 'npm run dev' in backend${NC}"
echo -e "${YELLOW}💡 Pro tip: Use 'flutter run -d chrome' to test frontend${NC}"

echo ""
echo "📞 Need help? Check DEPLOYMENT_INSTRUCTIONS.md for detailed steps"