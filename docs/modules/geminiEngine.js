// docs/modules/geminiEngine.js

export function constructGeminiPrompt(promptText, templateId) {
  const promptData = {
    prompt: promptText,
    template: templateId,
    files: window.selectedFiles || [],
  };

  return JSON.stringify(promptData);
}
