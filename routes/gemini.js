import express from 'express'; 
import { extractText } from '../services/fileProcessingService.js';
import { getGeminiModel, generateContent, processBatch } from '../services/geminiService.js';
import { FileProcessingError } from '../middleware/errorHandler.js';
import { withErrorHandling } from '../utils/errorUtils.js';
import { validateParams } from '../utils/errorUtils.js';
 
const router = express.Router(); 
 
 /**
 * @route POST /api/ask-gemini
 * @description Send a prompt to the Gemini API and get a response.
 * @access Public
 */
router.post('/ask-gemini', async (req, res) => { 
   try { 
     const { prompt, templateFile, files } = req.body; 
     
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
     const responses = [];

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
             const fileText = await extractText(file);
             return {
                 ...file,
                 text: fileText,
                 isImage: fileText === null
             };
         }));
         
         // Process files in batch
         const batchResponses = await processBatch(model, combinedContent, processedFiles);
         responses.push(...batchResponses);
     } else {
         // Process single prompt without files
         const result = await generateContent(model, combinedContent);
         const responseText = result.response.text();
         responses.push({ response: responseText });
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
 
 export default router;