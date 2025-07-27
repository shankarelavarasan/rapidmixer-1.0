const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error status and message
    let status = 500;
    let message = 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Invalid input data';
    } else if (err.name === 'FileProcessingError') {
        status = 422;
        message = 'File processing failed';
    } else if (err.name === 'TemplateError') {
        status = 422;
        message = 'Template processing failed';
    }

    // Add error details in development environment
    const error = {
        status,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    res.status(status).json(error);
};

class FileProcessingError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileProcessingError';
    }
}

class TemplateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TemplateError';
    }
}

module.exports = {
    errorHandler,
    FileProcessingError,
    TemplateError
};