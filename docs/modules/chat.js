import { ask as askGemini } from './gemini.js';

let activeProject = null;

function addMessageToChat(sender, message) {
  const chatContainer = document.getElementById('chat-container');
  if (!chatContainer) return;

  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message', `${sender}-message`);

  if (message.startsWith('```')) {
    const codeBlock = document.createElement('pre');
    const code = document.createElement('code');
    const langMatch = message.match(/```(\w*)/);
    const lang = langMatch ? langMatch[1] : '';
    code.className = `language-${lang}`;
    code.textContent = message.replace(/```\w*\n/, '').replace(/\n```/, '');
    codeBlock.appendChild(code);
    messageElement.appendChild(codeBlock);
    // In a real app with syntax highlighting:
    // if (window.Prism) {
    //     Prism.highlightElement(code);
    // }
  } else {
    messageElement.textContent = message;
  }

  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

const handleAsk = () => {
  const userInput = document.getElementById('userInput');
  if (!userInput) return;

  const question = userInput.value.trim();
  if (question && activeProject) {
    addMessageToChat('user', question);
    userInput.value = '';

    // Assuming activeProject.files is an array of file objects with name and content
    const filesData = activeProject.files || [];

    askGemini(question, filesData)
      .then(response => {
        addMessageToChat('bot', response);
      })
      .catch(error => {
        console.error('Error asking Gemini:', error);
        addMessageToChat('bot', 'Sorry, I encountered an error.');
      });
  }
};

export function render(container, project) {
  activeProject = project;
  container.innerHTML = `
        <div class="chat-area">
            <div id="chat-container" class="chat-container"></div>
            <div class="input-area">
                <textarea id="userInput" placeholder="Ask Rapid AI anything..." rows="1"></textarea>
                <button id="askBtn">Send</button>
            </div>
        </div>
    `;

  const askBtn = document.getElementById('askBtn');
  const userInput = document.getElementById('userInput');

  if (askBtn && userInput) {
    askBtn.addEventListener('click', handleAsk);
    userInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAsk();
      }
    });
  }
}
