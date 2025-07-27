const { getTemplate, applyTemplate, listTemplates } = require('../../../services/templateService');
const { FileProcessingError, TemplateError } = require('../../../utils/errorUtils');
const fs = require('fs');
const path = require('path');
const templateCache = require('../../../utils/cacheManager');

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('../../../utils/cacheManager');

describe('templateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplate', () => {
    it('should return template from cache if available', async () => {
      // Arrange
      const templateId = 'test-template';
      const templateContent = 'This is a test template';
      templateCache.get.mockReturnValue(templateContent);

      // Act
      const result = await getTemplate(templateId);

      // Assert
      expect(result).toBe(templateContent);
      expect(templateCache.get).toHaveBeenCalledWith(templateId);
      expect(fs.promises.readFile).not.toHaveBeenCalled();
    });

    it('should read template from file if not in cache', async () => {
      // Arrange
      const templateId = 'test-template';
      const templateContent = 'This is a test template';
      templateCache.get.mockReturnValue(null);
      path.join.mockReturnValue('/path/to/template.txt');
      fs.promises.readFile.mockResolvedValue(Buffer.from(templateContent));

      // Act
      const result = await getTemplate(templateId);

      // Assert
      expect(result).toBe(templateContent);
      expect(templateCache.get).toHaveBeenCalledWith(templateId);
      expect(fs.promises.readFile).toHaveBeenCalledWith('/path/to/template.txt', 'utf8');
      expect(templateCache.set).toHaveBeenCalledWith(templateId, templateContent);
    });

    it('should throw TemplateError if template file cannot be read', async () => {
      // Arrange
      const templateId = 'test-template';
      templateCache.get.mockReturnValue(null);
      path.join.mockReturnValue('/path/to/template.txt');
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));

      // Act & Assert
      await expect(getTemplate(templateId)).rejects.toThrow(TemplateError);
      expect(templateCache.get).toHaveBeenCalledWith(templateId);
      expect(fs.promises.readFile).toHaveBeenCalledWith('/path/to/template.txt', 'utf8');
      expect(templateCache.set).not.toHaveBeenCalled();
    });
  });

  describe('applyTemplate', () => {
    it('should replace placeholders in template with values', async () => {
      // Arrange
      const templateId = 'test-template';
      const templateContent = 'Hello {{name}}, welcome to {{company}}!';
      const values = { name: 'John', company: 'Acme Inc' };
      templateCache.get.mockReturnValue(null);
      path.join.mockReturnValue('/path/to/template.txt');
      fs.promises.readFile.mockResolvedValue(Buffer.from(templateContent));

      // Act
      const result = await applyTemplate(templateId, values);

      // Assert
      expect(result).toBe('Hello John, welcome to Acme Inc!');
      expect(templateCache.get).toHaveBeenCalledWith(templateId);
      expect(fs.promises.readFile).toHaveBeenCalledWith('/path/to/template.txt', 'utf8');
    });

    it('should handle missing values by leaving placeholders unchanged', async () => {
      // Arrange
      const templateId = 'test-template';
      const templateContent = 'Hello {{name}}, welcome to {{company}}!';
      const values = { name: 'John' };
      templateCache.get.mockReturnValue(templateContent);

      // Act
      const result = await applyTemplate(templateId, values);

      // Assert
      expect(result).toBe('Hello John, welcome to {{company}}!');
    });

    it('should throw TemplateError if template cannot be retrieved', async () => {
      // Arrange
      const templateId = 'test-template';
      const values = { name: 'John' };
      templateCache.get.mockReturnValue(null);
      path.join.mockReturnValue('/path/to/template.txt');
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));

      // Act & Assert
      await expect(applyTemplate(templateId, values)).rejects.toThrow(TemplateError);
    });
  });

  describe('listTemplates', () => {
    it('should return a list of template files', async () => {
      // Arrange
      const templateFiles = ['template1.txt', 'template2.txt', 'template3.txt'];
      path.join.mockReturnValue('/path/to/templates');
      fs.promises.readdir.mockResolvedValue(templateFiles);

      // Act
      const result = await listTemplates();

      // Assert
      expect(result).toEqual(templateFiles);
      expect(fs.promises.readdir).toHaveBeenCalledWith('/path/to/templates');
    });

    it('should throw TemplateError if template directory cannot be read', async () => {
      // Arrange
      path.join.mockReturnValue('/path/to/templates');
      fs.promises.readdir.mockRejectedValue(new Error('Directory not found'));

      // Act & Assert
      await expect(listTemplates()).rejects.toThrow(TemplateError);
      expect(fs.promises.readdir).toHaveBeenCalledWith('/path/to/templates');
    });
  });
});