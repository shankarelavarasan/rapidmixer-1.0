import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Creating Deployment Package...');

// Create deployment folders
const deployDir = path.join(__dirname, 'deployment-package');
const backendDeployDir = path.join(deployDir, 'backend-files');
const frontendDeployDir = path.join(deployDir, 'frontend-files');

// Create directories
[deployDir, backendDeployDir, frontendDeployDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Backend files to copy
const backendFiles = [
    'backend/package.json',
    'backend/server.js',
    'backend/config/config.js',
    'backend/models/User.js',
    'backend/middleware/auth.js',
    'backend/routes/api/auth.js',
    'backend/routes/api/subscription.js',
    'backend/services/analyticsService.js',
    'backend/services/cloudStorage.js',
    'backend/services/collaborationService.js',
    'backend/services/paymentService.js',
    'backend/process_audio.py'
];

// Frontend files to copy
const frontendFiles = [
    'frontend/lib/core/app_config.dart',
    'frontend/lib/core/api_service.dart',
    'frontend/lib/services/subscription_service.dart',
    'frontend/lib/theme/app_colors.dart',
    'frontend/lib/widgets/premium_badge_widget.dart',
    'frontend/lib/widgets/advanced_mixer_console.dart'
];

// Copy backend files
console.log('📁 Copying backend files...');
backendFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const fileName = path.basename(file);
    const destPath = path.join(backendDeployDir, fileName);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✅ ${fileName}`);
    } else {
        console.log(`  ❌ ${fileName} (not found)`);
    }
});

// Copy frontend files
console.log('📱 Copying frontend files...');
frontendFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const fileName = path.basename(file);
    const destPath = path.join(frontendDeployDir, fileName);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✅ ${fileName}`);
    } else {
        console.log(`  ❌ ${fileName} (not found)`);
    }
});

// Create README for deployment package
const readmeContent = `# 🚀 Rapid Mixer Pro - Deployment Package

## 📁 Backend Files (Upload to your backend repository)
${backendFiles.map(f => `- ${path.basename(f)}`).join('\n')}

## 📱 Frontend Files (Upload to your frontend repository)  
${frontendFiles.map(f => `- ${path.basename(f)}`).join('\n')}

## 🔧 Environment Variables for Render
\`\`\`
JWT_SECRET=rapid-mixer-super-secure-jwt-secret-2024
ALLOWED_ORIGINS=https://shankarelavarasan.github.io,https://rapid-mixer-2-0-1.onrender.com
NODE_ENV=production
PORT=10000
\`\`\`

## 📋 Upload Instructions
1. Upload backend files to your backend GitHub repository
2. Upload frontend files to your frontend GitHub repository  
3. Add environment variables to Render dashboard
4. Push changes to trigger auto-deployment
5. Test: https://rapid-mixer-2-0-1.onrender.com/health

## ✅ Success Criteria
- Backend returns 200 OK
- Frontend loads without errors
- Premium features visible
- User authentication works
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);

console.log('\n🎉 Deployment package created!');
console.log(`📦 Location: ${deployDir}`);
console.log('\n📋 Next steps:');
console.log('1. Upload backend files to your backend repository');
console.log('2. Upload frontend files to your frontend repository');
console.log('3. Add environment variables to Render');
console.log('4. Push changes and wait for deployment');
console.log('\n🚀 Your premium platform will be live in 10 minutes!');