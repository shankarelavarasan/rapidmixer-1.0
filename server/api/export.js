// server/api/export.js
import express from 'express';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs';

const router = express.Router();

router.post('/export', async (req, res) => {
  try {
    const { format, data } = req.body;

    if (!format || !data) {
      return res.status(400).json({ error: 'Format and data are required' });
    }

    switch (format.toLowerCase()) {
      case 'excel':
        return exportExcel(data, res);
      case 'csv':
        return exportCSV(data, res);
      case 'pdf':
        return exportPDF(data, res);
      case 'json':
        return exportJSON(data, res);
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

function exportExcel(data, res) {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Create summary sheet
    const summaryData = [
      ['Processing Summary', ''],
      ['Total Files', data.metadata?.totalFiles || 0],
      ['Processed Files', data.metadata?.processedFiles || 0],
      ['Success Rate', `${((data.results?.length / (data.metadata?.totalFiles || 1)) * 100).toFixed(1)}%`],
      ['Timestamp', data.metadata?.timestamp || new Date().toISOString()]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create results sheet
    if (data.results && data.results.length > 0) {
      const resultsData = data.results.map(result => ({
        Filename: result.filename,
        Content: result.content?.substring(0, 500) || '',
        Extracted_Data: JSON.stringify(result.extracted_data || {}),
        Processed_At: result.processed_at || new Date().toISOString()
      }));
      
      const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
      XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Results');
    }

    // Create errors sheet
    if (data.errors && data.errors.length > 0) {
      const errorsData = data.errors.map(error => ({
        Filename: error.file,
        Error: error.error,
        Timestamp: new Date().toISOString()
      }));
      
      const errorsSheet = XLSX.utils.json_to_sheet(errorsData);
      XLSX.utils.book_append_sheet(workbook, errorsSheet, 'Errors');
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="processed-files.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    throw new Error(`Excel export failed: ${error.message}`);
  }
}

function exportCSV(data, res) {
  try {
    let csvContent = 'Filename,Content,Extracted_Data,Processed_At\n';
    
    if (data.results && data.results.length > 0) {
      data.results.forEach(result => {
        const row = [
          result.filename || '',
          `"${(result.content || '').replace(/"/g, '""')}"`,
          `"${JSON.stringify(result.extracted_data || {}).replace(/"/g, '""')}"`,
          result.processed_at || new Date().toISOString()
        ].join(',');
        csvContent += row + '\n';
      });
    }

    res.setHeader('Content-Disposition', 'attachment; filename="processed-files.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvContent);
  } catch (error) {
    throw new Error(`CSV export failed: ${error.message}`);
  }
}

function exportJSON(data, res) {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    
    res.setHeader('Content-Disposition', 'attachment; filename="processed-files.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonContent);
  } catch (error) {
    throw new Error(`JSON export failed: ${error.message}`);
  }
}

function exportPDF(data, res) {
  try {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Disposition', 'attachment; filename="processed-files.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).text('File Processing Report', 50, 50);
    doc.moveDown();
    
    // Summary
    doc.fontSize(14).text('Summary', 50, 100);
    doc.fontSize(12);
    doc.text(`Total Files: ${data.metadata?.totalFiles || 0}`);
    doc.text(`Processed Files: ${data.metadata?.processedFiles || 0}`);
    doc.text(`Success Rate: ${((data.results?.length / (data.metadata?.totalFiles || 1)) * 100).toFixed(1)}%`);
    doc.text(`Timestamp: ${data.metadata?.timestamp || new Date().toISOString()}`);
    doc.moveDown();
    
    // Results
    if (data.results && data.results.length > 0) {
      doc.fontSize(14).text('Results');
      doc.moveDown();
      
      data.results.forEach((result, index) => {
        doc.fontSize(12).text(`${index + 1}. ${result.filename}`);
        doc.fontSize(10).text(`Content: ${(result.content || '').substring(0, 200)}...`);
        doc.text(`Extracted Data: ${JSON.stringify(result.extracted_data || {}).substring(0, 200)}...`);
        doc.moveDown();
      });
    }
    
    // Errors
    if (data.errors && data.errors.length > 0) {
      doc.fontSize(14).text('Errors');
      doc.moveDown();
      
      data.errors.forEach((error, index) => {
        doc.fontSize(12).text(`${index + 1}. ${error.file}`);
        doc.fontSize(10).text(`Error: ${error.error}`);
        doc.moveDown();
      });
    }
    
    doc.end();
  } catch (error) {
    throw new Error(`PDF export failed: ${error.message}`);
  }
}

export default router;