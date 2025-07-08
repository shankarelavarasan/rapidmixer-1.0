// This module will handle document generation (e.g., PDF, DOCX, TXT)
import { askGemini } from './gemini.js';

export function render(container, project) {
    if (!project) {
        container.innerHTML = '<h3>Document Generator</h3><p>Please select a project to generate documents.</p>';
        return;
    }

    container.innerHTML = `
        <h3>Document Generator for ${project.name}</h3>
        <p>Select a template from the Template Manager, then provide a prompt to generate the document.</p>
        <textarea id="docPrompt" placeholder="Enter a prompt for document generation... e.g., 'Create a summary report based on the provided files using the selected template.'" rows="5" style="width: 95%;"></textarea>
        <br>
        <button id="generateDocBtn">Generate Document</button>
        <hr>
        <h4>Generated Document:</h4>
        <div id="docOutput" style="border: 1px solid #ccc; padding: 10px; min-height: 200px; width: 95%;"></div>
        <br>
        <button id="exportPdfBtn">Export as PDF</button>
        <button id="exportDocxBtn">Export as DOCX</button>
        <button id="exportTxtBtn">Export as TXT</button>
    `;

    const generateDocBtn = document.getElementById('generateDocBtn');
    const docPrompt = document.getElementById('docPrompt');
    const docOutput = document.getElementById('docOutput');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportDocxBtn = document.getElementById('exportDocxBtn');
    const exportTxtBtn = document.getElementById('exportTxtBtn');

    let generatedContent = '';

    generateDocBtn.addEventListener('click', async () => {
        const prompt = docPrompt.value.trim();
        const templateContent = project.selectedTemplate?.content; // Assuming templateManager sets this
        const templateName = project.selectedTemplate?.name || 'the provided template';

        if (!prompt) {
            alert('Please enter a prompt.');
            return;
        }
        if (!templateContent) {
            alert('Please select a template from the Template Manager first.');
            return;
        }
        if (!project.files || project.files.length === 0) {
            alert('Please add files to the project first.');
            return;
        }

        docOutput.innerHTML = 'Generating document...';

        try {
            const filesData = await Promise.all(project.files.map(async (file) => ({
                name: file.name,
                content: await file.text(), // Assuming text-based files for now
            })));

            const fullPrompt = `
                User Prompt: "${prompt}"

                Template (${templateName}):
                ---
                ${templateContent}
                ---

                Files:
                ${filesData.map(f => `--- File: ${f.name} ---\n${f.content}`).join('\n\n')}

                Instruction: Based on the user prompt, fill the provided template using information from the files. Output only the final, filled document content.
            `;

            generatedContent = await askGemini(fullPrompt);
            docOutput.innerHTML = generatedContent; // Display as HTML, assuming Gemini can return basic HTML

        } catch (error) {
            console.error('Document Generation Error:', error);
            docOutput.textContent = 'An error occurred during document generation.';
        }
    });

    exportPdfBtn.addEventListener('click', () => {
        if (!generatedContent.trim()) {
            alert('Please generate the document first.');
            return;
        }
        if (window.jspdf) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(docOutput.innerText, 10, 10);
            doc.save(`${project.name}_document.pdf`);
        } else {
            alert('Error: jsPDF library not found.');
        }
    });

    exportDocxBtn.addEventListener('click', () => {
        if (!generatedContent.trim()) {
            alert('Please generate the document first.');
            return;
        }
        if (window.docx) {
             const { Document, Packer, Paragraph, TextRun } = docx;
             const doc = new Document({
                 sections: [{
                     properties: {},
                     children: [
                         new Paragraph({
                             children: generatedContent.split('\n').map(line => new TextRun({text: line, break: 1}))
                         }),
                     ],
                 }],
             });

             Packer.toBlob(doc).then(blob => {
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `${project.name}_document.docx`;
                 a.click();
                 URL.revokeObjectURL(url);
             });
        } else {
            alert('Error: docx library not found.');
        }
    });

    exportTxtBtn.addEventListener('click', () => {
        if (!generatedContent.trim()) {
            alert('Please generate the document first.');
            return;
        }
        const blob = new Blob([docOutput.innerText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}_document.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });
}