// Test setup for JSDOM environment
import 'jest-dom/extend-expect';

// Mock DOM methods and objects
global.FileReader = class MockFileReader {
  constructor() {
    this.onload = null;
    this.result = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
  }

  readAsDataURL(file) {
    if (this.onload) {
      setTimeout(() => this.onload({ target: { result: this.result } }), 0);
    }
  }

  readAsText(file) {
    if (this.onload) {
      setTimeout(() => this.onload({ target: { result: 'file content' } }), 0);
    }
  }
};

// Mock CustomEvent
global.CustomEvent = class MockCustomEvent {
  constructor(type, detail) {
    this.type = type;
    this.detail = detail;
  }
};

// Mock File object
global.File = class MockFile {
  constructor(content, name, options = {}) {
    this.content = content;
    this.name = name;
    this.type = options.type || 'text/plain';
    this.size = Array.isArray(content) ? content.length : content.length;
    this.webkitRelativePath = options.webkitRelativePath || '';
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});
