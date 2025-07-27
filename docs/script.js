import { initializeFileSelection } from './modules/fileManager.js';
import { initializeTemplateSelection, getTemplateContent } from './modules/templateManager.js';
import { initializeVoiceInput } from './modules/voiceManager.js';
import { initializeTaskProcessing, processTask } from './modules/taskProcessor.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeFileSelection();
    await initializeTemplateSelection();
    initializeVoiceInput();
    initializeTaskProcessing();

    const sendPromptBtn = document.getElementById('sendPromptBtn');
    const promptTextarea = document.getElementById('promptTextarea');
    const chatContainer = document.getElementById('chatContainer');
    const templateSelect = document.getElementById('templateSelect');

    sendPromptBtn.addEventListener('click', async () => {
        const prompt = promptTextarea.value;
        if (!prompt.trim()) return;

        // Add user message to chat
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user-message');
        userMessage.textContent = prompt;
        chatContainer.appendChild(userMessage);
        promptTextarea.value = '';

        try {
            const selectedTemplate = templateSelect.value;
            const templateContent = await getTemplateContent(selectedTemplate);

            // Process locally if possible, otherwise fall back to server
            if (window.selectedFiles && window.selectedFiles.length > 0) {
                // Local processing
                const results = await processTask(window.selectedFiles, templateSelect.value);
                const data = {
                    response: JSON.stringify(results, null, 2)
                };
            } else {
                // Fall back to server for non-file prompts
                const requestBody = {
                    prompt: prompt,
                    template: templateContent,
                    files: window.selectedFiles || []
                };

                const response = await fetch('https://rapid-ai-assistant.onrender.com/api/ask-gemini', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
            }

            // Add response to chat
            const aiMessage = document.createElement('div');
            aiMessage.classList.add('chat-message', 'ai-message');
            const pre = document.createElement('pre');
            
            // Format results differently for local vs server processing
            if (window.selectedFiles && window.selectedFiles.length > 0) {
                pre.textContent = `Local processing complete:\n${data.response}`;
            } else {
                pre.textContent = data.response;
            }
            
            aiMessage.appendChild(pre);
            chatContainer.appendChild(aiMessage);

        } catch (error) {
            console.error('Error sending prompt:', error);
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('chat-message', 'error-message');
            errorMessage.textContent = `Error: ${error.message}`;
            chatContainer.appendChild(errorMessage);
        }
    });
});
