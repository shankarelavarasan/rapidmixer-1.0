// This module will handle OCR (Image to Text) functionality

export function render(container, project) {
    container.innerHTML = `
        <h3>OCR - Image to Text</h3>
        <p>Upload an image to extract text from it. This uses Tesseract.js.</p>
        <input type="file" id="ocrInput" accept="image/*">
        <button id="processOcrBtn">Process Image</button>
        <div id="ocrProgress"><small></small></div>
        <h4>Extracted Text:</h4>
        <pre id="ocrOutput"></pre>
    `;

    const processOcrBtn = document.getElementById('processOcrBtn');
    const ocrInput = document.getElementById('ocrInput');
    const ocrOutput = document.getElementById('ocrOutput');
    const ocrProgress = document.getElementById('ocrProgress').querySelector('small');

    processOcrBtn.addEventListener('click', async () => {
        const file = ocrInput.files[0];
        if (!file) {
            ocrOutput.textContent = 'Please select an image file first.';
            return;
        }

        ocrOutput.textContent = '';
        ocrProgress.textContent = 'Initializing Tesseract...';

        try {
            const { createWorker } = Tesseract;
            const worker = await createWorker({
                logger: m => {
                    console.log(m);
                    ocrProgress.textContent = `${m.status} (${(m.progress * 100).toFixed(2)}%)`;
                }
            });

            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(file);
            ocrOutput.textContent = text;
            await worker.terminate();
        } catch (error) {
            console.error('OCR Error:', error);
            ocrOutput.textContent = 'An error occurred during OCR processing.';
            ocrProgress.textContent = 'Error.';
        }
    });
}