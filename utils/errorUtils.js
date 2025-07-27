/**
 * Utility functions for standardized error handling across the application
 */
import { FileProcessingError, TemplateError } from '../middleware/errorHandler.js';

/**
 * Wraps an async function with standardized error handling
 * @param {Function} fn - The async function to wrap
 * @param {Object} options - Options for error handling
 * @param {string} options.context - Context where the error occurred (for logging)
 * @param {string} options.defaultMessage - Default user-friendly error message
 * @param {Function} options.onError - Optional callback for custom error handling
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (fn, options = {}) => {
    const { 
        context = 'operation', 
        defaultMessage = 'An error occurred during processing',
        onError = null
    } = options;
    
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            
            // Allow custom error handling if provided
            if (onError && typeof onError === 'function') {
                return onError(error);
            }
            
            // Re-throw specific error types
            if (error instanceof FileProcessingError || 
                error instanceof TemplateError) {
                throw error;
            }
            
            // Convert generic errors to appropriate type based on context
            if (context.includes('file')) {
                throw new FileProcessingError(
                    error.message || defaultMessage
                );
            } else if (context.includes('template')) {
                throw new TemplateError(
                    error.message || defaultMessage
                );
            }
            
            // Re-throw the original error if no specific handling
            throw error;
        }
    };
};

/**
 * Validates input parameters
 * @param {Object} params - Parameters to validate
 * @param {Array<string>} required - List of required parameter names
 * @throws {Error} If validation fails
 */
export const validateParams = (params, required = []) => {
    const missing = required.filter(param => !params[param]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
};