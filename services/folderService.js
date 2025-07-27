/**
 * Service for handling folder processing operations
 */
import { extractText } from './fileProcessingService.js';
import { extractTextFromImage, isImageFile } from './ocrService.js';
import { withErrorHandling } from '../utils/errorUtils.js';
import { FileProcessingError } from '../middleware/errorHandler.js';

/**
 * Processes all files in a folder structure
 * @param {Object} folderStructure - Object containing folder paths and their files
 * @returns {Promise<Object>} Processed folder structure with extracted text
 * @throws {FileProcessingError} If folder processing fails
 */
export const processFolderStructure = withErrorHandling(
  async (folderStructure) => {
    const processedStructure = {};
    
    // Process each folder
    for (const [folderPath, files] of Object.entries(folderStructure)) {
      processedStructure[folderPath] = await Promise.all(
        files.map(async (file) => {
          try {
            let extractedText;
            
            // Check if it's an image file
            if (isImageFile(file.name)) {
              extractedText = await extractTextFromImage(file);
            } else {
              extractedText = await extractText(file);
            }
            
            return {
              ...file,
              text: extractedText || '',
              processed: true
            };
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            return {
              ...file,
              text: `Error: ${error.message}`,
              processed: false,
              error: error.message
            };
          }
        })
      );
    }
    
    return processedStructure;
  },
  { context: 'folder processing', defaultMessage: 'Failed to process folder' }
);

/**
 * Combines all extracted text from files in a folder structure
 * @param {Object} processedStructure - Processed folder structure with extracted text
 * @param {Object} options - Combining options
 * @returns {string} Combined text from all files
 */
export const combineExtractedText = withErrorHandling(
  (processedStructure, options = {}) => {
    const { includeFilePaths = true, maxLength = 30000 } = options;
    let combinedText = '';
    
    // Process each folder
    for (const [folderPath, files] of Object.entries(processedStructure)) {
      // Add folder header if there are multiple folders
      if (Object.keys(processedStructure).length > 1) {
        combinedText += `\n\n=== Folder: ${folderPath} ===\n\n`;
      }
      
      // Process each file in the folder
      for (const file of files) {
        if (file.processed && file.text) {
          // Add file header
          if (includeFilePaths) {
            combinedText += `\n--- File: ${file.path || file.name} ---\n\n`;
          }
          
          // Add file content
          combinedText += file.text + '\n\n';
        }
      }
    }
    
    // Truncate if too long
    if (combinedText.length > maxLength) {
      combinedText = combinedText.substring(0, maxLength - 200) + 
        '\n\n... (content truncated due to length limit)';
    }
    
    return combinedText.trim();
  },
  { context: 'text combining', defaultMessage: 'Failed to combine extracted text' }
);

/**
 * Counts the number of files in a folder structure
 * @param {Object} folderStructure - Object containing folder paths and their files
 * @returns {Object} Count of total files and files by type
 */
export const countFiles = (folderStructure) => {
  let totalFiles = 0;
  const fileTypes = {};
  
  // Count files in each folder
  for (const [_, files] of Object.entries(folderStructure)) {
    totalFiles += files.length;
    
    // Count by file type
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }
  }
  
  return { totalFiles, fileTypes };
};