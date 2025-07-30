import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { processFile } from '../services/fileProcessor.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 512 * 1024 * 1024 }, // 512MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            '.pdf', '.docx', '.xlsx', '.csv', '.json', '.txt',
            '.doc', '.xls', '.png', '.jpg', '.jpeg'
        ];
        
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, XLSX, CSV, JSON, TXT, and image files are allowed.'));
        }
    }
});

/**
 * @route POST /api/upload
 * @description Upload and process a single file
 * @access Public
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const processedData = await processFile(filePath);

        res.json({
            success: true,
            filename: req.file.originalname,
            processedData: processedData,
            fileId: req.file.filename
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/upload-multiple
 * @description Upload and process multiple files
 * @access Public
 */
router.post('/upload-multiple', upload.array('files', 100), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = [];
        const errors = [];

        for (const file of req.files) {
            try {
                const processedData = await processFile(file.path);
                results.push({
                    filename: file.originalname,
                    fileId: file.filename,
                    processedData: processedData,
                    success: true
                });
            } catch (error) {
                errors.push({
                    filename: file.originalname,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            results: results,
            errors: errors,
            totalFiles: req.files.length,
            successfulFiles: results.length,
            failedFiles: errors.length
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/upload-folder
 * @description Upload and process an entire folder
 * @access Public
 */
router.post('/upload-folder', upload.array('files', 1000), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const processingId = Date.now().toString();
        const io = req.app.get('io');

        // Emit progress updates
        io.emit('processing-started', { processingId, totalFiles: req.files.length });

        const results = [];
        const errors = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            
            try {
                const processedData = await processFile(file.path);
                results.push({
                    filename: file.originalname,
                    fileId: file.filename,
                    processedData: processedData,
                    success: true
                });
                
                // Emit progress
                io.emit('processing-progress', {
                    processingId,
                    currentFile: i + 1,
                    totalFiles: req.files.length,
                    filename: file.originalname
                });
                
            } catch (error) {
                errors.push({
                    filename: file.originalname,
                    error: error.message
                });
            }
        }

        io.emit('processing-completed', {
            processingId,
            results: results,
            errors: errors
        });

        res.json({
            success: true,
            processingId,
            results: results,
            errors: errors,
            totalFiles: req.files.length,
            successfulFiles: results.length,
            failedFiles: errors.length
        });

    } catch (error) {
        console.error('Folder upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/files
 * @description Get list of uploaded files
 * @access Public
 */
router.get('/files', async (req, res) => {
    try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        
        if (!fs.existsSync(uploadsDir)) {
            return res.json({ files: [] });
        }

        const files = fs.readdirSync(uploadsDir)
            .filter(file => !file.startsWith('.'))
            .map(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    extension: path.extname(file).toLowerCase()
                };
            });

        res.json({ files });

    } catch (error) {
        console.error('File list error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route DELETE /api/files/:filename
 * @description Delete a specific file
 * @access Public
 */
router.delete('/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'uploads', filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }

    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;