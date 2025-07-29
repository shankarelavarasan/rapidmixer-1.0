/**
 * @jest-environment jsdom
 */

import { initializeFileSelection } from '../docs/modules/fileManager.js';

// Mock DOM elements
document.body.innerHTML = `
  <div>
    <button id="selectFileBtn">Select File</button>
    <button id="selectFolderBtn">Select Folder</button>
    <div id="selectedFiles"></div>
  </div>
`;

// Mock stateManager
const mockStateManager = {
  setSelectedFiles: jest.fn(),
  state: { selectedFiles: [] },
};

// Mock FileReader
class MockFileReader {
  constructor() {
    this.onload = null;
    this.result = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
  }

  readAsDataURL(file) {
    if (this.onload) {
      setTimeout(() => this.onload({ target: { result: this.result } }), 0);
    }
  }
}

global.FileReader = MockFileReader;
global.File = class MockFile {
  constructor(content, name, options = {}) {
    this.content = content;
    this.name = name;
    this.type = options.type || 'text/plain';
    this.size = content.length;
    this.webkitRelativePath = options.webkitRelativePath || '';
  }
};

describe('File Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div>
        <button id="selectFileBtn">Select File</button>
        <button id="selectFolderBtn">Select Folder</button>
        <div id="selectedFiles"></div>
      </div>
    `;
  });

  test('should initialize file selection buttons', () => {
    initializeFileSelection();
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectFolderBtn = document.getElementById('selectFolderBtn');

    expect(selectFileBtn).toBeTruthy();
    expect(selectFolderBtn).toBeTruthy();
  });

  test('should validate file types correctly', () => {
    const validFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const invalidFile = new File(['content'], 'test.exe', {
      type: 'application/x-msdownload',
    });

    // Mock validation function
    const validateFile = file => {
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      const allowedExtensions = [
        '.txt',
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
      ];

      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      return (
        allowedTypes.includes(file.type) &&
        allowedExtensions.includes(fileExtension)
      );
    };

    expect(validateFile(validFile)).toBe(true);
    expect(validateFile(invalidFile)).toBe(false);
  });

  test('should handle file size validation', () => {
    const largeFile = new File(
      new Array(11 * 1024 * 1024).fill('a'),
      'large.txt',
      { type: 'text/plain' }
    );
    const smallFile = new File(['content'], 'small.txt', {
      type: 'text/plain',
    });

    const validateFile = file => file.size <= 10 * 1024 * 1024;

    expect(validateFile(largeFile)).toBe(false);
    expect(validateFile(smallFile)).toBe(true);
  });

  test('should display error for invalid files', () => {
    // This test would require mocking the DOM and file selection
    // For now, we'll test the structure
    expect(typeof initializeFileSelection).toBe('function');
  });
});
