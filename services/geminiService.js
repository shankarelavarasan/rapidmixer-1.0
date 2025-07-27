/**
 * Service for handling interactions with the Gemini API
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withErrorHandling } from '../utils/errorUtils.js';

/**
 * Creates and returns a Gemini model instance
 * @param {string} apiKey - Gemini API key
 * @param {string} modelName - Model name to use
 * @returns {Object} Gemini model instance
 */
export const getGeminiModel = (apiKey, modelName = 'gemini-1.5-flash-latest') => {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Generates content using the Gemini API
 * @param {Object} model - Gemini model instance
 * @param {string|Array} prompt - Text prompt or array of parts (text and images)
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generation result
 */
export const generateContent = withErrorHandling(
    async (model, prompt, options = {}) => {
        return await model.generateContent(prompt, options);
    },
    { context: 'AI content generation', defaultMessage: 'Failed to generate content' }
);

/**
 * Processes a batch of files with Gemini
 * @param {Object} model - Gemini model instance
 * @param {string} basePrompt - Base prompt to use for all files
 * @param {Array} files - Array of file objects to process
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} Array of responses for each file
 */
export const processBatch = withErrorHandling(
    async (model, basePrompt, files, options = {}) => {
        const responses = [];
        const { maxConcurrent = 3, outputFormat = 'text' } = options;
        
        // Process files in batches to avoid overwhelming the API
        for (let i = 0; i < files.length; i += maxConcurrent) {
            const batch = files.slice(i, i + maxConcurrent);
            const promises = batch.map(async (file) => {
                try {
                    let result;
                    if (file.isImage) {
                        // Handle image file
                        const filePart = {
                            inlineData: {
                                data: file.content,
                                mimeType: file.type
                            }
                        };
                        result = await model.generateContent([basePrompt, filePart]);
                    } else {
                        // Handle text file
                        const fullPrompt = `${basePrompt} Process this file content: ${file.text}`;
                        result = await model.generateContent(fullPrompt);
                    }
                    
                    const responseText = result.response.text();
                    return { 
                        file: file.name, 
                        path: file.path || file.name,
                        response: responseText, 
                        success: true,
                        outputFormat
                    };
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    return { 
                        file: file.name, 
                        path: file.path || file.name,
                        response: `Error processing file: ${error.message}`, 
                        success: false,
                        outputFormat
                    };
                }
            });
            
            const batchResults = await Promise.all(promises);
            responses.push(...batchResults);
        }
        
        return responses;
    },
    { context: 'batch processing', defaultMessage: 'Failed to process files' }
);

/**
 * Processes a folder structure with Gemini
 * @param {Object} model - Gemini model instance
 * @param {string} basePrompt - Base prompt to use for all files
 * @param {Object} folderStructure - Processed folder structure with extracted text
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Object with responses for each folder
 */
export const processFolderStructure = withErrorHandling(
    async (model, basePrompt, folderStructure, options = {}) => {
        const { outputFormat = 'text', processingMode = 'individual' } = options;
        
        // If processing as a single unit, combine all text and process once
        if (processingMode === 'combined') {
            // Import here to avoid circular dependency
            const { combineExtractedText } = await import('./folderService.js');
            const combinedText = combineExtractedText(folderStructure);
            
            const fullPrompt = `${basePrompt}\n\nProcess this combined content from multiple files:\n${combinedText}`;
            const result = await model.generateContent(fullPrompt);
            const responseText = result.response.text();
            
            return {
                combined: true,
                response: responseText,
                outputFormat
            };
        }
        
        // Process each folder separately
        const responses = {};
        
        for (const [folderPath, files] of Object.entries(folderStructure)) {
            // Process files in this folder
            const folderResponses = await processBatch(model, basePrompt, files, {
                ...options,
                outputFormat
            });
            
            responses[folderPath] = folderResponses;
        }
        
        return {
            combined: false,
            responses,
            outputFormat
        };
    },
    { context: 'folder processing', defaultMessage: 'Failed to process folder' }
);