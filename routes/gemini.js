import express from 'express'; 
import { extractText } from '../services/fileProcessingService.js';
import { getGeminiModel, generateContent, processBatch, processFolderStructure } from '../services/geminiService.js';
import { processFolderStructure as processFolder, combineExtractedText } from '../services/folderService.js';
import { extractTextFromImage, isImageFile } from '../services/ocrService.js';
import { formatOutput } from '../services/outputService.js';
import { queueFolderProcessing, getJobStatus } from '../services/queueService.js';
import { FileProcessingError } from '../middleware/errorHandler.js';
import { withErrorHandling } from '../utils/errorUtils.js';
import { validateParams } from '../utils/errorUtils.js';
import { uploadSingleFile, uploadMultipleFiles, uploadFolder } from '../middleware/upload.js';
import { saveResponseOutput } from '../utils/outputUtils.js';
import path from 'path';
import fs from 'fs/promises';
 
const router = express.Router(); 

/**
 * @route POST /api/ask-gemini
 * @description Send a prompt to the Gemini API and get a response.
 * @access Public
 */
router.post('/ask-gemini', async (req, res) => { 
   try { 
     const { 
       prompt, 
       templateFile, 
       files, 
       outputFormat = 'text',
       processingMode = 'individual',
       saveOutput = false,
       outputDestination = ''
     } = req.body; 
     
     // Validate required parameters
     validateParams({ prompt }, ['prompt']);
 
     let combinedContent = prompt;

     if (templateFile) {
         combinedContent = `Use the provided template file to process the input with this prompt: ${prompt}`;
     }
 
     if (!combinedContent.trim()) { 
       console.warn("Received request with no prompt or file data."); 
       return res.status(400).json({ response: "No input text or file content received." }); 
     } 
 
     const maxPromptLength = 30000; // Gemini Pro has a 32k token limit, this is a safe char limit 
     if (combinedContent.length > maxPromptLength) { 
         combinedContent = combinedContent.substring(0, maxPromptLength - 200) + "...\n\n(Content truncated due to length limit)"; 
         console.warn(`Prompt was truncated due to length: ${combinedContent.length}`); 
     } 
 
     // Initialize Gemini model
     const model = getGeminiModel(process.env.GEMINI_API_KEY);
     let responses = [];

     // Process template if provided
     let templateText = '';
     if (templateFile) {
         templateText = await extractText(templateFile);
         combinedContent = `Use this template: ${templateText}. ${combinedContent}`;
     }

     // Process files if provided
     if (files && Array.isArray(files) && files.length > 0) {
         // Prepare files with extracted text
         const processedFiles = await Promise.all(files.map(async (file) => {
             let fileText;
             
             // Check if it's an image file
             if (isImageFile(file.name)) {
                 fileText = await extractTextFromImage(file);
                 return {
                     ...file,
                     text: fileText,
                     isImage: true
                 };
             } else {
                 fileText = await extractText(file);
                 return {
                     ...file,
                     text: fileText,
                     isImage: false
                 };
             }
         }));
         
         // Process files in batch
         const batchResponses = await processBatch(model, combinedContent, processedFiles, {
             outputFormat,
             processingMode
         });
         responses.push(...batchResponses);
     } else {
         // Process single prompt without files
         const result = await generateContent(model, combinedContent);
         const responseText = result.response.text();
         
         // Format the output
         const formattedOutput = await formatOutput(responseText, outputFormat, {
             title: 'Gemini AI Response'
         });
         
         responses.push({ 
             response: formattedOutput,
             outputFormat
         });
     }
     
     // Save output if requested
     if (saveOutput && outputDestination) {
         await saveResponseOutput(responses, outputDestination, outputFormat);
     }
     
     res.json({ responses }); 
   } catch (err) { 
     console.error("Error processing request:", err); 
     let status = 500;
     let message = "Something went wrong while processing your request.";
     
     if (err instanceof FileProcessingError) {
         status = 422;
         message = err.message;
     } else if (err.message) {
         message += ` Details: ${err.message}`;
     }
     
     res.status(status).json({ response: message }); 
   } 
 }); 

/**
 * @route POST /api/ask-gemini/folder
 * @description Process a folder of files with the Gemini API
 * @access Public
 */
router.post('/ask-gemini/folder', uploadFolder, async (req, res) => {
    try {
        const { 
            prompt, 
            templateFile, 
            outputFormat = 'text',
            processingMode = 'combined',
            saveOutput = false,
            outputDestination = '',
            async = false
        } = req.body;
        
        // Validate required parameters
        validateParams({ prompt }, ['prompt']);
        
        if (!req.folderStructure || Object.keys(req.folderStructure).length === 0) {
            return res.status(400).json({ response: "No folder data received." });
        }
        
        // Get Socket.IO instance for real-time updates
        const io = req.app.get('io');
        
        // If async processing is requested, use the queue
        if (async) {
            // Process the folder structure to extract text from all files
            const processedFolderStructure = await processFolder(req.folderStructure);
            
            // Process template if provided
            let templateText = '';
            if (templateFile) {
                templateText = await extractText(templateFile);
            }
            
            // Add job to queue
            const job = await queueFolderProcessing({
                folderStructure: processedFolderStructure,
                prompt,
                templateText,
                options: {
                    outputFormat,
                    processingMode,
                    saveOutput,
                    outputDestination
                }
            });
            
            // Set up Socket.IO event for this job
            if (io) {
                job.on('progress', (progress) => {
                    io.emit(`job-progress-${job.id}`, { id: job.id, progress });
                });
                
                job.on('completed', (result) => {
                    io.emit(`job-completed-${job.id}`, { id: job.id, result });
                });
                
                job.on('failed', (error) => {
                    io.emit(`job-failed-${job.id}`, { id: job.id, error: error.message });
                });
            }
            
            return res.json({ jobId: job.id, status: 'queued' });
        }
        
        // Synchronous processing (original implementation)
        // Process the folder structure to extract text from all files
        const processedFolderStructure = await processFolder(req.folderStructure);
        
        let combinedContent = prompt;
        
        // Process template if provided
        if (templateFile) {
            const templateText = await extractText(templateFile);
            combinedContent = `Use this template: ${templateText}. ${combinedContent}`;
        }
        
        // Initialize Gemini model
        const model = getGeminiModel(process.env.GEMINI_API_KEY);
        
        // Process the folder with Gemini
        const result = await processFolderStructure(model, combinedContent, processedFolderStructure, {
            outputFormat,
            processingMode
        });
        
        // Save output if requested
        if (saveOutput && outputDestination) {
            if (result.combined) {
                // Save combined result
                await saveResponseOutput([{ response: result.response, outputFormat }], outputDestination, outputFormat);
            } else {
                // Save individual results
                const flatResponses = [];
                for (const folderResponses of Object.values(result.responses)) {
                    flatResponses.push(...folderResponses);
                }
                await saveResponseOutput(flatResponses, outputDestination, outputFormat);
            }
        }
        
        res.json(result);
    } catch (err) {
        console.error("Error processing folder:", err);
        let status = 500;
        let message = "Something went wrong while processing your folder.";
        
        if (err instanceof FileProcessingError) {
            status = 422;
            message = err.message;
        } else if (err.message) {
            message += ` Details: ${err.message}`;
        }
        
        res.status(status).json({ response: message });
    }
});

/**
 * @route GET /api/job/:jobId
 * @description Get the status of a job
 * @access Public
 */
router.get('/job/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        
        // Validate required parameters
        validateParams({ jobId }, ['jobId']);
        
        // Get job status
        const status = await getJobStatus(jobId);
        
        res.json(status);
    } catch (err) {
        console.error("Error getting job status:", err);
        let status = 500;
        let message = "Something went wrong while getting job status.";
        
        if (err.message) {
            message += ` Details: ${err.message}`;
        }
        
        res.status(status).json({ response: message });
    }
});

/**
 * @route POST /api/save-output
 * @description Save the AI response to a file
 * @access Public
 */
router.post('/save-output', async (req, res) => {
    try {
        const { responses, outputDestination, outputFormat = 'text' } = req.body;
        
        // Validate required parameters
        validateParams({ responses, outputDestination }, ['responses', 'outputDestination']);
        
        await saveResponseOutput(responses, outputDestination, outputFormat);
        
        res.json({ success: true, message: 'Output saved successfully' });
    } catch (err) {
        console.error("Error saving output:", err);
        let status = 500;
        let message = "Something went wrong while saving the output.";
        
        if (err instanceof FileProcessingError) {
            status = 422;
            message = err.message;
        } else if (err.message) {
            message += ` Details: ${err.message}`;
        }
        
        res.status(status).json({ success: false, message });
    }
});


 
 export default router;