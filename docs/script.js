import { initializeFileSelection } from './modules/fileManager.js';
import { initializeTemplateSelection } from './modules/templateManager.js';
import { initializeVoiceInput } from './modules/voiceManager.js';
import { constructGeminiPrompt } from './modules/geminiEngine.js';
import { displayOutput } from './modules/outputManager.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeFileSelection();
    initializeTemplateSelection();
    initializeVoiceInput();
    const selectedFilesDiv = document.getElementById('selectedFiles');
    const templateSelect = document.getElementById('templateSelect');
    const voiceBtn = document.getElementById('voiceBtn');
    const chatContainer = document.getElementById('chatContainer');
    const promptTextarea = document.getElementById('promptTextarea');
    const sendPromptBtn = document.getElementById('sendPromptBtn');





    if (sendPromptBtn) {
        sendPromptBtn.addEventListener('click', async () => {
            const prompt = promptTextarea.value;
            const template = templateSelect.value;

            if (prompt.trim()) {
                const userMessage = document.createElement('div');
                userMessage.textContent = `You: ${prompt}`;
                chatContainer.appendChild(userMessage);
                promptTextarea.value = '';

                const geminiPrompt = constructGeminiPrompt(prompt, template);

                try {
                    const response = await fetch('https://rapid-ai-assistant.onrender.com/api/ask-gemini', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: geminiPrompt,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    displayOutput(data);
                } catch (error) {
                    console.error('Error sending prompt:', error);
                    const errorMessage = document.createElement('div');
                    errorMessage.textContent = 'Error: Could not get a response from the server.';
                    chatContainer.appendChild(errorMessage);
                }
            }
        });
    }
});
