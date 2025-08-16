#!/usr/bin/env python3
"""
Rapid Mixer Backend Server - Python Wrapper for Frontend Repository
This wrapper allows Render to start the Node.js backend from the frontend repo.
"""

import subprocess
import sys
import os
import signal
import time

def signal_handler(sig, frame):
    print('\n🛑 Shutting down Rapid Mixer Backend...')
    sys.exit(0)

def main():
    print("🎵 Rapid Mixer Backend - Python Wrapper (Frontend Repo)")
    print("🚀 Starting Node.js server from frontend repository...")
    
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Set environment variables
    os.environ.setdefault('NODE_ENV', 'production')
    os.environ.setdefault('PORT', '10000')
    os.environ.setdefault('JWT_SECRET', 'rapid-mixer-super-secure-jwt-secret-2024')
    os.environ.setdefault('ALLOWED_ORIGINS', 'https://shankarelavarasan.github.io')
    
    print("🔧 Environment variables set")
    print(f"   NODE_ENV: {os.environ.get('NODE_ENV')}")
    print(f"   PORT: {os.environ.get('PORT')}")
    
    # Create necessary directories
    directories = ['uploads', 'uploads/stems', 'uploads/processed', 'uploads/exports', 'data']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    print("📁 Created necessary directories")
    
    # Since this is running from frontend repo, we need to simulate backend
    print("⚠️  Running from frontend repository - creating minimal backend...")
    
    # Create a minimal Express server for the frontend repo
    minimal_server = '''
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS
app.use(cors({
    origin: ['https://shankarelavarasan.github.io', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Rapid Mixer Backend is running (Frontend Repo)',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Sample tracks endpoint
app.get('/api/audio/samples', (req, res) => {
    const sampleTracks = [
        {
            "id": 1,
            "title": "Upbeat Pop Demo",
            "artist": "Demo Artist",
            "duration": "3:15",
            "bpm": 128,
            "genre": "Pop",
            "size": "7.5 MB",
            "format": "MP3"
        },
        {
            "id": 2,
            "title": "Chill Hip-Hop",
            "artist": "Sample Beats", 
            "duration": "2:58",
            "bpm": 95,
            "genre": "Hip-Hop",
            "size": "6.8 MB",
            "format": "MP3"
        }
    ];
    res.json(sampleTracks);
});

// Recent files endpoint
app.get('/api/audio/recent', (req, res) => {
    res.json([]);
});

// Audio status endpoint
app.get('/api/audio/status/:id', (req, res) => {
    res.json({
        processId: req.params.id,
        status: 'processing',
        progress: 25,
        stems: {}
    });
});

// Audio upload endpoint (placeholder)
app.post('/api/audio/upload', (req, res) => {
    res.json({
        success: true,
        message: 'Upload endpoint ready - full backend needed for processing'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 Rapid Mixer Backend running on port ${PORT}`);
    console.log(`🚀 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Frontend repo deployment successful!`);
});
'''
    
    # Write minimal server to file
    with open('minimal-server.js', 'w') as f:
        f.write(minimal_server)
    
    # Create package.json if it doesn't exist
    if not os.path.exists('package.json'):
        package_json = '''{
  "name": "rapid-mixer-frontend-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}'''
        with open('package.json', 'w') as f:
            f.write(package_json)
    
    try:
        # Install dependencies
        print("📦 Installing dependencies...")
        subprocess.run(['npm', 'install'], check=True)
        
        # Start the minimal server
        print("🚀 Starting minimal backend server...")
        subprocess.run(['node', 'minimal-server.js'], check=True)
        
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("💡 This is a minimal backend for frontend repo deployment")
        sys.exit(1)

if __name__ == "__main__":
    main()