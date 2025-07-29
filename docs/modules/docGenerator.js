import { generateContent } from './geminiEngine.js';
import { exportAsPdf, exportAsDocx, exportAsTxt } from './exportManager.js';

let generatedDocument = '';

export function render(container, project) {
  container.innerHTML = `
        <h3>Document Generator</h3>
        <p>Use AI to generate a document from your files and an optional template.</p>
        <div class="doc-generator">
            <textarea id="docPrompt" placeholder="e.g., 'Generate an invoice for Client X using the invoice template and the attached project details.'"></textarea>
            <button id="generateDocBtn">Generate Document</button>
        </div>
        <h4>Generated Document</h4>
        <div id="docPreview" contenteditable="true"></div>
        <div class="export-controls">
            <button id="exportPdfBtn">Export as PDF</button>
            <button id="exportDocxBtn">Export as DOCX</button>
            <button id="exportTxtBtn">Export as TXT</button>
        </div>
    `;

  const docPromptInput = document.getElementById('docPrompt');
  const generateDocBtn = document.getElementById('generateDocBtn');
  const docPreview = document.getElementById('docPreview');
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  const exportDocxBtn = document.getElementById('exportDocxBtn');
  const exportTxtBtn = document.getElementById('exportTxtBtn');

  docPreview.style.border = '1px solid #ccc';
  docPreview.style.minHeight = '300px';
  docPreview.style.padding = '10px';
  docPreview.style.whiteSpace = 'pre-wrap'; // Preserve whitespace and newlines

  generateDocBtn.addEventListener('click', async () => {
    const prompt = docPromptInput.value.trim();
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }

    if (!project.files || project.files.length === 0) {
      alert('Please select files in the File Manager first.');
      return;
    }

    generateDocBtn.textContent = 'Generating...';
    generateDocBtn.disabled = true;

    try {
      const fullPrompt = `You are a document generation assistant. Use the user's prompt, the provided template (if any), and the attached files to create a complete document. The output should be the final document content itself, formatted appropriately. \n\nUser Prompt: ${prompt}`;
      generatedDocument = await generateContent(project, fullPrompt);
      docPreview.innerText = generatedDocument; // Use innerText to avoid rendering HTML tags as elements
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. See console for details.');
    } finally {
      generateDocBtn.textContent = 'Generate Document';
      generateDocBtn.disabled = false;
    }
  });

  exportPdfBtn.addEventListener('click', () => {
    const content = docPreview.innerText;
    if (!content) {
      alert('No document to export.');
      return;
    }
    exportAsPdf(content, 'generated_document.pdf');
  });

  exportDocxBtn.addEventListener('click', () => {
    const content = docPreview.innerText;
    if (!content) {
      alert('No document to export.');
      return;
    }
    exportAsDocx(content, 'generated_document.docx');
  });

  exportTxtBtn.addEventListener('click', () => {
    const content = docPreview.innerText;
    if (!content) {
      alert('No document to export.');
      return;
    }
    exportAsTxt(content, 'generated_document.txt');
  });
}
