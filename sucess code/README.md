# Rapid AI Assistant 🤖⚡

This is a frontend + backend project to communicate with Gemini AI using a lightweight web interface.

## Project Structure

*   **Frontend**: The files in the `docs` directory (`index.html`, `style.css`, `script.js`) make up the user interface.
*   **Backend**: The `server.js` file is an Express server that serves the frontend and provides an `/ask-gemini` API endpoint to connect to the Gemini AI.

## Deployment (Render)

This project is designed to be deployed as a single service on Render.

1.  Push the entire repository to your GitHub account.
2.  Create a new "Web Service" on Render and connect it to your GitHub repository.

1.  Create a new "Web Service" on Render and connect it to your GitHub repository.
2.  Set the following properties:
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
3.  Add an environment variable:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: Your actual Gemini API key (get one from Google AI Studio).
4.  Deploy the service. Render will provide you with a URL for your backend (e.g., `https://your-app-name.onrender.com`).

**Important**: Since the frontend is served from the same origin as the backend, you can now update the `fetch` URL in `docs/script.js` to be a relative path: `fetch('/ask-gemini', ...)`.