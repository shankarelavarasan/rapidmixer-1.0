import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as XLSX from 'xlsx';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { processFile } from '../services/fileProcessor.js';
import { formatOutput } from '../services/outputFormatter.js';
import { v4 as uuidv4 } from 'uuid';

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
        const allowedTypes = ['.pdf', '.docx', '.xlsx', '.csv', '.json', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    }
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

// Processing states
const processingStates = new Map();

// Main processing endpoint
router.post('/process-documents', upload.fields([
    { name: 'documents', maxCount: 100 },
    { name: 'template', maxCount: 1 }
]), async (req, res) => {
    try {
        const processingId = uuidv4();
        const prompt = req.body.prompt;
        const documents = req.files.documents || [];
        const template = req.files.template?.[0];

        if (!prompt || documents.length === 0 || !template) {
            return res.status(400).json({ 
                error: 'Missing required fields: prompt, documents, or template' 
            });
        }

        // Initialize processing state
        processingStates.set(processingId, {
            status: 'processing',
            progress: 0,
            message: 'Starting document processing...',
            totalFiles: documents.length,
            processedFiles: 0,
            results: null,
            missingFields: []
        });

        // Start processing in background
        processDocuments(processingId, documents, template, prompt, req.io);

        res.json({ 
            processingId: processingId,
            status: 'processing',
            message: 'Processing started' 
        });

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get processing status
router.get('/status/:processingId', (req, res) => {
    const processingId = req.params.processingId;
    const state = processingStates.get(processingId);
    
    if (!state) {
        return res.status(404).json({ error: 'Processing ID not found' });
    }
    
    res.json(state);
});

// Approve missing field
router.post('/approve-field', (req, res) => {
    const { processingId, row, column, value } = req.body;
    const state = processingStates.get(processingId);
    
    if (!state) {
        return res.status(404).json({ error: 'Processing ID not found' });
    }
    
    // Update the missing field with approval
    const missingField = state.missingFields.find(f => f.row === row && f.column === column);
    if (missingField) {
        missingField.approvedValue = value;
        missingField.status = 'approved';
    }
    
    res.json({ success: true });
});

// Approve results
router.post('/approve-results', (req, res) => {
    const { processingId } = req.body;
    const state = processingStates.get(processingId);
    
    if (!state) {
        return res.status(404).json({ error: 'Processing ID not found' });
    }
    
    state.status = 'approved';
    state.message = 'Results approved, generating final Excel...';
    
    // Generate final Excel
    generateFinalExcel(processingId);
    
    res.json({ success: true });
});

// Download results
router.post('/download-results', (req, res) => {
    const { processingId } = req.body;
    const state = processingStates.get(processingId);
    
    if (!state || !state.finalFile) {
        return res.status(404).json({ error: 'Results not ready' });
    }
    
    const filePath = state.finalFile;
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        
        res.json({ response: text });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get templates
router.get('/templates', (req, res) => {
    const templatesDir = path.join(process.cwd(), 'templates');
    
    if (!fs.existsSync(templatesDir)) {
        return res.json([]);
    }
    
    const templates = fs.readdirSync(templatesDir)
        .filter(file => file.endsWith('.xlsx'))
        .map(file => ({
            name: file,
            path: `/templates/${file}`
        }));
    
    res.json(templates);
});

// Document processing function
async function processDocuments(processingId, documents, template, prompt, io) {
    try {
        const state = processingStates.get(processingId);
        
        // Step 1: Extract text from all documents
        state.message = 'Extracting text from documents...';
        state.progress = 10;
        io?.emit('processing_update', state);
        
        const extractedTexts = [];
        
        for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];
            const text = await extractTextFromFile(doc.path);
            extractedTexts.push({
                filename: doc.originalname,
                content: text
            });
            
            state.processedFiles = i + 1;
            state.progress = 10 + (i / documents.length) * 40;
            state.message = `Processed ${i + 1}/${documents.length} documents`;
            io?.emit('processing_update', state);
        }
        
        // Step 2: Process template
        state.message = 'Analyzing template structure...';
        state.progress = 55;
        io?.emit('processing_update', state);
        
        const templateStructure = await analyzeTemplate(template.path);
        
        // Step 3: Generate AI response
        state.message = 'Processing with AI...';
        state.progress = 70;
        io?.emit('processing_update', state);
        
        const aiResponse = await processWithAI(
            extractedTexts,
            templateStructure,
            prompt
        );
        
        // Step 4: Identify missing fields
        state.message = 'Checking for missing data...';
        state.progress = 85;
        io?.emit('processing_update', state);
        
        const missingFields = identifyMissingFields(aiResponse, templateStructure);
        
        // Final state
        state.results = aiResponse;
        state.missingFields = missingFields;
        state.status = 'completed';
        state.progress = 100;
        state.message = 'Processing complete! Review the results.';
        
        processingStates.set(processingId, state);
        io?.emit('processing_complete', state);
        
    } catch (error) {
        console.error('Processing error:', error);
        const state = processingStates.get(processingId);
        state.status = 'error';
        state.message = 'Error: ' + error.message;
        io?.emit('processing_error', state);
    }
}

// Extract text from various file formats
async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
        switch (ext) {
            case '.pdf':
                const pdfData = await fs.promises.readFile(filePath);
                const pdfText = await pdf(pdfData);
                return pdfText.text;
                
            case '.docx':
                const docxData = await mammoth.extractRawText({ path: filePath });
                return docxData.value;
                
            case '.xlsx':
                const workbook = XLSX.readFile(filePath);
                let text = '';
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    text += XLSX.utils.sheet_to_csv(worksheet);
                });
                return text;
                
            case '.csv':
                const csvData = await fs.promises.readFile(filePath, 'utf8');
                return csvData;
                
            case '.json':
                const jsonData = await fs.promises.readFile(filePath, 'utf8');
                return JSON.stringify(JSON.parse(jsonData), null, 2);
                
            case '.txt':
                return await fs.promises.readFile(filePath, 'utf8');
                
            default:
                return '';
        }
    } catch (error) {
        console.error(`Error extracting text from ${filePath}:`, error);
        return '';
    }
}

// Analyze Excel template structure
async function analyzeTemplate(templatePath) {
    const workbook = XLSX.readFile(templatePath);
    const structure = {};
    
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        const headers = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
            const cell = worksheet[cellAddress];
            if (cell) {
                headers.push(cell.v);
            }
        }
        
        structure[sheetName] = {
            headers: headers,
            rowCount: range.e.r - range.s.r
        };
    });
    
    return structure;
}

// Process with Gemini AI
async function processWithAI(documents, templateStructure, prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const templateDesc = Object.entries(templateStructure).map(([sheet, data]) => 
        `${sheet}: columns - ${data.headers.join(', ')}`
    ).join('\n');
    
    const documentsText = documents.map(doc => 
        `File: ${doc.filename}\nContent: ${doc.content.substring(0, 2000)}...`
    ).join('\n\n');
    
    const aiPrompt = `
        You are a data extraction expert. I need you to process these documents and fill the Excel template.
        
        Template Structure:
        ${templateDesc}
        
        Documents Content:
        ${documentsText}
        
        User Task: ${prompt}
        
        Please provide the data in JSON format with the following structure:
        {
            "Sheet1": [
                {"Column1": "value1", "Column2": "value2", ...}
            ],
            "Missing": [
                {"Row": 1, "Column": "ColumnName", "Reason": "explanation"}
            ]
        }
        
        Be precise and extract relevant data. If data is missing or unclear, indicate it in the Missing section.
    `;
    
    try {
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        return { Sheet1: [], Missing: [] };
        
    } catch (error) {
        console.error('AI processing error:', error);
        throw error;
    }
}

// Identify missing fields
function identifyMissingFields(aiResponse, templateStructure) {
    const missingFields = [];
    
    if (aiResponse.Missing) {
        return aiResponse.Missing;
    }
    
    // Additional validation could go here
    return missingFields;
}

// Generate final Excel
async function generateFinalExcel(processingId) {
    const state = processingStates.get(processingId);
    
    if (!state.results) {
        throw new Error('No results to generate Excel from');
    }
    
    const workbook = XLSX.utils.book_new();
    
    // Create worksheets from results
    Object.entries(state.results).forEach(([sheetName, data]) => {
        if (sheetName !== 'Missing') {
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
    });
    
    // Save to file
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `processed_${processingId}.xlsx`);
    XLSX.writeFile(workbook, outputPath);
    
    state.finalFile = outputPath;
    state.message = 'Excel file ready for download!';
    processingStates.set(processingId, state);
}

// Cleanup old processing states
setInterval(() => {
    const now = Date.now();
    for (const [id, state] of processingStates.entries()) {
        if (now - (state.createdAt || now) > 24 * 60 * 60 * 1000) { // 24 hours
            processingStates.delete(id);
        }
    }
}, 60 * 60 * 1000); // Run every hour

// Analyze documents endpoint
router.post('/analyze', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        const prompt = req.body.prompt;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        if (!prompt) {
            return res.status(400).json({ error: 'No prompt provided' });
        }

        const results = [];
        
        for (const file of files) {
            try {
                const filePath = file.path;
                const content = await processFile(filePath);
                
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await model.generateContent([
                    prompt,
                    `File: ${file.originalname}\n\nContent:\n${content}`
                ]);
                
                const response = await result.response;
                const analysis = response.text();
                
                results.push({
                    filename: file.originalname,
                    analysis: analysis,
                    success: true
                });
                
            } catch (error) {
                results.push({
                    filename: file.originalname,
                    error: error.message,
                    success: false
                });
            }
        }

        // Clean up uploaded files
        files.forEach(file => {
            try {
                fs.unlinkSync(file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        });

        res.json({
            analysis: results.map(r => 
                `## ${r.filename}\n\n${r.success ? r.analysis : `Error: ${r.error}`}\n\n---\n\n`
            ).join(''),
            results: results
        });

    } catch (error) {
        console.error('Analyze error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;