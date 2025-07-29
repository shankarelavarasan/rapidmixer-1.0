/**
 * Service for handling file processing operations
 */
import pdf from 'pdf-parse';
import XLSX from 'xlsx';
import mammoth from 'mammoth';
import { validateFile } from '../utils/fileUtils.js';
import { FileProcessingError } from '../middleware/errorHandler.js';
import { withErrorHandling } from '../utils/errorUtils.js';

/**
 * Extracts text content from various file types
 * @param {Object} file - File object with name and content
 * @param {string} file.name - File name with extension
 * @param {string} file.content - Base64 encoded file content
 * @returns {Promise<string|null>} Extracted text or null for images (if OCR is not available)
 * @throws {FileProcessingError} If file processing fails
 */
export const extractText = async file => {
  const ext = file.name.split('.').pop().toLowerCase();
  const buffer = Buffer.from(file.content, 'base64');
  const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'];

  try {
    // Skip validation for images
    if (!imageExt.includes(ext)) {
      validateFile(buffer, file.name);
    }

    if (imageExt.includes(ext)) {
      // OCR will be handled by ocrService.js
      return null; // Indicate it's an image
    }

    // Process based on file extension
    if (ext === 'pdf') {
      return await processPdfFile(buffer);
    } else if (ext === 'xlsx' || ext === 'xls') {
      return await processExcelFile(buffer);
    } else if (ext === 'docx') {
      return await processWordFile(buffer);
    } else if (ext === 'txt' || ext === 'md') {
      return buffer.toString('utf-8');
    } else {
      throw new FileProcessingError(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    throw new FileProcessingError(
      `Error processing ${file.name}: ${error.message}`
    );
  }
};

/**
 * Processes PDF file and extracts text
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<string>} Extracted text
 * @throws {FileProcessingError} If PDF parsing fails
 */
const processPdfFile = withErrorHandling(
  async buffer => {
    const data = await pdf(buffer);
    return data.text;
  },
  { context: 'pdf processing', defaultMessage: 'Could not parse PDF file' }
);

/**
 * Processes Excel file and extracts text
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<string>} Extracted text
 * @throws {FileProcessingError} If Excel parsing fails
 */
const processExcelFile = withErrorHandling(
  async buffer => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      text += sheet;
    });
    return text;
  },
  { context: 'excel processing', defaultMessage: 'Could not parse Excel file' }
);

/**
 * Processes Word file and extracts text
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<string>} Extracted text
 * @throws {FileProcessingError} If Word parsing fails
 */
const processWordFile = withErrorHandling(
  async buffer => {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  },
  {
    context: 'word processing',
    defaultMessage: 'Could not parse Word document',
  }
);
