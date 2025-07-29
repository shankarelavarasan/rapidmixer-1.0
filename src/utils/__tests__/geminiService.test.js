const {
  getGeminiModel,
  generateContent,
  processBatch,
} = require('../../../services/geminiService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { FileProcessingError } = require('../../../utils/errorUtils');

// Mock dependencies
jest.mock('@google/generative-ai');

describe('geminiService', () => {
  let mockModel;
  let mockGenerateContent;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock for GoogleGenerativeAI
    mockGenerateContent = jest.fn();
    mockModel = {
      generateContent: mockGenerateContent,
    };

    const mockGetGenerativeModel = jest.fn().mockReturnValue(mockModel);
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    }));
  });

  describe('getGeminiModel', () => {
    it('should return a Gemini model instance', () => {
      // Act
      const result = getGeminiModel();

      // Assert
      expect(result).toBe(mockModel);
      expect(GoogleGenerativeAI).toHaveBeenCalled();
    });

    it('should use the API key from environment variables', () => {
      // Arrange
      const originalEnv = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'test-api-key';

      // Act
      getGeminiModel();

      // Assert
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');

      // Cleanup
      process.env.GEMINI_API_KEY = originalEnv;
    });
  });

  describe('generateContent', () => {
    it('should call model.generateContent with the provided prompt', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const mockResponse = {
        response: {
          text: () => 'Generated content',
        },
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      // Act
      const result = await generateContent(mockModel, prompt);

      // Assert
      expect(result).toBe('Generated content');
      expect(mockGenerateContent).toHaveBeenCalledWith(prompt);
    });

    it('should handle errors from the Gemini API', async () => {
      // Arrange
      const prompt = 'Test prompt';
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      // Act & Assert
      await expect(generateContent(mockModel, prompt)).rejects.toThrow(
        'Error generating content: API error'
      );
    });
  });

  describe('processBatch', () => {
    it('should process multiple files and return responses', async () => {
      // Arrange
      const model = mockModel;
      const prompt = 'Test prompt';
      const files = [
        { name: 'file1.txt', content: 'File 1 content' },
        { name: 'file2.txt', content: 'File 2 content' },
      ];

      const mockResponse1 = {
        response: {
          text: () => 'Response for file1',
        },
      };

      const mockResponse2 = {
        response: {
          text: () => 'Response for file2',
        },
      };

      // Setup mock to return different responses for different calls
      mockGenerateContent
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      // Act
      const result = await processBatch(model, prompt, files);

      // Assert
      expect(result).toEqual([
        { file: 'file1.txt', response: 'Response for file1' },
        { file: 'file2.txt', response: 'Response for file2' },
      ]);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should handle errors for individual files', async () => {
      // Arrange
      const model = mockModel;
      const prompt = 'Test prompt';
      const files = [
        { name: 'file1.txt', content: 'File 1 content' },
        { name: 'file2.txt', content: 'File 2 content' },
      ];

      const mockResponse = {
        response: {
          text: () => 'Response for file1',
        },
      };

      // First call succeeds, second call fails
      mockGenerateContent
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('API error for file2'));

      // Act
      const result = await processBatch(model, prompt, files);

      // Assert
      expect(result).toEqual([
        { file: 'file1.txt', response: 'Response for file1' },
        {
          file: 'file2.txt',
          response: 'Error processing file: API error for file2',
        },
      ]);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should return empty array if no files are provided', async () => {
      // Arrange
      const model = mockModel;
      const prompt = 'Test prompt';
      const files = [];

      // Act
      const result = await processBatch(model, prompt, files);

      // Assert
      expect(result).toEqual([]);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });
  });
});
