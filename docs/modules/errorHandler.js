// Error handling utility module

class ErrorHandler {
  constructor() {
    this.errorTypes = {
      VALIDATION_ERROR: 'ValidationError',
      API_ERROR: 'APIError',
      FILE_ERROR: 'FileError',
      NETWORK_ERROR: 'NetworkError',
      UNKNOWN_ERROR: 'UnknownError',
    };
  }

  handleError(error, type = this.errorTypes.UNKNOWN_ERROR) {
    console.error(`[${type}]`, error);

    // Format error message for display
    let userMessage = this.getUserFriendlyMessage(error, type);

    // Return formatted error object
    return {
      type,
      message: userMessage,
      originalError: error,
      timestamp: new Date().toISOString(),
    };
  }

  getUserFriendlyMessage(error, type) {
    switch (type) {
      case this.errorTypes.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      case this.errorTypes.API_ERROR:
        return 'There was a problem communicating with the server. Please try again later.';
      case this.errorTypes.FILE_ERROR:
        return 'There was a problem with the file operation. Please try again.';
      case this.errorTypes.NETWORK_ERROR:
        return 'Network connection issue. Please check your internet connection and try again.';
      default:
        return (
          error.message || 'An unexpected error occurred. Please try again.'
        );
    }
  }

  validateInput(input, rules) {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      if (rule.required && !input[field]) {
        errors.push(`${field} is required`);
      }
      if (rule.minLength && input[field]?.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && input[field]?.length > rule.maxLength) {
        errors.push(`${field} must not exceed ${rule.maxLength} characters`);
      }
      if (rule.pattern && !rule.pattern.test(input[field])) {
        errors.push(`${field} format is invalid`);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    return true;
  }

  async wrapAsync(promise) {
    try {
      return await promise;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const errorHandler = new ErrorHandler();
