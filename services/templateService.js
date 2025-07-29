/**
 * Service for handling template operations
 */
import { readTemplate } from '../utils/fileUtils.js';
import { TemplateError } from '../middleware/errorHandler.js';
import { withErrorHandling } from '../utils/errorUtils.js';
import templateCache from '../utils/cacheManager.js';
import path from 'path';

/**
 * Gets a template by name, using cache if available
 * @param {string} templateName - Name of the template
 * @param {string} templatesDir - Directory containing templates
 * @returns {Promise<string>} Template content
 * @throws {TemplateError} If template cannot be loaded
 */
export const getTemplate = withErrorHandling(
  async (templateName, templatesDir) => {
    const cacheKey = `template:${templateName}`;

    // Check cache first
    const cachedTemplate = templateCache.get(cacheKey);
    if (cachedTemplate) {
      return cachedTemplate;
    }

    // Read template from file
    const content = await readTemplate(templateName, templatesDir);

    // Cache the template
    templateCache.set(cacheKey, content);

    return content;
  },
  { context: 'template processing', defaultMessage: 'Failed to load template' }
);

/**
 * Applies a template to content
 * @param {string} templateContent - Template content
 * @param {string} userContent - User content to process
 * @returns {string} Processed content with template applied
 */
export const applyTemplate = (templateContent, userContent) => {
  // Simple implementation - in a real app, this would be more sophisticated
  // with actual template parsing and variable substitution
  return `Template: ${templateContent}\n\nContent: ${userContent}`;
};

/**
 * Lists all available templates
 * @param {string} templatesDir - Directory containing templates
 * @returns {Promise<string[]>} List of template names
 * @throws {TemplateError} If templates cannot be listed
 */
export const listTemplates = withErrorHandling(
  async templatesDir => {
    const fs = await import('fs/promises');
    const files = await fs.readdir(templatesDir);
    return files;
  },
  { context: 'template listing', defaultMessage: 'Failed to list templates' }
);
