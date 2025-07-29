import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiRoutes from './routes/gemini.js';
import githubRoutes from './routes/github.js';
import processFileRoutes from './server/api/process-file.js';
import exportRoutes from './server/api/export.js';
import cors from 'cors';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import logger from './config/logger.js';
import {
  errorHandler,
  FileProcessingError,
} from './middleware/errorHandler.js';
import { uploadSingleFile, uploadMultipleFiles } from './middleware/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and Socket.IO instance for real-time progress updates
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:10000', 'https://shankarelavarasan.github.io'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', socket => {
  logger.info('Client connected: %s', socket.id);

  socket.on('disconnect', () => {
    logger.info('Client disconnected: %s', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:10000', 'https://shankarelavarasan.github.io'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from the 'docs' directory
app.use(express.static('docs'));

/**
 * @route GET /api/templates
 * @description Get a list of available template files.
 * @access Public
 */
app.get('/api/templates', async (req, res, next) => {
  try {
    const templatesDir = path.join(__dirname, 'docs', 'templates');
    const files = await fs.promises.readdir(templatesDir);
    res.json(files);
  } catch (err) {
    next(new FileProcessingError('Error reading templates directory'));
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// API routes
app.use('/api', geminiRoutes);
app.use('/api/github', githubRoutes);
app.use('/api', processFileRoutes);
app.use('/api', exportRoutes);

// Error handling middleware should be the last middleware
app.use(errorHandler);

// Start the HTTP server
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Socket.IO server running`);
});
