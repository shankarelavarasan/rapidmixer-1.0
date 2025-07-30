import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

/**
 * Process and extract text content from various file formats
 */
export async function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
        switch (ext) {
            case '.pdf':
                return await extractFromPDF(filePath);
                
            case '.docx':
                return await extractFromDocx(filePath);
                
            case '.xlsx':
                return await extractFromExcel(filePath);
                
            case '.csv':
                return await extractFromCSV(filePath);
                
            case '.json':
                return await extractFromJSON(filePath);
                
            case '.txt':
                return await extractFromTXT(filePath);
                
            default:
                throw new Error(`Unsupported file type: ${ext}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        throw error;
    }
}

/**
 * Extract text from PDF files
 */
async function extractFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        
        return {
            filename: path.basename(filePath),
            content: data.text,
            pages: data.numpages,
            metadata: {
                title: data.info?.Title || '',
                author: data.info?.Author || '',
                subject: data.info?.Subject || ''
            }
        };
    } catch (error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
    }
}

/**
 * Extract text from DOCX files
 */
async function extractFromDocx(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        
        return {
            filename: path.basename(filePath),
            content: result.value,
            metadata: {
                warnings: result.messages || []
            }
        };
    } catch (error) {
        throw new Error(`DOCX extraction failed: ${error.message}`);
    }
}

/**
 * Extract data from Excel files
 */
async function extractFromExcel(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheets = {};
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            sheets[sheetName] = data;
        });
        
        return {
            filename: path.basename(filePath),
            content: JSON.stringify(sheets, null, 2),
            sheets: workbook.SheetNames.length,
            metadata: {
                sheetNames: workbook.SheetNames
            }
        };
    } catch (error) {
        throw new Error(`Excel extraction failed: ${error.message}`);
    }
}

/**
 * Extract data from CSV files
 */
async function extractFromCSV(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        
        return {
            filename: path.basename(filePath),
            content: data,
            rows: data.split('\n').length - 1,
            metadata: {
                encoding: 'utf8'
            }
        };
    } catch (error) {
        throw new Error(`CSV extraction failed: ${error.message}`);
    }
}

/**
 * Extract data from JSON files
 */
async function extractFromJSON(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        return {
            filename: path.basename(filePath),
            content: JSON.stringify(data, null, 2),
            metadata: {
                keys: Array.isArray(data) ? data.length : Object.keys(data),
                type: Array.isArray(data) ? 'array' : 'object'
            }
        };
    } catch (error) {
        throw new Error(`JSON extraction failed: ${error.message}`);
    }
}

/**
 * Extract data from TXT files
 */
async function extractFromTXT(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        
        return {
            filename: path.basename(filePath),
            content: data,
            lines: data.split('\n').length,
            metadata: {
                encoding: 'utf8'
            }
        };
    } catch (error) {
        throw new Error(`TXT extraction failed: ${error.message}`);
    }
}

/**
 * Get file statistics
 */
export function getFileStats(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: path.extname(filePath).toLowerCase()
        };
    } catch (error) {
        return null;
    }
}