import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask-gemini', async (req, res) => {
  try {
    const { prompt, fileContent, fileName } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    let content;
    if (fileContent && fileName) {
      console.log(`Received file: ${fileName}, size: ${fileContent.length} characters`);
      content = `Please analyze this file named ${fileName}:\n\n${fileContent}`;
    } else {
      content = prompt;
    }

    console.log(`Total content length sent to Gemini: ${content.length} characters`);
    console.log('Sending prompt to Gemini:', content);

    const result = await model.generateContent(content);
    console.log('Received result from Gemini:', JSON.stringify(result, null, 2));
    const response = await result.response.text();
    res.json({ response });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ response: 'Something went wrong!' });
  }
});

export default router;