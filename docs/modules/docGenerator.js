// This module will handle document generation (e.g., PDF, HTML)

export function render(container, project) {
    container.innerHTML = `
        <h3>Document Generator</h3>
        <p>Enter your content below and click 'Generate PDF' to create a document.</p>
        <textarea id="docContent" rows="15" style="width: 95%;"></textarea>
        <br>
        <button id="generatePdfBtn">Generate PDF</button>
    `;

    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const docContent = document.getElementById('docContent');

    generatePdfBtn.addEventListener('click', () => {
        const content = docContent.value;
        if (!content.trim()) {
            alert('Please enter some content for the document.');
            return;
        }

        // Ensure jsPDF is loaded
        if (window.jspdf) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.text(content, 10, 10);
            doc.save(`${project.name}_document.pdf`);
        } else {
            alert('Error: jsPDF library not found.');
        }
    });
}

export function render(container, project) {
    container.innerHTML = `
        <h2>Document Generator for ${project.name}</h2>
        <p>Enter content below to generate a PDF.</p>
        <textarea id="doc-content" rows="20" style="width: 100%;"></textarea>
        <button id="generate-pdf-btn">Generate PDF</button>
    `;

    const docContent = document.getElementById('doc-content');
    const generateBtn = document.getElementById('generate-pdf-btn');

    generateBtn.addEventListener('click', () => {
        const content = docContent.value;
        if (!content) {
            alert('Please enter some content.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text(content, 10, 10);
        doc.save('document.pdf');
    });
}

export function render(project) {
    const moduleView = document.getElementById('moduleView');
    moduleView.innerHTML = `
        <h2>Document Generator for ${project.name}</h2>
        <textarea id="doc-content" placeholder="Enter content for the document..."></textarea>
        <button id="generate-pdf-btn">Generate PDF</button>
        <button id="generate-html-btn">Generate HTML</button>
    `;

    const contentArea = document.getElementById('doc-content');
    const pdfBtn = document.getElementById('generate-pdf-btn');
    const htmlBtn = document.getElementById('generate-html-btn');

    pdfBtn.addEventListener('click', () => {
        const content = contentArea.value;
        if (!content) {
            alert('Please enter some content.');
            return;
        }
        // In a real implementation, you would use a library like jsPDF
        alert(`Generating PDF with content: ${content}`);
    });

    htmlBtn.addEventListener('click', () => {
        const content = contentArea.value;
        if (!content) {
            alert('Please enter some content.');
            return;
        }
        // In a real implementation, you would create an HTML file
        alert(`Generating HTML with content: ${content}`);
    });
}