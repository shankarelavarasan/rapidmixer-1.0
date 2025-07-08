// This module will handle document generation (e.g., PDF, HTML)

export function render(container, project) {
    if (!project) {
        container.innerHTML = '<h3>Document Generator</h3><p>Please select a project to generate documents.</p>';
        return;
    }

    container.innerHTML = `
        <h3>Document Generator for ${project.name}</h3>
        <p>Enter your content below and click 'Generate PDF' to create a document.</p>
        <textarea id="docContent" rows="15" style="width: 95%;"></textarea>
        <br>
        <button id="generatePdfBtn">Generate PDF</button>
        <button id="generateHtmlBtn">Generate HTML</button>
    `;

    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const generateHtmlBtn = document.getElementById('generateHtmlBtn');
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
            alert('Error: jsPDF library not found. Make sure it is loaded.');
        }
    });

    generateHtmlBtn.addEventListener('click', () => {
        const content = docContent.value;
        if (!content.trim()) {
            alert('Please enter some content for the document.');
            return;
        }
        // In a real implementation, you would create an HTML file
        alert(`Generating HTML with content: ${content}`);
    });
}