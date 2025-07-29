// docs/modules/fileManager.js
import { stateManager } from './stateManager.js';

export function initializeFileSelection() {
  const selectFileBtn = document.getElementById('selectFileBtn');
  const selectFolderBtn = document.getElementById('selectFolderBtn');
  const selectedFilesDiv = document.getElementById('selectedFiles');

  if (selectFileBtn) {
    selectFileBtn.addEventListener('click', () => {
      console.log('Select File button clicked');
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.addEventListener('change', () => {
        displaySelectedFiles(input.files);
      });
      input.click();
    });
  }

  if (selectFolderBtn) {
    selectFolderBtn.addEventListener('click', () => {
      console.log('Select Folder button clicked');
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.directory = true;
      input.multiple = true;
      input.addEventListener('change', () => {
        displaySelectedFiles(input.files);
      });
      input.click();
    });
  }

  function validateFile(file) {
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

  function displaySelectedFiles(files) {
    selectedFilesDiv.innerHTML = ''; // Clear previous selections
    stateManager.setSelectedFiles([]);

    // Filter and validate files
    const validFiles = Array.from(files).filter(validateFile);

    if (validFiles.length === 0) {
      const errorMsg = document.createElement('p');
      errorMsg.className = 'error-message';
      errorMsg.textContent =
        'No valid files selected. Please check file types and sizes.';
      selectedFilesDiv.appendChild(errorMsg);
      return;
    }

    if (validFiles.length > 0) {
      const countHeader = document.createElement('p');
      countHeader.textContent = `${validFiles.length} file(s) selected:`;
      selectedFilesDiv.appendChild(countHeader);

      const list = document.createElement('ul');
      for (const file of validFiles) {
        const item = document.createElement('li');
        item.textContent = file.webkitRelativePath || file.name;

        // Add template selection dropdown for each file
        const templateSelect = document.createElement('select');
        templateSelect.className = 'template-select';
        templateSelect.dataset.fileName = file.name;

        // Add default options
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select template';
        templateSelect.appendChild(defaultOption);

        const bankOption = document.createElement('option');
        bankOption.value = 'bank';
        bankOption.textContent = 'Bank Project';
        templateSelect.appendChild(bankOption);

        const billOption = document.createElement('option');
        billOption.value = 'bill';
        billOption.textContent = 'Bill Entry';
        templateSelect.appendChild(billOption);

        const docOption = document.createElement('option');
        docOption.value = 'document';
        docOption.textContent = 'Company Document';
        templateSelect.appendChild(docOption);

        item.appendChild(templateSelect);
        list.appendChild(item);
        readFile(file);
      }
      selectedFilesDiv.appendChild(list);
    }
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const currentFiles = stateManager.state.selectedFiles;
      stateManager.setSelectedFiles([
        ...currentFiles,
        {
          name: file.name,
          content: e.target.result.split(',')[1], // Get base64 content
          type: file.type,
          path: file.webkitRelativePath || file.name,
          rawContent: e.target.result,
          size: file.size,
          validated: true,
        },
      ]);

      // Process file content directly without uploading
      processFileLocally({
        name: file.name,
        content: e.target.result,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  }

  function processFileLocally(fileData) {
    // Process file content directly on client side
    console.log('Processing file locally:', fileData.name);

    // Here you would add your specific processing logic
    // For example: text extraction, data parsing, etc.

    // Dispatch event to notify other components
    const event = new CustomEvent('fileProcessed', {
      detail: { fileName: fileData.name },
    });
    document.dispatchEvent(event);
  }
}
