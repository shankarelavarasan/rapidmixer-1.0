# Rapid AI Assistant 🤖⚡

This is a frontend + backend project to communicate with Gemini AI using a lightweight web interface.

## Project Structure

*   **Frontend (GitHub Pages)**: The files `index.html`, `style.css`, and `script.js` make up the user interface. This is a static site hosted on GitHub Pages.
*   **Backend (Render)**: The `server.js` file is an Express server that provides an `/ask` API endpoint to connect to the Gemini AI. This is hosted on Render.

## Deployment

This project requires two separate deployments: one for the frontend and one for the backend.

### Frontend (GitHub Pages)

1.  Push the entire repository to your GitHub account.
2.  In your repository's settings, go to the "Pages" section.
3.  Under "Build and deployment", select "Deploy from a branch" as the source.
4.  Choose the `main` (or `master`) branch and the `/(root)` folder, then save.
5.  Your frontend will be live at `https://<your-username>.github.io/<your-repo-name>/`.

### Backend (Render)

1.  Create a new "Web Service" on Render and connect it to your GitHub repository.
2.  Set the following properties:
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
3.  Add an environment variable:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: Your actual Gemini API key (get one from Google AI Studio).
4.  Deploy the service. Render will provide you with a URL for your backend (e.g., `https://your-app-name.onrender.com`).

**Important**: Make sure the `fetch` URL in `script.js` points to your live Render backend URL.