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
        sendPromptBtn.addEventListener('click', () => {
            const prompt = promptTextarea.value;
            if (prompt.trim()) {
                console.log(`Sending prompt: ${prompt}`);
                // Add user message to chat
                const userMessage = document.createElement('div');
                userMessage.textContent = `You: ${prompt}`;
                chatContainer.appendChild(userMessage);

                // Placeholder for sending prompt to backend and getting response
                promptTextarea.value = '';
            }
        });
    }
});
