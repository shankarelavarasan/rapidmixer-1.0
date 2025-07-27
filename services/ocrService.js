/**
 * Service for handling OCR (Optical Character Recognition) operations
 */
import { createWorker } from 'tesseract.js';
import { withErrorHandling } from '../utils/errorUtils.js';
import { FileProcessingError } from '../middleware/errorHandler.js';

/**
 * Extracts text from an image using OCR
 * @param {Object} imageFile - Image file object
 * @param {string} imageFile.content - Base64 encoded image content
 * @param {string} imageFile.name - Image file name
 * @param {string} imageFile.type - Image MIME type
 * @returns {Promise<string>} Extracted text from the image
 * @throws {FileProcessingError} If OCR processing fails
 */
export const extractTextFromImage = withErrorHandling(
  async (imageFile) => {
    // Create a worker for OCR processing
    const worker = await createWorker('eng');
    
    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageFile.content, 'base64');
      
      // Recognize text from image
      const { data } = await worker.recognize(imageBuffer);
      
      // Return the extracted text
      return data.text;
    } finally {
      // Always terminate the worker when done
      await worker.terminate();
    }
  },
  { context: 'OCR processing', defaultMessage: 'Failed to extract text from image' }
);

/**
 * Checks if a file is an image based on its extension
 * @param {string} filename - File name
 * @returns {boolean} True if the file is an image, false otherwise
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'];
  const ext = filename.split('.').pop().toLowerCase();
  return imageExtensions.includes(ext);
};