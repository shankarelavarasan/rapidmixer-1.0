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
      content = `Please analyze this file named ${fileName}:\n\n${fileContent}`;
    } else {
      content = prompt;
    }

    const result = await model.generateContent(content);
    const response = await result.response.text();
    res.json({ response });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ response: 'Something went wrong!' });
  }
});

export default router;