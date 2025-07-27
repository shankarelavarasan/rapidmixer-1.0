import { initializeFileSelection } from './modules/fileManager.js';
import { initializeTemplateSelection } from './modules/templateManager.js';
import { initializeVoiceInput } from './modules/voiceManager.js';
import { initializeTaskProcessing, processTask } from './modules/taskProcessor.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeFileSelection();
    await initializeTemplateSelection();
    initializeVoiceInput();
    initializeTaskProcessing();

    const processBtn = document.getElementById('processBtn');
    const promptTextarea = document.getElementById('promptTextarea');
    const chatContainer = document.getElementById('chatContainer');
    const templateSelect = document.getElementById('templateSelect');
    const previewContainer = document.getElementById('previewContainer');
    const previewContent = document.getElementById('previewContent');
    const leftPanel = document.querySelector('.left-panel');
    const workModeBtn = document.getElementById('workModeBtn');
    const chatModeBtn = document.getElementById('chatModeBtn');
    let currentMode = 'work'; // Default to work mode

    function setMode(mode) {
        currentMode = mode;
        if (mode === 'work') {
            leftPanel.style.display = 'block';
            previewContainer.style.display = 'none';
            workModeBtn.classList.add('active');
            chatModeBtn.classList.remove('active');
        } else {
            leftPanel.style.display = 'none';
            previewContainer.style.display = 'none';
            workModeBtn.classList.remove('active');
            chatModeBtn.classList.add('active');
        }
    }

    workModeBtn.addEventListener('click', () => setMode('work'));
    chatModeBtn.addEventListener('click', () => setMode('chat'));
    setMode('work'); // Initialize

    processBtn.addEventListener('click', async () => {
        const prompt = promptTextarea.value;
        if (!prompt.trim()) return;

        const numFiles = window.selectedFiles ? window.selectedFiles.length : 0;
        if (numFiles > 0) {
            if (!confirm(`You are about to generate responses for ${numFiles} files. Proceed?`)) {
                return;
            }
        }

        // Add user message to chat
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user-message');
        userMessage.textContent = prompt;
        chatContainer.appendChild(userMessage);
        promptTextarea.value = '';

        try {
            let requestBody = { prompt };
            if (currentMode === 'work') {
                const selectedTemplateName = templateSelect.value;
                const selectedTemplate = window.templateFiles.find(file => file.name === selectedTemplateName);
                requestBody.templateFile = selectedTemplate ? { name: selectedTemplate.name, content: selectedTemplate.content, type: selectedTemplate.type } : null;
                requestBody.files = window.selectedFiles || [];
            }

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

            if (currentMode === 'work') {
                // Display preview
                previewContent.innerHTML = '';
                if (data.responses && Array.isArray(data.responses)) {
                    data.responses.forEach(resp => {
                        const section = document.createElement('div');
                        const heading = document.createElement('h4');
                        heading.textContent = resp.file ? `Response for ${resp.file}:` : 'Response:';
                        section.appendChild(heading);
                        const content = document.createElement('p');
                        content.textContent = resp.response;
                        section.appendChild(content);
                        previewContent.appendChild(section);
                    });
                } else {
                    previewContent.textContent = 'Unexpected response format.';
                }
                previewContainer.style.display = 'block';

                const combinedContent = data.responses.map(resp => (resp.file ? `Response for ${resp.file}:
` : '') + resp.response).join('

');
                setupExportButtons(combinedContent);

                const aiMessage = document.createElement('div');
                aiMessage.classList.add('chat-message', 'ai-message');
                aiMessage.textContent = 'Processing complete. Check preview.';
                chatContainer.appendChild(aiMessage);
            } else {
                // Chat mode: display response in chat
                const aiMessage = document.createElement('div');
                aiMessage.classList.add('chat-message', 'ai-message');
                aiMessage.textContent = data.responses[0].response;
                chatContainer.appendChild(aiMessage);
            }
        } catch (error) {
            console.error('Error processing:', error);
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('chat-message', 'error-message');
            errorMessage.textContent = `Error: ${error.message}`;
            chatContainer.appendChild(errorMessage);
        }
    });

    function setupExportButtons(content) {
        document.getElementById('exportPdfBtn').onclick = () => exportAsPdf(content);
        document.getElementById('exportWordBtn').onclick = () => exportAsDocx(content);
        document.getElementById('exportExcelBtn').onclick = () => exportAsExcel(content);
        document.getElementById('exportTextBtn').onclick = () => exportAsTxt(content);
    }

    function exportAsPdf(content) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(content, 10, 10);
        doc.save('output.pdf');
    }

    function exportAsDocx(content) {
        const { Document, Packer, Paragraph } = window.docx;
        const doc = new Document({ sections: [{ children: [new Paragraph(content)] }] });
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'output.docx');
        });
    }

    function exportAsExcel(content) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([content.split('\n')]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'output.xlsx');
    }

    function exportAsTxt(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, 'output.txt');
    }
});
