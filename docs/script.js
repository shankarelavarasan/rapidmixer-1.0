import { initializeFileSelection } from './modules/fileManager.js';
import { initializeTemplateSelection } from './modules/templateManager.js';
import { initializeVoiceInput } from './modules/voiceManager.js';
import {
  initializeTaskProcessing,
  processTask,
} from './modules/taskProcessor.js';
import { uiManager } from './modules/uiManager.js';
import { errorHandler } from './modules/errorHandler.js';
import { stateManager } from './modules/stateManager.js';

// API Configuration
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:10000',
    wsUrl: 'ws://localhost:10000',
  },
  production: {
    baseUrl: 'https://rapid-ai-assistant.onrender.com',
    wsUrl: 'wss://rapid-ai-assistant.onrender.com',
  },
};

// Get environment based on hostname
const isProduction = window.location.hostname === 'shankarelavarasan.github.io';
const API_URLS = isProduction ? API_CONFIG.production : API_CONFIG.development;

document.addEventListener('DOMContentLoaded', async () => {
  initializeFileSelection();
  await initializeTemplateSelection();
  initializeVoiceInput();
  initializeTaskProcessing();
  uiManager.initialize();

  const templateSelect = document.getElementById('templateSelect');

  // Add event listener for the Submit button (GitHub integration)
  uiManager.elements.submitBtn.addEventListener('click', async () => {
    try {
      uiManager.addMessage('Pushing changes to GitHub...', 'user');

      const response = await errorHandler.wrapAsync(
        fetch(`${API_URLS.baseUrl}/api/github/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ message: 'Update from Rapid AI Assistant' }),
        })
      );

      const data = await response.json();

      if (response.ok) {
        uiManager.addMessage(
          `Successfully pushed to GitHub: ${data.message}`,
          'ai'
        );
      } else {
        const error = errorHandler.handleError(
          new Error(data.error),
          errorHandler.errorTypes.API_ERROR
        );
        uiManager.addMessage(error.message, 'error');
      }
    } catch (error) {
      const handledError = errorHandler.handleError(
        error,
        errorHandler.errorTypes.API_ERROR
      );
      uiManager.addMessage(handledError.message, 'error');
    } finally {
      // Reset processing state
      processBtn.disabled = false;
      processBtn.textContent = 'Process';
    }
  });

  // Reset functionality is now handled by uiManager

  uiManager.elements.processBtn.addEventListener('click', async () => {
    try {
      const prompt = uiManager.elements.promptTextarea.value;

      // Validate input
      errorHandler.validateInput(
        { prompt },
        {
          prompt: { required: true, minLength: 1 },
        }
      );

      const numFiles = stateManager.state.selectedFiles.length;
      if (numFiles > 0) {
        if (
          !confirm(
            `You are about to generate responses for ${numFiles} files. Proceed?`
          )
        ) {
          return;
        }
      }

      uiManager.setProcessingState(true);
      uiManager.addMessage(prompt, 'user');
      uiManager.elements.promptTextarea.value = '';

      let requestBody = { prompt };
      if (stateManager.state.mode === 'work') {
        const selectedTemplate = stateManager.state.selectedTemplate;
        requestBody.templateFile = selectedTemplate
          ? {
              name: selectedTemplate.name,
              content: selectedTemplate.content,
              type: selectedTemplate.type,
            }
          : null;
        requestBody.files = stateManager.state.selectedFiles;
      }

      const response = await errorHandler.wrapAsync(
        fetch(`${API_URLS.baseUrl}/api/ask-gemini`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        })
      );

      if (!response.ok) {
        throw errorHandler.handleError(
          new Error(`HTTP error! status: ${response.status}`),
          errorHandler.errorTypes.API_ERROR
        );
      }

      const data = await response.json();

      if (stateManager.state.mode === 'work') {
        // Display preview
        let previewHtml = '';
        if (data.responses && Array.isArray(data.responses)) {
          data.responses.forEach(resp => {
            previewHtml += `
                            <div>
                                <h4>${resp.file ? `Response for ${resp.file}:` : 'Response:'}</h4>
                                <p>${resp.response}</p>
                            </div>
                        `;
          });
        } else {
          previewHtml = 'Unexpected response format.';
        }
        uiManager.setPreviewContent(previewHtml);

        const combinedContent = data.responses
          .map(
            resp =>
              (resp.file
                ? `Response for ${resp.file}:
`
                : '') + resp.response
          )
          .join('\n\n');
        setupExportButtons(combinedContent);

        uiManager.addMessage('Processing complete. Check preview.', 'ai');
      } else {
        // Chat mode: display response in chat
        uiManager.addMessage(data.responses[0].response, 'ai');
      }
    } catch (error) {
      const handledError = errorHandler.handleError(
        error,
        error.type || errorHandler.errorTypes.UNKNOWN_ERROR
      );
      uiManager.addMessage(handledError.message, 'error');
    } finally {
      uiManager.setProcessingState(false);
    }
  });

  function setupExportButtons(content) {
    document.getElementById('exportPdfBtn').onclick = () =>
      exportAsPdf(content);
    document.getElementById('exportWordBtn').onclick = () =>
      exportAsDocx(content);
    document.getElementById('exportExcelBtn').onclick = () =>
      exportAsExcel(content);
    document.getElementById('exportTextBtn').onclick = () =>
      exportAsTxt(content);
  }

  function exportAsPdf(content) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save('output.pdf');
  }

  function exportAsDocx(content) {
    const { Document, Packer, Paragraph } = window.docx;
    const doc = new Document({
      sections: [{ children: [new Paragraph(content)] }],
    });
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
