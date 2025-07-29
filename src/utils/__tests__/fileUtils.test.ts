import { validateFile, readTemplate, listFiles } from '../fileUtils';
import { FileProcessingError } from '../../middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
jest.mock('fs/promises');

describe('FileUtils', () => {
  describe('validateFile', () => {
    it('should validate file size correctly', () => {
      const buffer = Buffer.alloc(5 * 1024 * 1024); // 5MB file
      expect(() => validateFile(buffer, 'test.pdf')).not.toThrow();

      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB file
      expect(() => validateFile(largeBuffer, 'test.pdf')).toThrow(
        FileProcessingError
      );
    });

    it('should validate file type correctly', () => {
      const buffer = Buffer.alloc(1024);
      expect(() => validateFile(buffer, 'test.pdf')).not.toThrow();
      expect(() => validateFile(buffer, 'test.docx')).not.toThrow();
      expect(() => validateFile(buffer, 'test.exe')).toThrow(
        FileProcessingError
      );
    });
  });

  describe('readTemplate', () => {
    it('should read template file successfully', async () => {
      const mockContent = 'template content';
      (fs.readFile as jest.Mock).mockResolvedValue(mockContent);

      const result = await readTemplate('test.txt', '/templates');
      expect(result).toBe(mockContent);
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join('/templates', 'test.txt'),
        'utf-8'
      );
    });

    it('should throw FileProcessingError when template read fails', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(readTemplate('test.txt', '/templates')).rejects.toThrow(
        FileProcessingError
      );
    });
  });

  describe('listFiles', () => {
    it('should list files in directory', async () => {
      const mockFiles = ['file1.txt', 'file2.txt'];
      (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);

      const result = await listFiles('/test-dir');
      expect(result).toEqual(mockFiles);
      expect(fs.readdir).toHaveBeenCalledWith('/test-dir');
    });

    it('should throw FileProcessingError when directory read fails', async () => {
      (fs.readdir as jest.Mock).mockRejectedValue(
        new Error('Directory not found')
      );

      await expect(listFiles('/test-dir')).rejects.toThrow(FileProcessingError);
    });
  });
});
