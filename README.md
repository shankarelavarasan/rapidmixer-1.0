# Rapid AI Assistant

This is a Node.js backend server that uses the Google Gemini API to process various file types and generate intelligent responses based on user prompts.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [npm](https://www.npmjs.com/)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd gemini-backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following variables:

    ```
    PORT=10000
    GEMINI_API_KEY=your_gemini_api_key
    ```

    You can find an example in the `.env.example` file.

## Running the server

To start the server, run the following command:

```bash
npm start
```

The server will be running on `http://localhost:10000`.

## API Endpoints

-   `POST /api/ask-gemini`: Sends a prompt to the Gemini API and returns the generated text. Supports file processing for PDF, Excel, Word, Text, and Image files.
-   `GET /api/templates`: Returns a list of available templates.

## Recent Improvements

### Error Handling Enhancements

- Added robust error handling for PDF, Excel, and Word document parsing
- Implemented centralized error handling middleware
- Created custom error types for specific error scenarios
- Added input validation for file types and sizes

### Code Organization

- Refactored file processing logic into separate service modules
- Created utility functions for common operations
- Implemented consistent error handling patterns

### Testing

- Added unit tests for file processing and error handling
- Implemented test utilities for mocking dependencies

## Project Structure

The project follows a modular architecture with the following components:

- **Services**: Dedicated modules for file processing, template management, and Gemini API interactions
- **Utils**: Utility functions for error handling, file operations, and caching
- **Routes**: API endpoints for handling client requests
- **Middleware**: Express middleware for error handling and request processing

## Future Improvements

1. **Error Handling:**
   - Add more specific error types for different scenarios
   - Enhance validation for complex input structures

2. **Code Organization:**
   - Move more logic to separate service modules
   - Add TypeScript for better type safety

3. **Performance:**
   - Implement file processing queues for large batches
   - Enhance caching for template files
   - Optimize memory usage for large files

4. **Testing:**
   - Add more unit tests for file processing functions
   - Implement integration tests for API endpoints
   - Add error scenario test cases

5. **Documentation:**
   - Add JSDoc comments for all functions
   - Create API documentation
   - Add setup and deployment guides

6. **Monitoring:**
   - Add logging for important operations
   - Implement performance metrics
   - Add error tracking and reporting