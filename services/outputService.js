/**
 * Service for handling different output formats
 */
import { withErrorHandling } from '../utils/errorUtils.js';

/**
 * Formats the AI response into the requested output format
 * @param {string|Object} content - The content to format
 * @param {string} format - The desired output format (text, json, html)
 * @param {Object} options - Additional formatting options
 * @returns {string|Object} Formatted content
 */
export const formatOutput = withErrorHandling(
  async (content, format = 'text', options = {}) => {
    // If content is already in the requested format, return it as is
    if (typeof content === 'string' && format === 'text') {
      return content;
    }

    switch (format.toLowerCase()) {
      case 'json':
        return formatAsJson(content, options);
      case 'html':
        return formatAsHtml(content, options);
      case 'markdown':
        return formatAsMarkdown(content, options);
      case 'text':
      default:
        return formatAsText(content, options);
    }
  },
  { context: 'output formatting', defaultMessage: 'Failed to format output' }
);

/**
 * Formats content as plain text
 * @param {string|Object} content - Content to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted text
 */
const formatAsText = (content, options = {}) => {
  if (typeof content === 'string') {
    return content;
  }

  if (typeof content === 'object') {
    return JSON.stringify(content, null, 2);
  }

  return String(content);
};

/**
 * Formats content as JSON
 * @param {string|Object} content - Content to format
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted JSON object
 */
const formatAsJson = (content, options = {}) => {
  if (typeof content === 'object') {
    return content;
  }

  try {
    // Try to parse as JSON if it's a string
    if (typeof content === 'string') {
      return JSON.parse(content);
    }

    // Fallback to creating a simple JSON object
    return { content: String(content) };
  } catch (error) {
    // If parsing fails, return as a simple JSON object
    return { content: String(content) };
  }
};

/**
 * Formats content as HTML
 * @param {string|Object} content - Content to format
 * @param {Object} options - Formatting options
 * @returns {string} HTML formatted string
 */
const formatAsHtml = (content, options = {}) => {
  const { title = 'AI Response', css = '' } = options;

  let htmlContent = '';

  if (typeof content === 'string') {
    // Convert plain text to HTML (respecting line breaks)
    htmlContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  } else if (typeof content === 'object') {
    // Convert JSON to HTML
    htmlContent = `<pre>${JSON.stringify(content, null, 2)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')}</pre>`;
  } else {
    htmlContent = String(content);
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    ${css}
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="content">
    ${htmlContent}
  </div>
</body>
</html>
  `;
};

/**
 * Formats content as Markdown
 * @param {string|Object} content - Content to format
 * @param {Object} options - Formatting options
 * @returns {string} Markdown formatted string
 */
const formatAsMarkdown = (content, options = {}) => {
  const { title = 'AI Response' } = options;

  let mdContent = '';

  if (typeof content === 'string') {
    mdContent = content;
  } else if (typeof content === 'object') {
    mdContent = '```json\n' + JSON.stringify(content, null, 2) + '\n```';
  } else {
    mdContent = String(content);
  }

  return `# ${title}\n\n${mdContent}`;
};
