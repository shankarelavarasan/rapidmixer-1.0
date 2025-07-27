/**
 * Utility functions for handling output operations
 */
import fs from 'fs/promises';
import path from 'path';
import { FileProcessingError } from '../middleware/errorHandler.js';

/**
 * Saves the AI response to a file
 * @param {Array} responses - Array of response objects
 * @param {string} outputDestination - Directory to save the output
 * @param {string} outputFormat - Format of the output (text, json, html, markdown)
 * @returns {Promise<void>}
 */
export async function saveResponseOutput(responses, outputDestination, outputFormat) {
    try {
        // Create the output directory if it doesn't exist
        await fs.mkdir(outputDestination, { recursive: true });
        
        // Save each response
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const fileName = response.file || `response_${i + 1}`;
            let fileExtension;
            
            // Determine file extension based on output format
            switch (outputFormat.toLowerCase()) {
                case 'json':
                    fileExtension = '.json';
                    break;
                case 'html':
                    fileExtension = '.html';
                    break;
                case 'markdown':
                    fileExtension = '.md';
                    break;
                case 'text':
                default:
                    fileExtension = '.txt';
                    break;
            }
            
            const outputPath = path.join(outputDestination, `${fileName}${fileExtension}`);
            
            // Format and save the response
            let content = response.response;
            if (typeof content === 'object') {
                content = JSON.stringify(content, null, 2);
            }
            
            await fs.writeFile(outputPath, content, 'utf-8');
        }
    } catch (error) {
        throw new FileProcessingError(`Failed to save output: ${error.message}`);
    }
}

/**
 * Creates a unique filename for output
 * @param {string} baseName - Base name for the file
 * @param {string} extension - File extension
 * @returns {string} Unique filename
 */
export function createUniqueFilename(baseName, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${baseName}_${timestamp}${extension}`;
}

/**
 * Gets the appropriate file extension for an output format
 * @param {string} outputFormat - Output format (text, json, html, markdown)
 * @returns {string} File extension with dot
 */
export function getFileExtension(outputFormat) {
    switch (outputFormat.toLowerCase()) {
        case 'json':
            return '.json';
        case 'html':
            return '.html';
        case 'markdown':
            return '.md';
        case 'text':
        default:
            return '.txt';
    }
}