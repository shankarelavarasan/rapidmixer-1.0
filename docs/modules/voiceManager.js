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

        async function checkMicrophonePermission() {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                return true;
            } catch (err) {
                console.error('Microphone permission error:', err);
                return false;
            }
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            promptTextarea.value += transcript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Please grant microphone permissions and ensure you\'re using HTTPS');
                voiceBtn.textContent = '🎤 Voice';
                isRecording = false;
            }
        };

        recognition.onend = () => {
            isRecording = false;
            voiceBtn.textContent = '🎤 Voice';
        };

        // Call this function before starting recognition
        voiceBtn.addEventListener('click', async () => {
            if (isRecording) {
                recognition.stop();
                isRecording = false;
                voiceBtn.textContent = '🎤 Voice';
            } else {
                const hasPermission = await checkMicrophonePermission();
                if (hasPermission) {
                    recognition.start();
                    isRecording = true;
                    voiceBtn.textContent = '🛑 Stop';
                } else {
                    alert('Microphone access is required for voice input.');
                }
            }
        });

    } else {
        if(voiceBtn) {
            voiceBtn.style.display = 'none';
        }
    }
}