import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask-gemini', async (req, res) => {
  try {
    const { prompt, filesData } = req.body;

    let fullPrompt = prompt || '';

    if (filesData && filesData.length > 0) {
        const fileContents = filesData.map(file => 
            `File: ${file.name}\nContent:\n${file.content}`
        ).join('\n\n---\n\n');
        
        fullPrompt += `\n\nBased on the following files, please answer the user's question.\n\n${fileContents}`;
    }

    if (!fullPrompt) {
        console.warn("Received request with no prompt or file data.");
        return res.status(400).json({ response: "No input text or file content received." });
    }

    // Truncate if necessary
    const maxPromptLength = 30000; 
    if (fullPrompt.length > maxPromptLength) {
        fullPrompt = fullPrompt.substring(0, maxPromptLength - 200) + "...\n\n(Content truncated due to length limit)";
        console.warn(`Prompt was truncated due to length: ${fullPrompt.length}`);
    }

    console.log('Prompt sent to Gemini (first 200 chars):', fullPrompt.substring(0, 200));
    console.log('Prompt length:', fullPrompt.length);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(fullPrompt);

    const response = await result.response;
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