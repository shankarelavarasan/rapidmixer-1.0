// This module will handle Optical Character Recognition (OCR) using Tesseract.js
import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

export function render(container, project) {
    container.innerHTML = `
        <h2>OCR Module</h2>
        <p>Upload an image to extract text.</p>
        <input type="file" id="ocr-file-input" accept="image/*">
        <button id="ocr-process-btn">Extract Text</button>
        <div id="ocr-output"></div>
    `;

    const fileInput = document.getElementById('ocr-file-input');
    const processBtn = document.getElementById('ocr-process-btn');
    const outputDiv = document.getElementById('ocr-output');

    processBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            outputDiv.textContent = 'Please select an image file.';
            return;
        }

        outputDiv.textContent = 'Processing...';

        try {
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: m => console.log(m) // Add logger for progress
            });
            outputDiv.innerHTML = `<h3>Extracted Text:</h3><pre>${text}</pre>`;
        } catch (error) {
            console.error('OCR Error:', error);
            outputDiv.innerHTML = '<p>An error occurred during OCR processing.</p>';
        }
    });
}