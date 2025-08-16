require('dotenv').config();

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database Configuration
    database: {
        url: process.env.DATABASE_URL || './database.db'
    },
    
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'rapid-mixer-default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    
    // CORS Configuration
    cors: {
        origins: process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            [
                'http://localhost:3000',
                'https://shankarelavarasan.github.io',
                'https://rapid-mixer-2-0-1.onrender.com'
            ]
    },
    
    // File Upload Configuration
    upload: {
        maxFileSize: process.env.MAX_FILE_SIZE || '100MB',
        allowedTypes: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
        uploadDir: process.env.UPLOAD_DIR || './uploads'
    },
    
    // Audio Processing Configuration
    audio: {
        spleeterModel: process.env.SPLEETER_MODEL || '5stems-16kHz',
        quality: process.env.AUDIO_QUALITY || 'high',
        tempDir: process.env.TEMP_DIR || './temp'
    },
    
    // Payment Configuration (Stripe)
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    },
    
    // Cloud Storage Configuration
    cloudStorage: {
        provider: process.env.CLOUD_STORAGE_PROVIDER || 'local',
        aws: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1',
            bucket: process.env.AWS_S3_BUCKET
        },
        gcp: {
            projectId: process.env.GCP_PROJECT_ID,
            keyFile: process.env.GCP_KEY_FILE,
            bucket: process.env.GCP_STORAGE_BUCKET
        },
        local: {
            path: process.env.LOCAL_STORAGE_PATH || './uploads'
        }
    },
    
    // Analytics Configuration
    analytics: {
        mixpanel: {
            token: process.env.MIXPANEL_TOKEN
        },
        googleAnalytics: {
            propertyId: process.env.GA_PROPERTY_ID,
            credentials: process.env.GA_CREDENTIALS
        }
    },
    
    // Email Configuration
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'noreply@rapidmixer.pro'
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
        premiumMultiplier: parseInt(process.env.RATE_LIMIT_PREMIUM_MULTIPLIER) || 5
    },
    
    // WebSocket Configuration
    websocket: {
        port: process.env.WS_PORT || 3002,
        path: process.env.WS_PATH || '/ws'
    },
    
    // Security Configuration
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        sessionSecret: process.env.SESSION_SECRET || 'rapid-mixer-session-secret',
        csrfSecret: process.env.CSRF_SECRET || 'rapid-mixer-csrf-secret'
    },
    
    // Feature Flags
    features: {
        enablePremium: process.env.ENABLE_PREMIUM !== 'false',
        enableCollaboration: process.env.ENABLE_COLLABORATION !== 'false',
        enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
        enableCloudStorage: process.env.ENABLE_CLOUD_STORAGE !== 'false'
    },
    
    // Subscription Plans
    subscriptionPlans: {
        free: {
            maxProjects: parseInt(process.env.FREE_MAX_PROJECTS) || 3,
            maxExportsPerDay: parseInt(process.env.FREE_MAX_EXPORTS_PER_DAY) || 5,
            maxStorageBytes: parseInt(process.env.FREE_MAX_STORAGE_BYTES) || 100 * 1024 * 1024 // 100MB
        },
        premium: {
            maxProjects: parseInt(process.env.PREMIUM_MAX_PROJECTS) || 100,
            maxExportsPerDay: parseInt(process.env.PREMIUM_MAX_EXPORTS_PER_DAY) || 100,
            maxStorageBytes: parseInt(process.env.PREMIUM_MAX_STORAGE_BYTES) || 10 * 1024 * 1024 * 1024 // 10GB
        }
    }
};