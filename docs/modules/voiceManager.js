// docs/modules/voiceManager.js

export function initializeVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');
    const promptTextarea = document.getElementById('promptTextarea');

    if (voiceBtn && 'webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let isRecording = false;

        voiceBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
                isRecording = false;
                voiceBtn.textContent = '🎤 Voice';
            } else {
                recognition.start();
                isRecording = true;
                voiceBtn.textContent = '🛑 Stop';
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            promptTextarea.value += transcript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            isRecording = false;
            voiceBtn.textContent = '🎤 Voice';
        };

    } else {
        if(voiceBtn) {
            voiceBtn.style.display = 'none';
        }
    }
}