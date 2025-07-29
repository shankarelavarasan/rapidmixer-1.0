/**
 * @jest-environment jsdom
 */

import { uiManager } from '../docs/modules/uiManager.js';

// Mock DOM elements
document.body.innerHTML = `
  <div>
    <button id="processBtn">Process</button>
    <button id="submitBtn">Submit</button>
    <button id="resetBtn">Reset</button>
    <textarea id="promptTextarea"></textarea>
    <div id="chatContainer"></div>
    <div id="previewContainer">
      <div id="previewContent"></div>
    </div>
    <div class="left-panel"></div>
    <button id="workModeBtn">Work Mode</button>
    <button id="chatModeBtn">Chat Mode</button>
    <div class="prompt-container"></div>
    <div id="progressContainer">
      <div id="progressBar"></div>
    </div>
    <p id="progressText"></p>
  </div>
`;

describe('UI Manager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <button id="processBtn">Process</button>
        <button id="submitBtn">Submit</button>
        <button id="resetBtn">Reset</button>
        <textarea id="promptTextarea"></textarea>
        <div id="chatContainer"></div>
        <div id="previewContainer">
          <div id="previewContent"></div>
        </div>
        <div class="left-panel"></div>
        <button id="workModeBtn">Work Mode</button>
        <button id="chatModeBtn">Chat Mode</button>
        <div class="prompt-container"></div>
        <div id="progressContainer">
          <div id="progressBar"></div>
        </div>
        <p id="progressText"></p>
      </div>
    `;
    uiManager.initialize();
  });

  test('should initialize UI elements correctly', () => {
    expect(uiManager.elements.processBtn).toBeTruthy();
    expect(uiManager.elements.submitBtn).toBeTruthy();
    expect(uiManager.elements.resetBtn).toBeTruthy();
    expect(uiManager.elements.promptTextarea).toBeTruthy();
    expect(uiManager.elements.chatContainer).toBeTruthy();
    expect(uiManager.elements.previewContainer).toBeTruthy();
  });

  test('should set processing state correctly', () => {
    uiManager.setProcessingState(true);
    expect(uiManager.state.isProcessing).toBe(true);
    expect(uiManager.elements.processBtn.disabled).toBe(true);
    expect(uiManager.elements.processBtn.textContent).toBe('Processing...');

    uiManager.setProcessingState(false);
    expect(uiManager.state.isProcessing).toBe(false);
    expect(uiManager.elements.processBtn.disabled).toBe(false);
    expect(uiManager.elements.processBtn.textContent).toBe('Process');
  });

  test('should handle mode switching', () => {
    uiManager.setMode('chat');
    expect(uiManager.state.currentMode).toBe('chat');
    expect(uiManager.state.leftPanelVisible).toBe(false);

    uiManager.setMode('work');
    expect(uiManager.state.currentMode).toBe('work');
    expect(uiManager.state.leftPanelVisible).toBe(true);
  });

  test('should show and hide preview', () => {
    uiManager.showPreview();
    expect(uiManager.state.previewVisible).toBe(true);
    expect(uiManager.elements.previewContainer.style.display).toBe('block');

    uiManager.hidePreview();
    expect(uiManager.state.previewVisible).toBe(false);
    expect(uiManager.elements.previewContainer.style.display).toBe('none');
  });

  test('should add messages to chat', () => {
    uiManager.addMessage('Hello, world!', 'user');
    const messages =
      uiManager.elements.chatContainer.querySelectorAll('.chat-message');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toBe('Hello, world!');
    expect(messages[0].classList.contains('user-message')).toBe(true);
  });

  test('should set progress correctly', () => {
    uiManager.setProgress(50, 'Processing');
    expect(uiManager.state.progress).toBe(50);
    expect(uiManager.state.currentOperation).toBe('Processing');

    const progressBar = document.getElementById('progressBar');
    expect(progressBar.style.width).toBe('50%');

    const progressText = document.getElementById('progressText');
    expect(progressText.textContent).toBe('Processing: 50%');
  });

  test('should handle edge cases for progress', () => {
    uiManager.setProgress(-10);
    expect(uiManager.state.progress).toBe(0);

    uiManager.setProgress(150);
    expect(uiManager.state.progress).toBe(100);
  });

  test('should reset prompt correctly', () => {
    uiManager.elements.promptTextarea.value = 'Test prompt';
    uiManager.resetPrompt();
    expect(uiManager.elements.promptTextarea.value).toBe('');
    expect(uiManager.state.previewVisible).toBe(false);
  });
});
