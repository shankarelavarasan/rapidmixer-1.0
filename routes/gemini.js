import express from 'express'; 
 import { GoogleGenerativeAI } from '@google/generative-ai'; 
 
 const router = express.Router(); 
 const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
 
 router.post('/ask-gemini', async (req, res) => { 
   try { 
     const { prompt, template, files } = req.body; 
 
     let combinedContent = `User Prompt: ${prompt}\n\n`;

     if (template) {
        combinedContent += `Template: ${template}\n\n`;
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
     if (files && Array.isArray(files) && files.length > 0) {
        const fileParts = files.map(file => {
            return {
                inlineData: {
                    data: file.content,
                    mimeType: file.type
                }
            }
        });
        result = await model.generateContent([combinedContent, ...fileParts]);
     } else {
        result = await model.generateContent(combinedContent);
     }
 
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