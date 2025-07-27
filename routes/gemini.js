import express from 'express'; 
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import pdf from 'pdf-parse';
import XLSX from 'xlsx';
import mammoth from 'mammoth';
 
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
 

     const responses = [];
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

     const extractText = async (file) => {
          const ext = file.name.split('.').pop().toLowerCase();
          const buffer = Buffer.from(file.content, 'base64');
          const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
          if (imageExt.includes(ext)) {
              return null; // Indicate it's an image
          }
          if (ext === 'pdf') {
              const data = await pdf(buffer);
              return data.text;
          } else if (ext === 'xlsx' || ext === 'xls') {
              const workbook = XLSX.read(buffer, { type: 'buffer' });
              let text = '';
              workbook.SheetNames.forEach(sheetName => {
                  const sheet = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                  text += sheet;
              });
              return text;
          } else if (ext === 'docx') {
              const { value } = await mammoth.extractRawText({ buffer });
              return value;
          } else if (ext === 'txt' || ext === 'md') {
              return buffer.toString('utf-8');
          } else {
              return 'Unsupported file type';
          }
      };

     let templateText = '';
     if (templateFile) {
         templateText = await extractText(templateFile);
         combinedContent = `Use this template: ${templateText}. ${combinedContent}`;
     }

     if (files && Array.isArray(files) && files.length > 0) {
          for (const file of files) {
              const fileText = await extractText(file);
              let result;
              if (fileText !== null) {
                  const fullPrompt = `${combinedContent} Process this file content: ${fileText}`;
                  result = await model.generateContent(fullPrompt);
              } else {
                  // Handle image
                  const filePart = {
                      inlineData: {
                          data: file.content,
                          mimeType: file.type
                      }
                  };
                  result = await model.generateContent([combinedContent, filePart]);
              }
              const responseText = result.response.text();
              responses.push({ file: file.name, response: responseText });
          }
      } else {
          const result = await model.generateContent(combinedContent);
          const responseText = result.response.text();
          responses.push({ response: responseText });
      }
     res.json({ responses }); 
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