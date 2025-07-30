// This module will handle interactions with the Gemini API

import { getApiConfig } from '../config/api.js';

/**
 * Simulates a call to the Gemini API.
 * @param {string} question The user's question.
 * @returns {Promise<string>} A promise that resolves with the AI's answer.
 */
export async function ask(prompt, filesData = []) {
  console.log(`Asking Gemini: ${prompt}`);

  const { baseUrl } = getApiConfig();
  const response = await fetch(
    `${baseUrl}/api/ask-gemini`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, filesData }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.response || 'An error occurred with the Gemini API.'
    );
  }

  const data = await response.json();
  return data.response;
}

/**
 * Renders the view for the Gemini module.
 * Since the chat UI is now global, this can be used for settings in the future.
 * @param {HTMLElement} container The element to render content into.
 * @param {object} project The active project.
 */
export function render(container, project) {
  // The main chat interface is handled by script.js now.
  // This space can be used for Gemini-specific settings for the project.
  container.innerHTML = `<h3>Gemini Settings</h3><p>This area can be used for API key settings, model selection, etc. for the <strong>${project.name}</strong> project.</p>`;
}
