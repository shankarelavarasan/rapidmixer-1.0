# Rapid AI Assistant

Rapid AI Assistant is a web-based application designed to streamline various tasks using AI-powered modules. It provides a modular interface for functionalities like Optical Character Recognition (OCR), Voice-to-Text, Task Management, and integration with the Gemini language model.

## Features

- **Project-Based Organization**: All your work is organized into projects, keeping your tasks and data separated and easy to manage.
- **Modular Design**: The application is built with a modular architecture, allowing for easy expansion and maintenance. Each core functionality is a self-contained module.
- **Chat with Gemini**: Interact with Google's Gemini Pro model to ask questions, get explanations, and generate content.
- **OCR (Optical Character Recognition)**: Extract text from images.
- **Voice-to-Text**: Transcribe spoken words into text (future implementation).
- **Task Manager**: Keep track of your to-do items within each project (future implementation).
- **Document Generator**: Automatically create documents from your data (future implementation).

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (ESM)
- **Backend**: Node.js, Express.js
- **APIs**: Google Gemini API
- **Python Engine**: A separate Python script (`entry_engine.py`) for data processing tasks like OCR.

## Project Structure

```
/rapid-ai-assistant
|-- /docs                # Frontend files (HTML, CSS, JS)
|   |-- /modules         # JS modules for different features (chat, ocr, etc.)
|   |-- index.html
|   |-- script.js
|   `-- style.css
|-- /node_modules        # (Generated) Node.js dependencies
|-- /routes              # Backend API routes
|   `-- gemini.js
|-- /entries             # Default output directory for the Python engine
|-- entry_engine.py      # Python script for OCR and data processing
|-- server.js            # Main Express.js server file
|-- package.json         # Project metadata and dependencies
`-- README.md            # This file
```

## Setup and Installation

### Prerequisites

- **Node.js and npm**: Required for the backend server. Download from [nodejs.org](https://nodejs.org/).
- **Python**: Required for the `entry_engine.py` script. Download from [python.org](https://python.org/).
- **Tesseract OCR**: Required for the OCR functionality. 
  - Installation instructions: [Tesseract Documentation](https://tesseract-ocr.github.io/tessdoc/Installation.html)
  - Make sure to add the Tesseract installation directory to your system's PATH.

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd rapid-ai-assistant
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: You may need to create a `requirements.txt` file with the content below)*



4.  **Set up your Gemini API Key:**
    - Create a `.env` file in the root directory.
    - Add your API key to the file:
      ```
      GEMINI_API_KEY=YOUR_API_KEY_HERE
      ```

5.  **Start the server:**
    ```bash
    node server.js
    ```

6.  **Access the application:**
    - Open your web browser and navigate to `http://localhost:10000`.

## How to Use the Python Engine

The `entry_engine.py` script can be used as a standalone tool for processing invoices or other documents.

**Usage:**

-   **From an image file:**
    ```bash
    python entry_engine.py --input-file /path/to/your/invoice.png --output-dir /path/to/output
    ```

-   **From a text string:**
    ```bash
    python entry_engine.py --input-text "Date: 01-01-2023, Amount: 500, GST: 18%" 
    ```

-   **Via stdin (for integration with other processes):**
    ```bash
    echo '{"userInput": "Date: 01-01-2023, Amount: 500, GST: 18%"}' | python entry_engine.py --stdin
    ```

This will create a structured JSON file in the `entries` (or specified output) directory.