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

    processBtn.addEventListener('click', async () => {
        const prompt = promptTextarea.value;
        if (!prompt.trim()) return;

        // Add user message to chat
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user-message');
        userMessage.textContent = prompt;
        chatContainer.appendChild(userMessage);
        promptTextarea.value = '';

        try {
            const selectedTemplateName = templateSelect.value;
            const selectedTemplate = window.templateFiles.find(file => file.name === selectedTemplateName);
            const requestBody = {
                prompt: prompt,
                templateFile: selectedTemplate ? { name: selectedTemplate.name, content: selectedTemplate.content, type: selectedTemplate.type } : null,
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

            // Display preview
            previewContent.textContent = data.response;
            previewContainer.style.display = 'block';

            // Add response to chat
            const aiMessage = document.createElement('div');
            aiMessage.classList.add('chat-message', 'ai-message');
            aiMessage.textContent = 'Processing complete. Check preview.';
            chatContainer.appendChild(aiMessage);

        setupExportButtons(data.response);
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
