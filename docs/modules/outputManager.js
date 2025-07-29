// docs/modules/outputManager.js

export function displayOutput(data) {
  const chatContainer = document.getElementById('chatContainer');
  const botMessage = document.createElement('div');

  if (typeof data.response === 'string') {
    botMessage.innerHTML = data.response; // Using innerHTML to render potential markdown
  } else {
    // Handle other data types here in the future (e.g., Excel, PDF)
    botMessage.textContent = 'Received a non-text response.';
  }

  chatContainer.appendChild(botMessage);
}
