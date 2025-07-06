import express from 'express'; 
 import { GoogleGenerativeAI } from '@google/generative-ai'; 
 
 const router = express.Router(); 
 const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
 
 router.post('/ask-gemini', async (req, res) => { 
   try { 
     const { prompt, filesData } = req.body; 
 
     let combinedContent = prompt ? `${prompt}\n\n` : ''; 
 
     if (filesData && Array.isArray(filesData) && filesData.length > 0) { 
       const fileContents = filesData.map(file => 
         `File: ${file.name}\nContent:\n${file.content}` 
       ).join('\n\n---\n\n'); 
       combinedContent += `Analyze the following file(s):\n\n${fileContents}`; 
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
 
     const content = combinedContent; 
     console.log('Prompt sent to Gemini (first 200 chars):', content.substring(0, 200)); 
     console.log('Prompt length:', content.length); 
 
     const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
 
     const result = await model.generateContent(content); 
 
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