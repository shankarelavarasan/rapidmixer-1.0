// This module will handle Voice to Text functionality

export function render(container, project) {
    container.innerHTML = `
        <h3>Voice-to-Text</h3>
        <p>Click 'Start Recognition' and speak. The transcribed text will appear below.</p>
        <button id="vttBtn">Start Recognition</button>
        <h4>Transcribed Text:</h4>
        <textarea id="vttOutput" rows="10" style="width: 95%;"></textarea>
    `;

    const vttBtn = document.getElementById('vttBtn');
    const vttOutput = document.getElementById('vttOutput');
    let recognition;

    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        let isRecognizing = false;

        recognition.onresult = (event) => {
            let interim_transcript = '';
            let final_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            vttOutput.value = final_transcript + interim_transcript;
        };

        vttBtn.addEventListener('click', () => {
            if (isRecognizing) {
                recognition.stop();
                vttBtn.textContent = 'Start Recognition';
                isRecognizing = false;
            } else {
                vttOutput.value = '';
                recognition.start();
                vttBtn.textContent = 'Stop Recognition';
                isRecognizing = true;
            }
        });

    } else {
        container.innerHTML += '<p>Speech recognition is not supported in your browser.</p>';
        vttBtn.disabled = true;
    }
}