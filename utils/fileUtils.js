import fs from 'fs/promises';
import path from 'path';
import { FileProcessingError } from '../middleware/errorHandler.js';

/**
 * Validates file size and type
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {number} maxSize - Maximum file size in bytes
 * @param {string[]} allowedTypes - Array of allowed file extensions
 * @throws {FileProcessingError} If validation fails
 */
export const validateFile = (buffer, filename, maxSize = 10 * 1024 * 1024, allowedTypes = ['pdf', 'docx', 'xlsx', 'xls', 'txt', 'md']) => {
    // Check file size
    if (buffer.length > maxSize) {
        throw new FileProcessingError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    const ext = path.extname(filename).toLowerCase().slice(1);
    if (!allowedTypes.includes(ext)) {
        throw new FileProcessingError(`File type ${ext} is not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }
};

/**
 * Reads a file from the templates directory
 * @param {string} templateName - Name of the template file
 * @param {string} templatesDir - Path to templates directory
 * @returns {Promise<string>} Template content
 * @throws {FileProcessingError} If template cannot be read
 */
export const readTemplate = async (templateName, templatesDir) => {
    try {
        const templatePath = path.join(templatesDir, templateName);
        const content = await fs.readFile(templatePath, 'utf-8');
        return content;
    } catch (error) {
        throw new FileProcessingError(`Failed to read template: ${templateName}`);
    }
};

/**
 * Lists all files in a directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<string[]>} Array of filenames
 * @throws {FileProcessingError} If directory cannot be read
 */
export const listFiles = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        return files;
    } catch (error) {
        throw new FileProcessingError(`Failed to read directory: ${dirPath}`);
    }
};

/**
 * Creates a cache key for a file
 * @param {string} filename - Original filename
 * @param {number} size - File size
 * @param {Date} lastModified - Last modified date
 * @returns {string} Cache key
 */
export const createCacheKey = (filename, size, lastModified) => {
    return `${filename}-${size}-${lastModified.getTime()}`;
};