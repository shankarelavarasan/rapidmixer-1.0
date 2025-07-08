// This module will handle OCR (Image to Text) functionality

import { createWorker } from 'tesseract.js';

export function render(container, project) {
    container.innerHTML = `
        <h3>OCR - Image to Text</h3>
        <p>Run OCR on all image files in the current project.</p>
        <button id="runOcrBtn">Run OCR on Project Files</button>
        <div id="ocrProgress"><small></small></div>
        <h4>Extracted Text:</h4>
        <div id="ocrResults"></div>
    `;

    const runOcrBtn = document.getElementById('runOcrBtn');
    const ocrResults = document.getElementById('ocrResults');
    const ocrProgress = document.getElementById('ocrProgress').querySelector('small');

    runOcrBtn.addEventListener('click', async () => {
        if (!project || !project.files || project.files.length === 0) {
            ocrResults.innerHTML = '<p>No files in the project to process.</p>';
            return;
        }

        ocrResults.innerHTML = '';
        ocrProgress.textContent = 'Initializing Tesseract...';

        try {
            const worker = await createWorker({
                logger: m => {
                    console.log(m);
                    ocrProgress.textContent = `${m.status} (${(m.progress * 100).toFixed(2)}%)`;
                }
            });

            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            for (const file of project.files) {
                if (file.type.startsWith('image/')) {
                    const { data: { text } } = await worker.recognize(file);
                    const resultEl = document.createElement('div');
                    resultEl.innerHTML = `<h5>${file.name}</h5><pre>${text}</pre>`;
                    ocrResults.appendChild(resultEl);
                }
            }

            await worker.terminate();
            ocrProgress.textContent = 'OCR processing complete.';
        } catch (error) {
            console.error('OCR Error:', error);
            ocrResults.innerHTML = '<p>An error occurred during OCR processing.</p>';
            ocrProgress.textContent = 'Error.';
        }
    });
}