// This module will handle interactions with the Gemini API

export function render(project) {
    const moduleView = document.getElementById('moduleView');
    moduleView.innerHTML = `
        <h2>Gemini AI for ${project.name}</h2>
        <div id="gemini-chat-container"></div>
        <div class="input-area">
            <textarea id="gemini-user-input" placeholder="Ask Gemini..."></textarea>
            <button id="gemini-ask-btn">Send</button>
        </div>
    `;

    const chatContainer = document.getElementById('gemini-chat-container');
    const userInput = document.getElementById('gemini-user-input');
    const askBtn = document.getElementById('gemini-ask-btn');

    askBtn.addEventListener('click', async () => {
        const question = userInput.value.trim();
        if (!question) return;

        addMessage('user', question);
        userInput.value = '';

        // Simulate a response from Gemini
        setTimeout(() => {
            addMessage('bot', 'This is a simulated response from Gemini.');
        }, 1000);
    });

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = text;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}