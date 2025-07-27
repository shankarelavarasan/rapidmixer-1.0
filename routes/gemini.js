import express from 'express'; 
 import { GoogleGenerativeAI } from '@google/generative-ai'; 
 
 const router = express.Router(); 
 const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
 
 /**
 * @route POST /api/ask-gemini
 * @description Send a prompt to the Gemini API and get a response.
 * @access Public
 */
router.post('/ask-gemini', async (req, res) => { 
   try { 
     const { prompt, templateFile, files } = req.body; 
 
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
 
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"}); 
 

     let result;
     let fileParts = [];
     if (files && Array.isArray(files) && files.length > 0) {
         fileParts = files.map(file => ({
             inlineData: {
                 data: file.content,
                 mimeType: file.type
             }
         }));
     }
     if (templateFile) {
         fileParts.push({
             inlineData: {
                 data: templateFile.content,
                 mimeType: templateFile.type
             }
         });
     }
     result = await model.generateContent([combinedContent, ...fileParts]);
 
     const response = result.response; 
     const text = response.text(); 
     res.json({ response: text }); 
   } catch (err) { 
     console.error("Gemini API fetch error:", err); 
     let userErrorMessage = "Something went wrong while processing your request."; 
     if (err.message) { 
         userErrorMessage += ` Details: ${err.message}`; 
     } 
     res.status(500).json({ response: userErrorMessage }); 
   } 
 }); 
 
 export default router;