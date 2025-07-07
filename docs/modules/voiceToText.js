// This module will handle Voice to Text

export function render(container, project) {
    container.innerHTML = `
        <h2>Voice-to-Text for ${project.name}</h2>
        <p>Click the button and start speaking.</p>
        <button id="vtt-toggle-btn">Start Listening</button>
        <textarea id="vtt-output" rows="10" style="width: 100%;"></textarea>
    `;

    const toggleBtn = document.getElementById('vtt-toggle-btn');
    const outputTextarea = document.getElementById('vtt-output');
    let recognition;
    let isRecognizing = false;

    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecognizing = true;
            toggleBtn.textContent = 'Stop Listening';
        };

        recognition.onend = () => {
            isRecognizing = false;
            toggleBtn.textContent = 'Start Listening';
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    outputTextarea.value += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // You can display the interim transcript if you want
        };

        toggleBtn.addEventListener('click', () => {
            if (isRecognizing) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

    } else {
        container.innerHTML += '<p>Speech recognition is not supported in this browser.</p>';
        toggleBtn.disabled = true;
    }
}