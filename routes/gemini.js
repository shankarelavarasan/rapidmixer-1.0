import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask-gemini', async (req, res) => {
  try {
    const { prompt, fileContent, fileName } = req.body;

    let content = "";
    if (prompt) {
        content = prompt;
    } else if (fileContent) {
        content = `Analyze the following content from file "${fileName}":\n\n${fileContent}`;
        const maxPromptLength = 30000; // Gemini Pro has a 32k token limit, this is a safe char limit
        if (content.length > maxPromptLength) {
             content = `Analyze the following content from file "${fileName}" (partial content):\n\n${fileContent.substring(0, maxPromptLength - 200)}...\n\n(Content truncated due to length limit)`;
             console.warn(`Prompt for file "${fileName}" was truncated due to length: ${content.length}`);
        }
    } else {
        console.warn("Received request with no prompt or fileContent.");
        return res.status(400).json({ response: "No input text or file content received." });
    }

    console.log('Prompt type:', prompt ? 'text' : (fileContent ? 'file' : 'none'));
    console.log('Prompt sent to Gemini (first 200 chars):', content.substring(0, 200));
    console.log('Prompt length:', content.length);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(content);

    console.log("Raw result from Gemini:", JSON.stringify(result, null, 2));

    if (!result || !result.response) {
        console.error("Gemini API error: Invalid response structure.", result);
        if (result && result.promptFeedback) {
            return res.status(400).json({ response: `Request was blocked. Reason: ${result.promptFeedback.blockReason}` });
        }
        return res.status(500).json({ response: "Failed to get a valid response from the AI. The response structure was unexpected." });
    }

    const response = result.response;

    if (response.promptFeedback && response.promptFeedback.blockReason) {
        console.error(`Gemini API request blocked. Reason: ${response.promptFeedback.blockReason}`);
        return res.status(400).json({ response: `Your request was blocked by the safety filter. Reason: ${response.promptFeedback.blockReason}` });
    }

    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
        console.error("Gemini API error: No content in response candidates.", response);
        if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason) {
             return res.status(500).json({ response: `The request finished with reason: ${response.candidates[0].finishReason}. No content was generated.` });
        }
        return res.status(500).json({ response: "The AI response did not contain any content." });
    }

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