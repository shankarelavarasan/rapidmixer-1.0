// server/api/process-file.js
import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// File processing endpoint
router.post('/process-file', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'template', maxCount: 1 }
]), async (req, res) => {
  try {
    const { prompt } = req.body;
    const file = req.files.file ? req.files.file[0] : null;
    const templateFile = req.files.template ? req.files.template[0] : null;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const result = await processFileWithGemini(file, prompt, templateFile);
    
    // Clean up uploaded files
    await fs.unlink(file.path);
    if (templateFile) {
      await fs.unlink(templateFile.path);
    }

    res.json(result);
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function processFileWithGemini(file, prompt, templateFile) {
  try {
    let fileContent = '';
    let extractedData = {};

    // Read file based on type
    if (file.mimetype === 'application/pdf') {
      fileContent = await extractPDFContent(file.path);
    } else if (file.mimetype.includes('excel') || file.originalname.endsWith('.xlsx')) {
      fileContent = await extractExcelContent(file.path);
    } else if (file.mimetype === 'text/csv') {
      fileContent = await extractCSVContent(file.path);
    } else if (file.mimetype.includes('word')) {
      fileContent = await extractWordContent(file.path);
    }

    // Read template if provided
    let templateContent = '';
    if (templateFile) {
      templateContent = await extractExcelContent(templateFile.path);
    }

    // Create comprehensive prompt for Gemini
    const geminiPrompt = createProcessingPrompt(prompt, fileContent, templateContent);

    // Generate response using Gemini
    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const parsedData = parseGeminiResponse(text);

    return {
      filename: file.originalname,
      content: fileContent,
      extracted_data: parsedData,
      processed_at: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

function createProcessingPrompt(userPrompt, fileContent, templateContent) {
  let prompt = `
    You are a data processing assistant. Process the following file content based on the user's prompt.
    
    USER PROMPT: ${userPrompt}
    
    FILE CONTENT:
    ${fileContent}
  `;

  if (templateContent) {
    prompt += `
    
    TEMPLATE FORMAT:
    ${templateContent}
    
    Please structure the output according to the template format provided above.
    `;
  }

  prompt += `
    
    Return the data in JSON format with the following structure:
    {
      "data": [array of processed data objects],
      "summary": "brief summary of processing",
      "confidence": 0.95,
      "notes": "any additional notes or clarifications"
    }
  `;

  return prompt;
}

async function extractPDFContent(filePath) {
  // For PDF files, we'll use a simple text extraction
  // In production, use a proper PDF parser like pdf-parse
  return "PDF content extracted - implement proper PDF parsing";
}

async function extractExcelContent(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_csv(worksheet);
  } catch (error) {
    throw new Error(`Failed to read Excel: ${error.message}`);
  }
}

async function extractCSVContent(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

async function extractWordContent(filePath) {
  // For Word files, we'll use a simple text extraction
  // In production, use a proper Word parser like mammoth
  return "Word content extracted - implement proper Word parsing";
}

function parseGeminiResponse(text) {
  try {
    // Try to parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: return as structured text
    return {
      data: [{ content: text }],
      summary: "Processed successfully",
      confidence: 0.8,
      notes: "Response returned as plain text"
    };
  } catch (error) {
    return {
      data: [{ content: text }],
      summary: "Processed with parsing fallback",
      confidence: 0.7,
      notes: "Could not parse structured response"
    };
  }
}

export default router;