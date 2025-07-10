# Gemini Backend

This is a Node.js backend server that uses the Google Gemini API to generate text based on user prompts.

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

-   `POST /api/ask-gemini`: Sends a prompt to the Gemini API and returns the generated text.
-   `GET /api/templates`: Returns a list of available templates.