// This module handles exporting content to various formats

export function exportAsPdf(content, filename = 'document.pdf') {
    if (window.jspdf) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(content, 10, 10);
        doc.save(filename);
    } else {
        alert('Error: jsPDF library not found.');
    }
}

export function exportAsDocx(content, filename = 'document.docx') {
    if (window.docx) {
        const { Document, Packer, Paragraph, TextRun } = window.docx;
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        children: content.split('\n').map(line => new TextRun({ text: line, break: 1 }))
                    }),
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    } else {
        alert('Error: docx library not found.');
    }
}

export function exportAsTxt(content, filename = 'document.txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// No render function needed for this module as it's a utility.