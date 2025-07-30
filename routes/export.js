import express from 'express';
import path from 'path';
import fs from 'fs';
import { generateExcel, generateFormattedExcel } from '../services/outputFormatter.js';

const router = express.Router();

/**
 * @route POST /api/export
 * @description Generate and export Excel file
 * @access Public
 */
router.post('/export', async (req, res) => {
    try {
        const { data, filename = 'processed_data.xlsx', format = 'json' } = req.body;
        
        if (!data) {
            return res.status(400).json({ error: 'No data provided for export' });
        }

        const result = generateExcel(data, filename);
        
        res.json({
            success: true,
            downloadUrl: `/api/export/download/${result.filename}`,
            filename: result.filename,
            filePath: result.filePath
        });

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/export/formatted
 * @description Generate formatted Excel using template
 * @access Public
 */
router.post('/export/formatted', async (req, res) => {
    try {
        const { data, templatePath, filename = 'formatted_output.xlsx' } = req.body;
        
        if (!data || !templatePath) {
            return res.status(400).json({ error: 'Data and template path are required' });
        }

        const result = generateFormattedExcel(data, templatePath, filename);
        
        res.json({
            success: true,
            downloadUrl: `/api/export/download/${result.filename}`,
            filename: result.filename,
            filePath: result.filePath
        });

    } catch (error) {
        console.error('Formatted export error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/export/download/:filename
 * @description Download exported file
 * @access Public
 */
router.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'output', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/export/files
 * @description List all exported files
 * @access Public
 */
router.get('/files', async (req, res) => {
    try {
        const outputDir = path.join(process.cwd(), 'output');
        
        if (!fs.existsSync(outputDir)) {
            return res.json({ files: [] });
        }

        const files = fs.readdirSync(outputDir)
            .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
            .map(file => {
                const filePath = path.join(outputDir, file);
                const stats = fs.statSync(filePath);
                
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    downloadUrl: `/api/export/download/${file}`
                };
            })
            .sort((a, b) => b.created - a.created);

        res.json({ files });

    } catch (error) {
        console.error('Export files listing error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route DELETE /api/export/:filename
 * @description Delete exported file
 * @access Public
 */
router.delete('/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'output', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted successfully' });

    } catch (error) {
        console.error('Export file deletion error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/export/validate/:filename
 * @description Validate exported file
 * @access Public
 */
router.get('/validate/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'output', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const stats = fs.statSync(filePath);
        
        res.json({
            filename,
            exists: true,
            size: stats.size,
            created: stats.birthtime,
            valid: stats.size > 0
        });

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;