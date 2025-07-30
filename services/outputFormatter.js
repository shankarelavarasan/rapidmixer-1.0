import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

/**
 * Format and structure output data for Excel generation
 */
export function formatOutput(data, templateStructure) {
    const formatted = {};
    
    // Process each sheet in the template
    Object.keys(templateStructure).forEach(sheetName => {
        if (data[sheetName]) {
            formatted[sheetName] = formatSheetData(data[sheetName], templateStructure[sheetName]);
        }
    });
    
    return formatted;
}

/**
 * Format individual sheet data
 */
function formatSheetData(rows, templateSheet) {
    const formattedRows = [];
    
    rows.forEach(row => {
        const formattedRow = {};
        
        // Map data to template headers
        templateSheet.headers.forEach(header => {
            formattedRow[header] = row[header] || '';
        });
        
        formattedRows.push(formattedRow);
    });
    
    return formattedRows;
}

/**
 * Generate Excel file from processed data
 */
export function generateExcel(data, filename = 'processed_data.xlsx') {
    try {
        const workbook = XLSX.utils.book_new();
        
        // Add each sheet
        Object.entries(data).forEach(([sheetName, rows]) => {
            if (Array.isArray(rows) && rows.length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            }
        });
        
        // Ensure output directory exists
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filePath = path.join(outputDir, filename);
        XLSX.writeFile(workbook, filePath);
        
        return {
            success: true,
            filePath,
            filename
        };
        
    } catch (error) {
        console.error('Excel generation error:', error);
        throw new Error(`Failed to generate Excel: ${error.message}`);
    }
}

/**
 * Generate Excel with validation and formatting
 */
export function generateFormattedExcel(data, templatePath, outputFilename) {
    try {
        // Read template
        const templateWorkbook = XLSX.readFile(templatePath);
        const outputWorkbook = XLSX.utils.book_new();
        
        // Copy template structure
        templateWorkbook.SheetNames.forEach(sheetName => {
            const templateSheet = templateWorkbook.Sheets[sheetName];
            const newSheet = XLSX.utils.aoa_to_sheet([[]]);
            
            // Copy headers from template
            const templateData = XLSX.utils.sheet_to_json(templateSheet, { header: 1 });
            if (templateData.length > 0) {
                newSheet['!ref'] = templateSheet['!ref'];
                
                // Copy headers (first row)
                templateData[0].forEach((header, index) => {
                    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
                    newSheet[cellAddress] = { v: header, t: 's' };
                });
                
                // Add data rows
                if (data[sheetName]) {
                    data[sheetName].forEach((row, rowIndex) => {
                        Object.keys(row).forEach(key => {
                            const colIndex = templateData[0].indexOf(key);
                            if (colIndex !== -1) {
                                const cellAddress = XLSX.utils.encode_cell({ 
                                    r: rowIndex + 1, 
                                    c: colIndex 
                                });
                                newSheet[cellAddress] = { v: row[key], t: 's' };
                            }
                        });
                    });
                }
            }
            
            XLSX.utils.book_append_sheet(outputWorkbook, newSheet, sheetName);
        });
        
        // Save file
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filePath = path.join(outputDir, outputFilename);
        XLSX.writeFile(outputWorkbook, filePath);
        
        return {
            success: true,
            filePath,
            filename: outputFilename
        };
        
    } catch (error) {
        console.error('Formatted Excel generation error:', error);
        throw new Error(`Failed to generate formatted Excel: ${error.message}`);
    }
}

/**
 * Validate data against template structure
 */
export function validateData(data, templateStructure) {
    const validation = {
        valid: true,
        errors: [],
        warnings: []
    };
    
    Object.keys(templateStructure).forEach(sheetName => {
        const templateHeaders = templateStructure[sheetName].headers || [];
        const sheetData = data[sheetName] || [];
        
        // Check for missing columns
        sheetData.forEach((row, rowIndex) => {
            templateHeaders.forEach(header => {
                if (!row.hasOwnProperty(header)) {
                    validation.warnings.push({
                        type: 'missing_column',
                        sheet: sheetName,
                        row: rowIndex + 1,
                        column: header,
                        message: `Missing column: ${header}`
                    });
                }
            });
            
            // Check for empty required fields
            Object.keys(row).forEach(key => {
                if (!row[key] || row[key].toString().trim() === '') {
                    validation.warnings.push({
                        type: 'empty_field',
                        sheet: sheetName,
                        row: rowIndex + 1,
                        column: key,
                        message: `Empty field: ${key}`
                    });
                }
            });
        });
    });
    
    return validation;
}

/**
 * Generate summary report
 */
export function generateSummary(data, validation) {
    const summary = {
        totalSheets: Object.keys(data).length,
        totalRows: 0,
        validation: validation,
        sheets: {}
    };
    
    Object.entries(data).forEach(([sheetName, rows]) => {
        summary.totalRows += rows.length;
        summary.sheets[sheetName] = {
            rowCount: rows.length,
            columns: rows.length > 0 ? Object.keys(rows[0]) : []
        };
    });
    
    return summary;
}

/**
 * Cleanup old output files
 */
export function cleanupOldFiles(maxAgeHours = 24) {
    try {
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) return;
        
        const files = fs.readdirSync(outputDir);
        const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
        
        files.forEach(file => {
            const filePath = path.join(outputDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtime.getTime() < cutoffTime) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up old file: ${file}`);
            }
        });
        
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

// Run cleanup every hour
setInterval(() => {
    cleanupOldFiles();
}, 60 * 60 * 1000);