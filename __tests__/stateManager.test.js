/**
 * @jest-environment jsdom
 */

import { stateManager } from '../docs/modules/stateManager.js';

describe('State Manager', () => {
  beforeEach(() => {
    // Reset state before each test
    stateManager.state = {
      selectedFiles: [],
      currentTemplate: null,
      processingMode: 'individual',
      outputFormat: 'text',
      isProcessing: false,
      results: [],
      errors: [],
    };
  });

  test('should initialize with default state', () => {
    expect(stateManager.state.selectedFiles).toEqual([]);
    expect(stateManager.state.currentTemplate).toBe(null);
    expect(stateManager.state.processingMode).toBe('individual');
    expect(stateManager.state.outputFormat).toBe('text');
    expect(stateManager.state.isProcessing).toBe(false);
    expect(stateManager.state.results).toEqual([]);
    expect(stateManager.state.errors).toEqual([]);
  });

  test('should set selected files correctly', () => {
    const files = [
      { name: 'test1.txt', content: 'content1', type: 'text/plain' },
      { name: 'test2.txt', content: 'content2', type: 'text/plain' },
    ];

    stateManager.setSelectedFiles(files);
    expect(stateManager.state.selectedFiles).toEqual(files);
  });

  test('should add files to existing selection', () => {
    const initialFiles = [{ name: 'test1.txt', content: 'content1' }];
    stateManager.setSelectedFiles(initialFiles);

    const newFiles = [
      { name: 'test2.txt', content: 'content2' },
      { name: 'test3.txt', content: 'content3' },
    ];

    stateManager.setSelectedFiles([...initialFiles, ...newFiles]);
    expect(stateManager.state.selectedFiles).toHaveLength(3);
  });

  test('should clear selected files', () => {
    stateManager.setSelectedFiles([{ name: 'test.txt', content: 'content' }]);
    stateManager.setSelectedFiles([]);
    expect(stateManager.state.selectedFiles).toEqual([]);
  });

  test('should set template correctly', () => {
    const template = { name: 'Bank Project', content: 'Template content' };
    stateManager.setCurrentTemplate(template);
    expect(stateManager.state.currentTemplate).toEqual(template);
  });

  test('should set processing mode correctly', () => {
    stateManager.setProcessingMode('combined');
    expect(stateManager.state.processingMode).toBe('combined');

    stateManager.setProcessingMode('individual');
    expect(stateManager.state.processingMode).toBe('individual');
  });

  test('should set output format correctly', () => {
    const formats = ['text', 'json', 'html', 'markdown'];

    formats.forEach(format => {
      stateManager.setOutputFormat(format);
      expect(stateManager.state.outputFormat).toBe(format);
    });
  });

  test('should set processing state correctly', () => {
    stateManager.setProcessingState(true);
    expect(stateManager.state.isProcessing).toBe(true);

    stateManager.setProcessingState(false);
    expect(stateManager.state.isProcessing).toBe(false);
  });

  test('should add results correctly', () => {
    const result = { fileName: 'test.txt', content: 'Processed content' };
    stateManager.addResult(result);
    expect(stateManager.state.results).toContain(result);
  });

  test('should add multiple results', () => {
    const results = [
      { fileName: 'test1.txt', content: 'Content 1' },
      { fileName: 'test2.txt', content: 'Content 2' },
    ];

    results.forEach(result => stateManager.addResult(result));
    expect(stateManager.state.results).toEqual(results);
  });

  test('should clear results', () => {
    stateManager.addResult({ fileName: 'test.txt', content: 'content' });
    stateManager.clearResults();
    expect(stateManager.state.results).toEqual([]);
  });

  test('should add errors correctly', () => {
    const error = { fileName: 'test.txt', error: 'Processing failed' };
    stateManager.addError(error);
    expect(stateManager.state.errors).toContain(error);
  });

  test('should clear errors', () => {
    stateManager.addError({ fileName: 'test.txt', error: 'error' });
    stateManager.clearErrors();
    expect(stateManager.state.errors).toEqual([]);
  });

  test('should get state snapshot correctly', () => {
    const snapshot = stateManager.getStateSnapshot();
    expect(snapshot).toEqual(stateManager.state);
    expect(snapshot).not.toBe(stateManager.state); // Should be a copy
  });

  test('should reset state to defaults', () => {
    stateManager.setSelectedFiles([{ name: 'test.txt', content: 'content' }]);
    stateManager.setCurrentTemplate({ name: 'template', content: 'content' });
    stateManager.setProcessingMode('combined');
    stateManager.setOutputFormat('json');
    stateManager.setProcessingState(true);
    stateManager.addResult({ fileName: 'test.txt', content: 'content' });
    stateManager.addError({ fileName: 'test.txt', error: 'error' });

    stateManager.resetState();

    expect(stateManager.state.selectedFiles).toEqual([]);
    expect(stateManager.state.currentTemplate).toBe(null);
    expect(stateManager.state.processingMode).toBe('individual');
    expect(stateManager.state.outputFormat).toBe('text');
    expect(stateManager.state.isProcessing).toBe(false);
    expect(stateManager.state.results).toEqual([]);
    expect(stateManager.state.errors).toEqual([]);
  });
});
