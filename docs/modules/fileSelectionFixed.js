// Fixed version of initializeFileSelection function
// This fixes the issues in the provided broken code

import { getApiConfig } from '../config/api.js';

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
  // Get DOM elements (fixed duplicate variable declarations)
  const fileInput = document.getElementById('fileInput');
  const folderInput = document.getElementById('folderInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  const folderStats = document.getElementById('folderStats');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const selectFolderBtn = document.getElementById('selectFolderBtn');

  // Validate all required elements exist
  if (!fileInput || !folderInput || !selectedFilesDiv || !selectFileBtn || !selectFolderBtn) {
    console.error('Required file selection elements not found');
    return;
  }

  // Button click events to trigger file inputs
  selectFileBtn.addEventListener('click', () => fileInput.click());
  selectFolderBtn.addEventListener('click', () => folderInput.click());

  // File selection events (removed duplicate listeners)
  fileInput.addEventListener('change', (e) => {
    console.log('File input changed');
    displaySelectedFiles(e.target.files);
  });

  folderInput.addEventListener('change', (e) => {
    console.log('Folder input changed');
    displaySelectedFiles(e.target.files);
    updateFolderStats(e.target.files);
  });
}

// Fixed validateFile function (was incomplete in provided code)
export function validateFile(file) {
  // Check file size
  if (file.size > FILE_VALIDATION.maxFileSize) {
    console.warn(
      `File ${file.name} exceeds size limit (${file.size} > ${FILE_VALIDATION.maxFileSize})`
    );
    return false;
  }

  // Check file type
  if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
    console.warn(`File ${file.name} has unsupported type: ${file.type}`);
    return false;
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!FILE_VALIDATION.allowedExtensions.includes(fileExtension)) {
    console.warn(
      `File ${file.name} has unsupported extension: ${fileExtension}`
    );
    return false;
  }

  return true;
}

// Helper functions for displaying files and stats
function displaySelectedFiles(files) {
  if (!files || files.length === 0) return;
  
  const validFiles = Array.from(files).filter(validateFile);
  console.log(`Selected ${files.length} files, ${validFiles.length} valid`);
  
  // Implementation would go here to display files in UI
  // This is a placeholder for the actual display logic
}

function updateFolderStats(files) {
  if (!files || files.length === 0) return;
  
  const validFiles = Array.from(files).filter(validateFile);
  const totalFiles = files.length;
  const validCount = validFiles.length;
  
  console.log(`Folder stats: ${totalFiles} total, ${validCount} valid`);
  
  // Implementation would go here to update folder statistics
  // This is a placeholder for the actual stats update logic
}

// Get current API configuration
export function getCurrentApiConfig() {
  return getApiConfig();
}