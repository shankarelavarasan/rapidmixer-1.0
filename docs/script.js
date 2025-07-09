document.addEventListener('DOMContentLoaded', () => {
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const selectedFilesDiv = document.getElementById('selectedFiles');
    const templateSelect = document.getElementById('templateSelect');
    const voiceBtn = document.getElementById('voiceBtn');
    const chatContainer = document.getElementById('chatContainer');
    const promptTextarea = document.getElementById('promptTextarea');
    const sendPromptBtn = document.getElementById('sendPromptBtn');

    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', () => {
            console.log('Select File button clicked');
            // Placeholder for file selection logic
        });
    }

    if (selectFolderBtn) {
        selectFolderBtn.addEventListener('click', () => {
            console.log('Select Folder button clicked');
            // Placeholder for folder selection logic
        });
    }

    if (templateSelect) {
        templateSelect.addEventListener('change', (e) => {
            console.log(`Template selected: ${e.target.value}`);
            // Placeholder for template selection logic
        });
    }

    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            console.log('Voice button clicked');
            // Placeholder for voice recording logic
        });
    }

    if (sendPromptBtn) {
        sendPromptBtn.addEventListener('click', async () => {
            const prompt = promptTextarea.value;
            if (prompt.trim()) {
                const userMessage = document.createElement('div');
                userMessage.textContent = `You: ${prompt}`;
                chatContainer.appendChild(userMessage);
                promptTextarea.value = '';

                try {
                    const response = await fetch('https://rapid-ai-assistant.onrender.com/api/ask-gemini', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    const botMessage = document.createElement('div');
                    botMessage.innerHTML = data.response; // Using innerHTML to render potential markdown
                    chatContainer.appendChild(botMessage);
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
