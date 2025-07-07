// This module will handle voice-to-text conversion

export function render() {
    const moduleView = document.getElementById('moduleView');
    moduleView.innerHTML = `
        <h2>Voice to Text Module</h2>
        <button id="start-recognition-btn">Start Listening</button>
        <p id="voice-output"></p>
    `;

    const startBtn = document.getElementById('start-recognition-btn');
    const outputP = document.getElementById('voice-output');

    startBtn.addEventListener('click', () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            outputP.textContent = 'Listening...';
        };

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            outputP.textContent = `You said: ${speechResult}`;
        };

        recognition.onspeechend = () => {
            recognition.stop();
        };

        recognition.onerror = (event) => {
            outputP.textContent = `Error occurred in recognition: ${event.error}`;
        };

        recognition.start();
    });
}