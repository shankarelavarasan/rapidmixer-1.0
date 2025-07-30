// Global variables
let uploadedFiles = [];
let templateFile = null;
let processingData = null;
let currentStep = 1;
let socket = null;
let chatMessages = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupSocketConnection();
    loadTemplates();
}

// Event Listeners
function setupEventListeners() {
    // Folder upload
    const folderInput = document.getElementById('folderInput');
    const folderUploadZone = document.getElementById('folderUploadZone');
    
    folderInput.addEventListener('change', handleFolderUpload);
    
    // Drag and drop for folder
    folderUploadZone.addEventListener('dragover', handleDragOver);
    folderUploadZone.addEventListener('dragleave', handleDragLeave);
    folderUploadZone.addEventListener('drop', handleFolderDrop);
    
    // Template upload
    const templateInput = document.getElementById('templateInput');
    templateInput.addEventListener('change', handleTemplateUpload);
    
    // Prompt input
    const promptInput = document.getElementById('promptInput');
    promptInput.addEventListener('input', validatePrompt);
    
    // Chat functionality
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Socket Connection
function setupSocketConnection() {
    try {
        socket = io(window.location.origin);
        
        socket.on('connect', function() {
            console.log('Connected to server');
            addChatMessage('System', 'Connected to AI Assistant', 'ai');
        });
        
        socket.on('disconnect', function() {
            console.log('Disconnected from server');
            addChatMessage('System', 'Disconnected from AI Assistant', 'ai');
        });
        
        socket.on('processing_update', function(data) {
            updateProcessingStatus(data);
        });
        
        socket.on('approval_request', function(data) {
            handleApprovalRequest(data);
        });
        
        socket.on('processing_complete', function(data) {
            handleProcessingComplete(data);
        });
        
        socket.on('error', function(data) {
            handleProcessingError(data);
        });
        
    } catch (error) {
        console.error('Socket connection failed:', error);
    }
}

// Folder Upload Handling
function handleFolderUpload(event) {
    const files = Array.from(event.target.files);
    processUploadedFiles(files);
}

function handleFolderDrop(event) {
    event.preventDefault();
    event.target.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    processUploadedFiles(files);
}

function processUploadedFiles(files) {
    const validExtensions = ['.pdf', '.docx', '.xlsx', '.csv', '.json', '.txt'];
    
    uploadedFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        return validExtensions.includes(extension);
    });
    
    if (uploadedFiles.length === 0) {
        alert('No valid files found. Please select files with extensions: ' + validExtensions.join(', '));
        return;
    }
    
    displayFileList(uploadedFiles);
    document.getElementById('nextStep1').style.display = 'block';
}

function displayFileList(files) {
    const fileList = document.getElementById('fileList');
    const fileCount = document.getElementById('fileCount');
    
    fileList.innerHTML = '';
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>${file.name}</span>
            <span class="text-sm text-gray-600">${formatFileSize(file.size)}</span>
        `;
        fileList.appendChild(fileItem);
    });
    
    fileCount.textContent = `${files.length} files selected (${formatFileSize(files.reduce((total, file) => total + file.size, 0))})`;
    document.getElementById('folderPreview').style.display = 'block';
}

// Template Upload Handling
function handleTemplateUpload(event) {
    const file = event.target.files[0];
    
    if (!file || !file.name.endsWith('.xlsx')) {
        alert('Please select a valid Excel template file (.xlsx)');
        return;
    }
    
    templateFile = file;
    
    // Display template structure (simplified)
    const templateStructure = document.getElementById('templateStructure');
    templateStructure.innerHTML = `
        <div class="p-2">
            <strong>Template:</strong> ${file.name}<br>
            <strong>Size:</strong> ${formatFileSize(file.size)}
        </div>
    `;
    
    document.getElementById('templatePreview').style.display = 'block';
    document.getElementById('nextStep2').style.display = 'block';
}

// Step Navigation
function nextStep(step) {
    if (step === 2 && uploadedFiles.length === 0) {
        alert('Please upload documents first');
        return;
    }
    
    if (step === 3 && !templateFile) {
        alert('Please upload an Excel template');
        return;
    }
    
    if (step === 4) {
        const prompt = document.getElementById('promptInput').value.trim();
        if (!prompt) {
            alert('Please enter a task description');
            return;
        }
    }
    
    // Hide current step
    document.getElementById(`step${currentStep}-content`).style.display = 'none';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('completed');
    
    // Show next step
    currentStep = step;
    document.getElementById(`step${currentStep}-content`).style.display = 'block';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`step${currentStep}-content`).style.display = 'none';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show previous step
    currentStep = step;
    document.getElementById(`step${currentStep}-content`).style.display = 'block';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('completed');
}

// Processing
async function startProcessing() {
    const prompt = document.getElementById('promptInput').value.trim();
    
    if (!prompt || uploadedFiles.length === 0 || !templateFile) {
        alert('Please complete all previous steps');
        return;
    }
    
    // Disable start button
    document.getElementById('startProcessing').disabled = true;
    document.getElementById('startProcessing').textContent = 'Processing...';
    
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('template', templateFile);
        
        uploadedFiles.forEach(file => {
            formData.append('documents', file);
        });
        
        const response = await fetch('/api/process-documents', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Processing failed');
        }
        
        const result = await response.json();
        processingData = result;
        
        nextStep(5);
        displayApprovalContent(result);
        
    } catch (error) {
        console.error('Processing error:', error);
        alert('Error processing documents: ' + error.message);
    } finally {
        document.getElementById('startProcessing').disabled = false;
        document.getElementById('startProcessing').textContent = 'Start Processing';
    }
}

// Approval Handling
function displayApprovalContent(data) {
    const approvalContent = document.getElementById('approvalContent');
    
    let html = `
        <div class="approval-card">
            <h3 class="font-semibold mb-2">Processing Summary</h3>
            <p><strong>Documents Processed:</strong> ${data.totalFiles}</p>
            <p><strong>Data Extracted:</strong> ${data.totalRecords}</p>
            <p><strong>Missing Fields:</strong> ${data.missingFields?.length || 0}</p>
        </div>
    `;
    
    if (data.missingFields && data.missingFields.length > 0) {
        html += `
            <div class="approval-card">
                <h3 class="font-semibold mb-2">Missing Fields Requiring Approval</h3>
                ${data.missingFields.map(field => `
                    <div class="border rounded p-2 mb-2">
                        <p><strong>Row:</strong> ${field.row}</p>
                        <p><strong>Column:</strong> ${field.column}</p>
                        <p><strong>Issue:</strong> ${field.reason}</p>
                        <div class="mt-2">
                            <input type="text" placeholder="Enter value or leave blank to skip" 
                                   class="border rounded px-2 py-1 mr-2" 
                                   data-row="${field.row}" data-column="${field.column}">
                            <button onclick="approveField(this, '${field.row}', '${field.column}')" 
                                    class="bg-green-600 text-white px-2 py-1 rounded text-sm">Approve</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    approvalContent.innerHTML = html;
}

function approveField(button, row, column) {
    const input = button.previousElementSibling;
    const value = input.value.trim();
    
    if (socket) {
        socket.emit('field_approval', {
            row: row,
            column: column,
            value: value || null
        });
    }
    
    button.parentElement.parentElement.style.opacity = '0.5';
    button.disabled = true;
    input.disabled = true;
}

function approveResults() {
    if (socket) {
        socket.emit('approve_results', processingData);
    }
    nextStep(6);
}

function editResults() {
    // Open results in editor (simplified)
    alert('Edit functionality would open a detailed editor here');
}

// Export
async function downloadResults() {
    try {
        const response = await fetch('/api/download-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ processingId: processingData.processingId })
        });
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_results_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading results: ' + error.message);
    }
}

// Chat Interface
function toggleChat() {
    const chatContainer = document.getElementById('chatContainer');
    const chatToggle = document.getElementById('chatToggle');
    
    if (chatContainer.style.display === 'flex') {
        chatContainer.style.display = 'none';
        chatToggle.style.display = 'block';
    } else {
        chatContainer.style.display = 'flex';
        chatToggle.style.display = 'none';
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    addChatMessage('You', message, 'user');
    chatInput.value = '';
    
    if (socket) {
        socket.emit('chat_message', { message: message });
    } else {
        // Fallback to HTTP
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            addChatMessage('AI', data.response, 'ai');
        })
        .catch(error => {
            console.error('Chat error:', error);
            addChatMessage('AI', 'Sorry, I encountered an error. Please try again.', 'ai');
        });
    }
}

function addChatMessage(sender, message, type) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function handleDragOver(event) {
    event.preventDefault();
    event.target.classList.add('dragover');
}

function handleDragLeave(event) {
    event.target.classList.remove('dragover');
}

// Processing Status Updates
function updateProcessingStatus(data) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const processingLog = document.getElementById('processingLog');
    
    progressFill.style.width = data.progress + '%';
    progressText.textContent = data.message;
    
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${data.message}`;
    processingLog.appendChild(logEntry);
    processingLog.scrollTop = processingLog.scrollHeight;
}

function handleProcessingComplete(data) {
    processingData = data;
    nextStep(5);
    displayApprovalContent(data);
    
    addChatMessage('AI', 'Processing complete! Please review the results.', 'ai');
}

function handleProcessingError(error) {
    console.error('Processing error:', error);
    alert('Error: ' + error.message);
}

function handleApprovalRequest(data) {
    addChatMessage('AI', `I need approval for: ${data.question}`, 'ai');
    
    // Show approval dialog
    const approvalDiv = document.createElement('div');
    approvalDiv.className = 'approval-request';
    approvalDiv.innerHTML = `
        <p>${data.question}</p>
        <button onclick="approveQuestion('${data.id}', true)" class="bg-green-600 text-white px-2 py-1 rounded">Yes</button>
        <button onclick="approveQuestion('${data.id}', false)" class="bg-red-600 text-white px-2 py-1 rounded">No</button>
    `;
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.appendChild(approvalDiv);
}

function approveQuestion(id, approved) {
    if (socket) {
        socket.emit('approval_response', { id: id, approved: approved });
    }
}

// Load Templates
async function loadTemplates() {
    try {
        const response = await fetch('/api/templates');
        const templates = await response.json();
        
        // Templates would be used for predefined templates
        console.log('Available templates:', templates);
        
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

// Reset Process
function resetProcess() {
    uploadedFiles = [];
    templateFile = null;
    processingData = null;
    currentStep = 1;
    
    // Reset UI
    document.querySelectorAll('.step-content').forEach(content => {
        content.style.display = 'none';
    });
    
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    document.getElementById('step1-content').style.display = 'block';
    document.querySelector('.step[data-step="1"]').classList.add('active');
    
    // Clear file inputs
    document.getElementById('folderInput').value = '';
    document.getElementById('templateInput').value = '';
    document.getElementById('promptInput').value = '';
    
    // Clear displays
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('folderPreview').style.display = 'none';
    document.getElementById('templatePreview').style.display = 'none';
    document.getElementById('templateStructure').innerHTML = '';
    
    // Reset progress
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = 'Ready to start processing...';
    document.getElementById('processingLog').innerHTML = '';
    
    // Reset buttons
    document.getElementById('nextStep1').style.display = 'none';
    document.getElementById('nextStep2').style.display = 'none';
}

// Validate prompt
function validatePrompt() {
    const prompt = document.getElementById('promptInput').value.trim();
    const nextButton = document.getElementById('nextStep3');
    
    if (prompt.length > 10) {
        nextButton.style.display = 'inline-block';
    } else {
        nextButton.style.display = 'none';
    }
}

// Auto-save functionality
let autoSaveTimer;
function autoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        const state = {
            uploadedFiles: uploadedFiles.map(f => ({ name: f.name, size: f.size })),
            templateFile: templateFile ? { name: templateFile.name, size: templateFile.size } : null,
            prompt: document.getElementById('promptInput').value,
            currentStep: currentStep
        };
        
        localStorage.setItem('rapid-ai-state', JSON.stringify(state));
    }, 1000);
}

// Load saved state
document.addEventListener('DOMContentLoaded', function() {
    const savedState = localStorage.getItem('rapid-ai-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.prompt) {
            document.getElementById('promptInput').value = state.prompt;
        }
    }
});

// Add event listeners for auto-save
document.getElementById('promptInput').addEventListener('input', autoSave);