const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');

// Import route files
const audioRoutes = require('./routes/api/audio');
const importRoutes = require('./routes/api/import');
const authRoutes = require('./routes/api/auth');
const subscriptionRoutes = require('./routes/api/subscription');

// Import services
const AnalyticsService = require('./services/analyticsService');
const CollaborationService = require('./services/collaborationService');

const app = express();
const PORT = config.port;

// Initialize services
const analyticsService = new AnalyticsService();
const collaborationService = new CollaborationService();

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// CORS middleware
app.use(cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create necessary directories
const createDirectories = () => {
    const dirs = ['uploads', 'uploads/stems', 'uploads/processed', 'uploads/exports'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

createDirectories();

// Multer configuration for high-quality audio uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept audio files only
    const allowedTypes = /\.(mp3|wav|flac|aac|ogg|m4a)$/i;
    if (allowedTypes.test(file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/stems', express.static('uploads/stems'));
app.use('/exports', express.static('uploads/exports'));

// API Routes
app.use('/api/audio', audioRoutes);
app.use('/api/import', importRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Rapid Mixer Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Audio upload from URL endpoint (for web)
app.post('/api/audio/upload-url', express.json(), async (req, res) => {
    try {
        const { audioUrl } = req.body;
        
        if (!audioUrl) {
            return res.status(400).json({ error: 'No audio URL provided' });
        }

        console.log(`Processing audio from URL: ${audioUrl}`);
        
        // Download the audio file first
        const response = await fetch(audioUrl);
        if (!response.ok) {
            throw new Error(`Failed to download audio: ${response.statusText}`);
        }
        
        const audioBuffer = await response.arrayBuffer();
        const processId = Date.now().toString();
        const fileName = `url_audio_${processId}.wav`;
        const inputPath = `uploads/${fileName}`;
        
        // Save the downloaded audio
        fs.writeFileSync(inputPath, Buffer.from(audioBuffer));
        
        const outputDir = `uploads/stems/${processId}`;
        
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log(`Audio downloaded and saved: ${inputPath}`);
        console.log(`Output directory: ${outputDir}`);

        res.json({
            success: true,
            message: 'Audio URL processed, processing started',
            processId: processId,
            inputPath: inputPath
        });

        // Start Spleeter processing in background
        processSpleeter(inputPath, outputDir, processId);

    } catch (error) {
        console.error('URL processing error:', error);
        res.status(500).json({ error: 'Failed to process audio URL' });
    }
});

// Spleeter processing function
function processSpleeter(inputPath, outputDir, processId) {
    return new Promise((resolve, reject) => {
        console.log(`Starting Spleeter processing for process ID: ${processId}`);
        
        // Use the enhanced Python script
        const pythonProcess = spawn('python', ['process_audio.py', inputPath, outputDir, processId]);
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log(`Spleeter stdout: ${data}`);
        });
        
        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error(`Spleeter stderr: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
            console.log(`Spleeter process exited with code: ${code}`);
            if (code === 0) {
                console.log(`Spleeter processing completed successfully for process ID: ${processId}`);
                resolve({ success: true, processId, outputDir });
            } else {
                console.error(`Spleeter processing failed for process ID: ${processId}`);
                reject({ success: false, error: stderr, processId });
            }
        });
        
        pythonProcess.on('error', (error) => {
            console.error(`Spleeter process error: ${error}`);
            reject({ success: false, error: error.message, processId });
        });
    });
}

// Get processing status
app.get('/api/audio/status/:processId', (req, res) => {
    const { processId } = req.params;
    const outputDir = `uploads/stems`;
    
    // Check if stems are ready
    const stemFiles = {
        vocals: null,
        drums: null,
        bass: null,
        piano: null,
        other: null
    };
    
    try {
        // Look for stem files
        const files = fs.readdirSync(outputDir, { recursive: true });
        
        files.forEach(file => {
            const filePath = path.join(outputDir, file);
            if (fs.statSync(filePath).isFile() && file.includes(processId)) {
                if (file.includes('vocals')) stemFiles.vocals = `/stems/${file}`;
                else if (file.includes('drums')) stemFiles.drums = `/stems/${file}`;
                else if (file.includes('bass')) stemFiles.bass = `/stems/${file}`;
                else if (file.includes('piano')) stemFiles.piano = `/stems/${file}`;
                else if (file.includes('other')) stemFiles.other = `/stems/${file}`;
            }
        });
        
        const isComplete = Object.values(stemFiles).every(stem => stem !== null);
        
        res.json({
            processId,
            status: isComplete ? 'completed' : 'processing',
            progress: isComplete ? 100 : 50,
            stems: stemFiles
        });
        
    } catch (error) {
        res.json({
            processId,
            status: 'processing',
            progress: 25,
            stems: stemFiles
        });
    }
});

// Export mixed audio
app.post('/api/audio/export', express.json(), (req, res) => {
    const { stems, volumes, format = 'mp3', quality = 'high' } = req.body;
    
    if (!stems || Object.keys(stems).length === 0) {
        return res.status(400).json({ error: 'No stems provided for export' });
    }
    
    const exportId = Date.now().toString();
    const outputFile = `uploads/exports/mixed_${exportId}.${format}`;
    
    // Create FFmpeg command for mixing
    let ffmpegCmd = ['ffmpeg'];
    let inputArgs = [];
    let filterArgs = [];
    let inputIndex = 0;
    
    // Add input files
    Object.entries(stems).forEach(([stemType, stemPath]) => {
        if (stemPath && fs.existsSync(stemPath.replace('/stems/', 'uploads/stems/'))) {
            const volume = volumes[stemType] || 1.0;
            inputArgs.push('-i', stemPath.replace('/stems/', 'uploads/stems/'));
            filterArgs.push(`[${inputIndex}:0]volume=${volume}[a${inputIndex}]`);
            inputIndex++;
        }
    });
    
    if (inputIndex === 0) {
        return res.status(400).json({ error: 'No valid stem files found' });
    }
    
    // Build filter complex
    const mixFilter = filterArgs.join(';') + ';' + 
                     Array.from({length: inputIndex}, (_, i) => `[a${i}]`).join('') + 
                     `amix=inputs=${inputIndex}:duration=longest[out]`;
    
    const qualityArgs = getQualityArgs(format, quality);
    
    const fullCmd = [...inputArgs, '-filter_complex', mixFilter, '-map', '[out]', ...qualityArgs, outputFile];
    
    console.log('FFmpeg command:', 'ffmpeg', fullCmd.join(' '));
    
    const ffmpegProcess = spawn('ffmpeg', fullCmd);
    
    ffmpegProcess.on('close', (code) => {
        if (code === 0) {
            res.json({
                success: true,
                exportId,
                downloadUrl: `/exports/mixed_${exportId}.${format}`,
                format,
                quality
            });
        } else {
            res.status(500).json({ error: 'Failed to export mixed audio' });
        }
    });
    
    ffmpegProcess.on('error', (error) => {
        console.error('FFmpeg error:', error);
        res.status(500).json({ error: 'FFmpeg processing failed' });
    });
});

function getQualityArgs(format, quality) {
    switch (format.toLowerCase()) {
        case 'mp3':
            switch (quality) {
                case 'high': return ['-acodec', 'libmp3lame', '-b:a', '320k'];
                case 'medium': return ['-acodec', 'libmp3lame', '-b:a', '192k'];
                case 'low': return ['-acodec', 'libmp3lame', '-b:a', '128k'];
                default: return ['-acodec', 'libmp3lame', '-b:a', '192k'];
            }
        case 'wav':
            switch (quality) {
                case 'high': return ['-acodec', 'pcm_s24le', '-ar', '48000'];
                case 'medium': return ['-acodec', 'pcm_s16le', '-ar', '44100'];
                case 'low': return ['-acodec', 'pcm_s16le', '-ar', '22050'];
                default: return ['-acodec', 'pcm_s16le', '-ar', '44100'];
            }
        case 'flac':
            return ['-acodec', 'flac', '-compression_level', '5'];
        case 'aac':
            switch (quality) {
                case 'high': return ['-acodec', 'aac', '-b:a', '256k'];
                case 'medium': return ['-acodec', 'aac', '-b:a', '128k'];
                case 'low': return ['-acodec', 'aac', '-b:a', '96k'];
                default: return ['-acodec', 'aac', '-b:a', '128k'];
            }
        default:
            return ['-acodec', 'libmp3lame', '-b:a', '192k'];
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(error.status || 500).json({
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 Rapid Mixer Pro Backend Server running on port ${PORT}`);
    console.log(`🚀 Health check: http://localhost:${PORT}/health`);
    console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/audio/upload`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
    console.log(`💳 Subscription endpoints: http://localhost:${PORT}/api/subscription/*`);
    console.log(`🤝 WebSocket collaboration enabled`);
    console.log(`📊 Analytics tracking enabled`);
    
    // Initialize WebSocket for collaboration
    if (config.features.enableCollaboration) {
        collaborationService.initializeWebSocket(server);
        console.log(`🌐 WebSocket server initialized for collaboration`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;