// docs/modules/integratedProcessor.js
import { stateManager } from './stateManager.js';
import { uiManager } from './uiManager.js';
import { errorHandler } from './errorHandler.js';

// File processing workflow for user's requirements
export class IntegratedProcessor {
  constructor() {
    this.currentFiles = [];
    this.templateFile = null;
    this.processingQueue = [];
    this.results = [];
    this.errors = [];
  }

  initialize() {
    this.setupEventListeners();
    this.setupTemplateSelection();
  }

  setupTemplateSelection() {
    const templateInput = document.getElementById('templateSelect');
    const templateBtn = document.getElementById('selectTemplateFileBtn');
    
    if (templateBtn) {
      templateBtn.addEventListener('click', () => {
        // Create a hidden file input for template selection
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'file';
        hiddenInput.accept = '.xlsx,.xls,.csv';
        hiddenInput.style.display = 'none';
        hiddenInput.addEventListener('change', (e) => {
          this.handleTemplateSelection(e.target.files);
        });
        document.body.appendChild(hiddenInput);
        hiddenInput.click();
        document.body.removeChild(hiddenInput);
      });
    }
    
    if (templateInput && templateInput.tagName === 'SELECT') {
      templateInput.addEventListener('change', (e) => {
        if (e.target.value) {
          // Handle template selection from dropdown
          this.loadTemplateFromSelection(e.target.value);
        }
      });
    }
  }

  setupEventListeners() {
    // File selection
    const fileInput = document.getElementById('fileInput');
    const folderInput = document.getElementById('folderInput');
    const templateInput = document.getElementById('template');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelection(e.target.files));
    }
    if (folderInput) {
      folderInput.addEventListener('change', (e) => this.handleFileSelection(e.target.files));
    }
    if (templateInput) {
      templateInput.addEventListener('change', (e) => this.handleTemplateSelection(e.target.files));
    }
  }

  async handleFileSelection(files) {
    this.currentFiles = Array.from(files);
    this.validateAndDisplayFiles();
  }

  async handleTemplateSelection(files) {
    if (files.length > 0) {
      const templateFile = files[0];
      if (templateFile.type.includes('excel') || templateFile.name.endsWith('.xlsx')) {
        this.templateFile = templateFile;
        await this.readTemplateFile(templateFile);
      }
    }
  }

  async readTemplateFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.templateContent = e.target.result;
        this.templateFile = file;
        uiManager.addMessage(`Template loaded: ${file.name}`, 'ai');
        resolve();
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async loadTemplateFromSelection(templateValue) {
    if (templateValue === 'custom') {
      // Trigger file selection for custom template
      const templateBtn = document.getElementById('selectTemplateFileBtn');
      if (templateBtn) templateBtn.click();
    } else {
      // Handle predefined templates
      uiManager.addMessage(`Template selected: ${templateValue}`, 'ai');
      this.templateFile = templateValue;
    }
  }

  validateAndDisplayFiles() {
    const validFiles = this.currentFiles.filter(file => this.validateFile(file));
    const fileTypes = [...new Set(validFiles.map(f => f.type.split('/')[1]))];
    
    uiManager.addMessage(`Found ${validFiles.length} valid files: ${fileTypes.join(', ')}`, 'ai');
    
    // Display file summary
    const summary = `
      <div class="file-summary">
        <h4>📁 File Summary</h4>
        <p><strong>Total Files:</strong> ${validFiles.length}</p>
        <p><strong>File Types:</strong> ${fileTypes.join(', ')}</p>
        <p><strong>Total Size:</strong> ${(validFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB</p>
      </div>
    `;
    
    uiManager.setPreviewContent(summary);
    stateManager.setSelectedFiles(validFiles);
  }

  validateFile(file) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return allowedTypes.includes(file.type) && file.size <= 50 * 1024 * 1024;
  }

  async processFiles(prompt) {
    if (this.currentFiles.length === 0) {
      uiManager.addMessage('Please select files first', 'error');
      return;
    }

    uiManager.setProcessingState(true);
    uiManager.addMessage(`Processing ${this.currentFiles.length} files with prompt: "${prompt}"`, 'user');

    try {
      this.results = [];
      this.errors = [];

      for (let i = 0; i < this.currentFiles.length; i++) {
        const file = this.currentFiles[i];
        uiManager.setProgress((i / this.currentFiles.length) * 100, `Processing ${file.name}`);
        
        try {
          const result = await this.processSingleFile(file, prompt);
          this.results.push(result);
        } catch (error) {
          this.errors.push({ file: file.name, error: error.message });
          // Ask user for approval to continue
          const continueProcessing = await this.askUserApproval(file.name, error.message);
          if (!continueProcessing) {
            break;
          }
        }
      }

      await this.generateFinalOutput();
      this.showExportOptions();
      
    } catch (error) {
      uiManager.addMessage(`Processing error: ${error.message}`, 'error');
    } finally {
      uiManager.setProcessingState(false);
    }
  }

  async processSingleFile(file, prompt) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    if (this.templateFile) {
      formData.append('template', this.templateFile);
    }

    const response = await fetch('/api/process-file', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to process ${file.name}: ${response.statusText}`);
    }

    return await response.json();
  }

  async askUserApproval(filename, error) {
    return new Promise((resolve) => {
      const message = `
        <div class="approval-request">
          <h4>⚠️ Error Processing ${filename}</h4>
          <p>Error: ${error}</p>
          <p>Do you want to continue processing remaining files?</p>
          <button onclick="window.approveContinue(true)" class="bg-green-500 text-white px-4 py-2 mr-2">Continue</button>
          <button onclick="window.approveContinue(false)" class="bg-red-500 text-white px-4 py-2">Stop</button>
        </div>
      `;
      
      uiManager.setPreviewContent(message);
      
      window.approveContinue = (approved) => {
        resolve(approved);
        delete window.approveContinue;
      };
    });
  }

  async generateFinalOutput() {
    let output = '';
    
    if (this.templateFile) {
      // Apply template formatting
      output = this.applyTemplateFormat();
    } else {
      // Generate summary format
      output = this.generateSummaryFormat();
    }

    uiManager.setPreviewContent(output);
    stateManager.addResult({ type: 'final', content: output });
  }

  applyTemplateFormat() {
    // This would integrate with the template processing
    return `
      <div class="final-output">
        <h3>📊 Final Results</h3>
        <p><strong>Total Files Processed:</strong> ${this.results.length}</p>
        <p><strong>Errors:</strong> ${this.errors.length}</p>
        
        <h4>Results:</h4>
        ${this.results.map(r => `<div>${r.content}</div>`).join('')}
        
        <h4>Errors:</h4>
        ${this.errors.map(e => `<div class="error">${e.file}: ${e.error}</div>`).join('')}
      </div>
    `;
  }

  generateSummaryFormat() {
    return `
      <div class="final-output">
        <h3>📋 Processing Summary</h3>
        <p><strong>Files Processed:</strong> ${this.results.length}</p>
        <p><strong>Success Rate:</strong> ${((this.results.length / this.currentFiles.length) * 100).toFixed(1)}%</p>
        
        ${this.results.map(result => `
          <div class="result-item">
            <h5>${result.filename}</h5>
            <p>${result.extracted_data || result.content}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  showExportOptions() {
    const exportOptions = `
      <div class="export-options">
        <h4>📤 Export Options</h4>
        <div class="flex gap-2">
          <button onclick="processor.exportAs('excel')" class="bg-green-500 text-white px-4 py-2">Excel</button>
          <button onclick="processor.exportAs('csv')" class="bg-blue-500 text-white px-4 py-2">CSV</button>
          <button onclick="processor.exportAs('pdf')" class="bg-red-500 text-white px-4 py-2">PDF</button>
          <button onclick="processor.exportAs('json')" class="bg-purple-500 text-white px-4 py-2">JSON</button>
        </div>
      </div>
    `;
    
    uiManager.setPreviewContent(uiManager.elements.previewContent.innerHTML + exportOptions);
  }

  async exportAs(format) {
    const data = {
      results: this.results,
      errors: this.errors,
      metadata: {
        totalFiles: this.currentFiles.length,
        processedFiles: this.results.length,
        timestamp: new Date().toISOString()
      }
    };

    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, data })
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-files.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
}

// Initialize the processor
export const processor = new IntegratedProcessor();

// Global process function for UI integration
window.processFiles = async (prompt) => {
  await processor.processFiles(prompt);
};