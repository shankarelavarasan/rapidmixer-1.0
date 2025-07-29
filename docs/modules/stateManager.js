// State Management Module

class AppState {
  constructor() {
    this._state = {
      mode: 'work',
      isProcessing: false,
      selectedFiles: [],
      selectedTemplate: null,
      prompt: '',
      responses: [],
      error: null,
    };
    this._listeners = new Set();
  }

  get state() {
    return { ...this._state };
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  setState(newState) {
    const oldState = { ...this._state };
    this._state = { ...this._state, ...newState };

    // Notify listeners only if state actually changed
    if (JSON.stringify(oldState) !== JSON.stringify(this._state)) {
      this._listeners.forEach(listener => listener(this._state, oldState));
    }
  }

  // Mode management
  setMode(mode) {
    this.setState({ mode });
  }

  // Processing state
  setProcessing(isProcessing) {
    this.setState({ isProcessing });
  }

  // File management
  setSelectedFiles(files) {
    this.setState({ selectedFiles: files });
  }

  // Template management
  setSelectedTemplate(template) {
    this.setState({ selectedTemplate: template });
  }

  // Prompt management
  setPrompt(prompt) {
    this.setState({ prompt });
  }

  // Response management
  setResponses(responses) {
    this.setState({ responses });
  }

  addResponse(response) {
    this.setState({
      responses: [...this._state.responses, response],
    });
  }

  // Error management
  setError(error) {
    this.setState({ error });
  }

  clearError() {
    this.setState({ error: null });
  }

  // State reset
  resetState() {
    this.setState({
      isProcessing: false,
      prompt: '',
      responses: [],
      error: null,
    });
  }
}

export const stateManager = new AppState();
