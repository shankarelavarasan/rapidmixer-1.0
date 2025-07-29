// UI State Management and Operations

class UIState {
  constructor() {
    this.currentMode = 'work';
    this.isProcessing = false;
    this.previewVisible = false;
    this.leftPanelVisible = true;
    this.progress = 0;
    this.currentOperation = '';
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
      promptContainer: document.querySelector('.prompt-container'),
      progressBar: document.getElementById('progressBar'),
      progressContainer: document.getElementById('progressContainer'),
      progressText: document.getElementById('progressText'),
    };
  }

  initializeEventHandlers() {
    if (this.elements.workModeBtn) {
      this.elements.workModeBtn.addEventListener('click', () =>
        this.setMode('work')
      );
    }
    if (this.elements.chatModeBtn) {
      this.elements.chatModeBtn.addEventListener('click', () =>
        this.setMode('chat')
      );
    }
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => this.resetPrompt());
    }
  }

  setMode(mode) {
    this.state.currentMode = mode;
    this.state.leftPanelVisible = mode === 'work';
    this.state.previewVisible = false;

    // Update UI based on mode with null checks
    if (this.elements.leftPanel) {
      this.elements.leftPanel.style.display = this.state.leftPanelVisible
        ? 'block'
        : 'none';
    }
    if (this.elements.previewContainer) {
      this.elements.previewContainer.style.display = 'none';
    }
    if (this.elements.promptContainer) {
      this.elements.promptContainer.style.display = 'flex';
      this.elements.promptContainer.style.visibility = 'visible';
    }

    // Update mode buttons with null checks
    if (this.elements.workModeBtn) {
      this.elements.workModeBtn.classList.toggle('active', mode === 'work');
    }
    if (this.elements.chatModeBtn) {
      this.elements.chatModeBtn.classList.toggle('active', mode === 'chat');
    }
  }

  setProcessingState(isProcessing) {
    this.state.isProcessing = isProcessing;
    this.elements.processBtn.disabled = isProcessing;
    this.elements.processBtn.textContent = isProcessing
      ? 'Processing...'
      : 'Process';

    if (isProcessing) {
      this.showProgress();
    } else {
      this.hideProgress();
    }
  }

  showProgress() {
    if (this.elements.progressContainer) {
      this.elements.progressContainer.style.display = 'block';
    }
  }

  hideProgress() {
    if (this.elements.progressContainer) {
      this.elements.progressContainer.style.display = 'none';
      this.setProgress(0, '');
    }
  }

  setProgress(percentage, operation = '') {
    this.state.progress = Math.min(100, Math.max(0, percentage));
    this.state.currentOperation = operation;

    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${this.state.progress}%`;
      this.elements.progressBar.setAttribute(
        'aria-valuenow',
        this.state.progress
      );
    }

    if (this.elements.progressText) {
      const text = operation
        ? `${operation}: ${this.state.progress}%`
        : `${this.state.progress}%`;
      this.elements.progressText.textContent = text;
    }
  }

  updateProgressMessage(message) {
    if (this.elements.progressText) {
      this.elements.progressText.textContent = message;
    }
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
    this.elements.chatContainer.scrollTop =
      this.elements.chatContainer.scrollHeight;
  }

  setPreviewContent(content) {
    this.elements.previewContent.innerHTML = content;
    this.showPreview();
  }

  showLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('loading');
      element.innerHTML = '<div class="spinner"></div>';
    }
  }

  hideLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('loading');
      element.innerHTML = '';
    }
  }
}

export const uiManager = new UIManager();
