import { stateManager } from './stateManager.js';

// File validation constants
const FILE_VALIDATION = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedExtensions: ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.doc', '.docx'],
};

export function initializeFileSelection() {
  const fileInput = document.getElementById('fileInput');
  const folderInput = document.getElementById('folderInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  const folderStats = document.getElementById('folderStats');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const selectFolderBtn = document.getElementById('selectFolderBtn');

  if (!fileInput || !folderInput || !selectedFilesDiv || !selectFileBtn || !selectFolderBtn) {
    console.error('Required file selection elements not found');
    return;
  }

  // Button click events to trigger file inputs
  selectFileBtn.addEventListener('click', () => fileInput.click());
  selectFolderBtn.addEventListener('click', () => folderInput.click());

  // File selection events - only bind once
  fileInput.addEventListener('change', (e) => {
    console.log('File input changed');
    displaySelectedFiles(e.target.files);
  });

  folderInput.addEventListener('change', (e) => {
    console.log('Folder input changed');
    displaySelectedFiles(e.target.files);
    updateFolderStats(e.target.files);
  });

  function validateFile(file) {
    // Check file size
    if (file.size > FILE_VALIDATION.maxFileSize) {
      return {
        valid: false,
        error: `File ${file.name} exceeds 50MB limit`
      };
    }

    // Check file type
    if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
      // Check by extension if MIME type is not reliable
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!FILE_VALIDATION.allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `File ${file.name} has unsupported format`
        };
      }
    }

    return { valid: true };
  }

  function displaySelectedFiles(files) {
    if (!files || files.length === 0) return;

    selectedFilesDiv.innerHTML = '';
    const filesArray = Array.from(files);
    
    filesArray.forEach(file => {
      const validation = validateFile(file);
      
      const fileElement = document.createElement('div');
      fileElement.className = `file-item ${validation.valid ? 'valid' : 'invalid'}`;
      fileElement.innerHTML = `
        <div class="file-info">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${formatFileSize(file.size)}</span>
          ${!validation.valid ? `<span class="error">${validation.error}</span>` : ''}
        </div>
        <button class="remove-file" data-name="${file.name}">×</button>
      `;
      
      selectedFilesDiv.appendChild(fileElement);
    });

    // Update state
    stateManager.setState('selectedFiles', filesArray);
  }

  function updateFolderStats(files) {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const totalSize = filesArray.reduce((sum, file) => sum + file.size, 0);
    const validFiles = filesArray.filter(file => validateFile(file).valid);

    folderStats.innerHTML = `
      <div class="stats-grid">
        <div class="stat">
          <span class="label">Total Files:</span>
          <span class="value">${filesArray.length}</span>
        </div>
        <div class="stat">
          <span class="label">Valid Files:</span>
          <span class="value">${validFiles.length}</span>
        </div>
        <div class="stat">
          <span class="label">Total Size:</span>
          <span class="value">${formatFileSize(totalSize)}</span>
        </div>
      </div>
    `;

    stateManager.setState('folderStats', {
      totalFiles: filesArray.length,
      validFiles: validFiles.length,
      totalSize: totalSize
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Initialize
  console.log('File selection initialized successfully');
}

// Export for backward compatibility
export default initializeFileSelection;