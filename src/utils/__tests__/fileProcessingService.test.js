/**
 * Tests for file processing service
 */
import { jest } from '@jest/globals';
import { extractText } from '../../../services/fileProcessingService.js';
import { FileProcessingError } from '../../../middleware/errorHandler.js';

// Mock dependencies
jest.mock('pdf-parse', () => jest.fn());
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_csv: jest.fn()
  }
}));
jest.mock('mammoth', () => ({
  extractRawText: jest.fn()
}));
jest.mock('../../../utils/fileUtils.js', () => ({
  validateFile: jest.fn()
}));

// Import mocked modules
import pdf from 'pdf-parse';
import XLSX from 'xlsx';
import mammoth from 'mammoth';
import { validateFile } from '../../../utils/fileUtils.js';

describe('File Processing Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('extractText', () => {
    test('should handle PDF files correctly', async () => {
      // Setup
      const mockPdfText = 'Extracted PDF text';
      pdf.mockResolvedValue({ text: mockPdfText });
      
      const file = {
        name: 'test.pdf',
        content: Buffer.from('test content').toString('base64')
      };

      // Execute
      const result = await extractText(file);

      // Verify
      expect(validateFile).toHaveBeenCalled();
      expect(pdf).toHaveBeenCalled();
      expect(result).toBe(mockPdfText);
    });

    test('should handle Excel files correctly', async () => {
      // Setup
      const mockSheetData = 'Sheet1 data';
      XLSX.read.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} }
      });
      XLSX.utils.sheet_to_csv.mockReturnValue(mockSheetData);
      
      const file = {
        name: 'test.xlsx',
        content: Buffer.from('test content').toString('base64')
      };

      // Execute
      const result = await extractText(file);

      // Verify
      expect(validateFile).toHaveBeenCalled();
      expect(XLSX.read).toHaveBeenCalled();
      expect(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
      expect(result).toBe(mockSheetData);
    });

    test('should handle Word files correctly', async () => {
      // Setup
      const mockWordText = 'Extracted Word text';
      mammoth.extractRawText.mockResolvedValue({ value: mockWordText });
      
      const file = {
        name: 'test.docx',
        content: Buffer.from('test content').toString('base64')
      };

      // Execute
      const result = await extractText(file);

      // Verify
      expect(validateFile).toHaveBeenCalled();
      expect(mammoth.extractRawText).toHaveBeenCalled();
      expect(result).toBe(mockWordText);
    });

    test('should handle text files correctly', async () => {
      // Setup
      const textContent = 'Plain text content';
      const file = {
        name: 'test.txt',
        content: Buffer.from(textContent).toString('base64')
      };

      // Execute
      const result = await extractText(file);

      // Verify
      expect(validateFile).toHaveBeenCalled();
      expect(result).toBe(textContent);
    });

    test('should handle image files correctly', async () => {
      // Setup
      const file = {
        name: 'test.jpg',
        content: Buffer.from('image data').toString('base64')
      };

      // Execute
      const result = await extractText(file);

      // Verify
      expect(validateFile).not.toHaveBeenCalled(); // Skip validation for images
      expect(result).toBeNull(); // Should return null for images
    });

    test('should throw FileProcessingError for unsupported file types', async () => {
      // Setup
      const file = {
        name: 'test.xyz',
        content: Buffer.from('unknown content').toString('base64')
      };

      // Execute & Verify
      await expect(extractText(file)).rejects.toThrow(FileProcessingError);
      expect(validateFile).toHaveBeenCalled();
    });

    test('should handle PDF parsing errors correctly', async () => {
      // Setup
      pdf.mockRejectedValue(new Error('PDF parsing failed'));
      
      const file = {
        name: 'test.pdf',
        content: Buffer.from('test content').toString('base64')
      };

      // Execute & Verify
      await expect(extractText(file)).rejects.toThrow(FileProcessingError);
      expect(validateFile).toHaveBeenCalled();
      expect(pdf).toHaveBeenCalled();
    });
  });
});