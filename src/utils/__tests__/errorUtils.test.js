/**
 * Tests for error utilities
 */
import { jest } from '@jest/globals';
import {
  withErrorHandling,
  validateParams,
} from '../../../utils/errorUtils.js';
import {
  FileProcessingError,
  TemplateError,
} from '../../../middleware/errorHandler.js';

describe('Error Utilities', () => {
  describe('withErrorHandling', () => {
    test('should pass through successful function results', async () => {
      // Setup
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = withErrorHandling(mockFn);

      // Execute
      const result = await wrappedFn('arg1', 'arg2');

      // Verify
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('success');
    });

    test('should handle errors and add context', async () => {
      // Setup
      const mockError = new Error('Original error');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockConsoleError = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const wrappedFn = withErrorHandling(mockFn, {
        context: 'test operation',
        defaultMessage: 'Default error message',
      });

      // Execute & Verify
      await expect(wrappedFn()).rejects.toThrow();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error in test operation:',
        mockError
      );

      // Restore console.error
      mockConsoleError.mockRestore();
    });

    test('should pass through FileProcessingError without wrapping', async () => {
      // Setup
      const originalError = new FileProcessingError('File error');
      const mockFn = jest.fn().mockRejectedValue(originalError);
      const wrappedFn = withErrorHandling(mockFn);

      // Execute & Verify
      await expect(wrappedFn()).rejects.toThrow(FileProcessingError);
      await expect(wrappedFn()).rejects.toThrow('File error');
    });

    test('should convert errors to FileProcessingError when context includes "file"', async () => {
      // Setup
      const originalError = new Error('Generic error');
      const mockFn = jest.fn().mockRejectedValue(originalError);
      const wrappedFn = withErrorHandling(mockFn, {
        context: 'file processing',
        defaultMessage: 'File processing failed',
      });

      // Execute & Verify
      await expect(wrappedFn()).rejects.toThrow(FileProcessingError);
      await expect(wrappedFn()).rejects.toThrow('Generic error');
    });

    test('should use default message when error has no message', async () => {
      // Setup
      const originalError = new Error();
      originalError.message = ''; // Empty message
      const mockFn = jest.fn().mockRejectedValue(originalError);
      const wrappedFn = withErrorHandling(mockFn, {
        context: 'file processing',
        defaultMessage: 'Default file error',
      });

      // Execute & Verify
      await expect(wrappedFn()).rejects.toThrow('Default file error');
    });

    test('should call onError callback if provided', async () => {
      // Setup
      const mockError = new Error('Original error');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockOnError = jest.fn().mockReturnValue('error handled');

      const wrappedFn = withErrorHandling(mockFn, {
        onError: mockOnError,
      });

      // Execute
      const result = await wrappedFn();

      // Verify
      expect(mockOnError).toHaveBeenCalledWith(mockError);
      expect(result).toBe('error handled');
    });
  });

  describe('validateParams', () => {
    test('should not throw error when all required params are present', () => {
      // Setup
      const params = { a: 1, b: 2, c: 3 };
      const required = ['a', 'b'];

      // Execute & Verify
      expect(() => validateParams(params, required)).not.toThrow();
    });

    test('should throw error when required params are missing', () => {
      // Setup
      const params = { a: 1 };
      const required = ['a', 'b', 'c'];

      // Execute & Verify
      expect(() => validateParams(params, required)).toThrow(
        'Missing required parameters: b, c'
      );
    });

    test('should handle empty required array', () => {
      // Setup
      const params = {};
      const required = [];

      // Execute & Verify
      expect(() => validateParams(params, required)).not.toThrow();
    });

    test('should handle falsy values correctly', () => {
      // Setup
      const params = { a: 0, b: '', c: false, d: null, e: undefined };
      const required = ['a', 'b', 'c', 'd', 'e'];

      // Execute & Verify
      expect(() => validateParams(params, required)).toThrow(
        'Missing required parameters: d, e'
      );
    });
  });
});
