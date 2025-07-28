// UI State Management and Operations

class UIState {
    constructor() {
        this.currentMode = 'work';
        this.isProcessing = false;
        this.previewVisible = false;
        this.leftPanelVisible = true;
    }
}

class UIManager {
    constructor() {
        this.state = new UIState();
        this.elements = {};
        this.eventHandlers = {};
    }

    initialize() {
        this.initializeElements();
        this.initializeEventHandlers();
        this.setMode(this.state.currentMode);
    }

    initializeElements() {
        this.elements = {
            processBtn: document.getElementById('processBtn'),
            submitBtn: document.getElementById('submitBtn'),
            resetBtn: document.getElementById('resetBtn'),
            promptTextarea: document.getElementById('promptTextarea'),
            chatContainer: document.getElementById('chatContainer'),
            previewContainer: document.getElementById('previewContainer'),
            previewContent: document.getElementById('previewContent'),
            leftPanel: document.querySelector('.left-panel'),
            workModeBtn: document.getElementById('workModeBtn'),
            chatModeBtn: document.getElementById('chatModeBtn'),
            promptContainer: document.querySelector('.prompt-container')
        };
    }

    initializeEventHandlers() {
        this.elements.workModeBtn.addEventListener('click', () => this.setMode('work'));
        this.elements.chatModeBtn.addEventListener('click', () => this.setMode('chat'));
        this.elements.resetBtn.addEventListener('click', () => this.resetPrompt());
    }

    setMode(mode) {
        this.state.currentMode = mode;
        this.state.leftPanelVisible = mode === 'work';
        this.state.previewVisible = false;

        // Update UI based on mode
        this.elements.leftPanel.style.display = this.state.leftPanelVisible ? 'block' : 'none';
        this.elements.previewContainer.style.display = 'none';
        this.elements.promptContainer.style.display = 'flex';
        this.elements.promptContainer.style.visibility = 'visible';

        // Update mode buttons
        this.elements.workModeBtn.classList.toggle('active', mode === 'work');
        this.elements.chatModeBtn.classList.toggle('active', mode === 'chat');
    }

    setProcessingState(isProcessing) {
        this.state.isProcessing = isProcessing;
        this.elements.processBtn.disabled = isProcessing;
        this.elements.processBtn.textContent = isProcessing ? 'Processing...' : 'Process';
    }

    showPreview() {
        this.state.previewVisible = true;
        this.elements.previewContainer.style.display = 'block';
    }

    hidePreview() {
        this.state.previewVisible = false;
        this.elements.previewContainer.style.display = 'none';
    }

    resetPrompt() {
        this.elements.promptTextarea.value = '';
        this.hidePreview();
    }

    addMessage(message, type = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${type}-message`);
        messageDiv.textContent = message;
        this.elements.chatContainer.appendChild(messageDiv);
        this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
    }

    setPreviewContent(content) {
        this.elements.previewContent.innerHTML = content;
        this.showPreview();
    }
}

export const uiManager = new UIManager();