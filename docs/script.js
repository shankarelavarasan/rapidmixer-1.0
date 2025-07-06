document.addEventListener('DOMContentLoaded', () => {
    const templateForm = document.getElementById('template-form');
    const readFolderBtn = document.getElementById('read-folder-btn');
    const exportBtn = document.getElementById('export-btn');
    const templateDisplay = document.getElementById('template-display');

    // This will be populated by the template upload
    let templateFields = [];

    // Mock function to simulate template upload and field extraction
    const handleTemplateUpload = (file) => {
        // In a real scenario, you would send the file to the backend
        // The backend would parse it and return the fields.
        console.log("Simulating template upload for:", file.name);

        // For this example, we'll hardcode the fields based on the UI
        templateFields = ['Name', 'Date', 'Invoice No.', 'GST'];

        // Show the form
        templateDisplay.style.display = 'block';

        // You can also dynamically generate the form fields here if needed
        // For now, we assume the form is static in the HTML.
        alert('Template processed. You can now select a folder to fill the data.');
    };

    // We need a file input for the template, let's add it dynamically for now
    const templateFileInput = document.createElement('input');
    templateFileInput.type = 'file';
    templateFileInput.accept = '.txt,.pdf,.xlsx,.csv,.json,.jpg,.png';
    templateFileInput.style.display = 'none';
    document.body.appendChild(templateFileInput);

    // Trigger template file selection when the 'File Upload' link is clicked
    const fileUploadLink = document.querySelector('a[href="#"]'); // First link
    fileUploadLink.addEventListener('click', (e) => {
        e.preventDefault();
        templateFileInput.click();
    });

    templateFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleTemplateUpload(file);
        }
    });


    readFolderBtn.addEventListener('click', () => {
        // This would open a folder selector
        // For now, we'll just log to the console
        console.log('"Read Selected Folder & Fill Template" clicked');
        alert('Folder selection would happen here, and then AI would process the files.');
        // Here you would implement the logic to read files from a folder
        // and then call the AI to fill the template fields.
    });

    exportBtn.addEventListener('click', () => {
        console.log('"Export" clicked');
        alert('Export functionality would be implemented here.');
        // Here you would implement the logic to export the filled data
        // to Excel, CSV, etc.
    });
});

  const appendMessage = (text, sender) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", `${sender}-message`);
    messageDiv.innerText = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
  };

  const updateLastAIMessage = (text) => {
    const aiMessages = chatContainer.querySelectorAll('.ai-message');
    const lastMessage = aiMessages[aiMessages.length - 1];
    if (lastMessage) {
        lastMessage.innerText = text;
    }
  }

  askBtn.addEventListener("click", () => {
    // This is a simple way to decide which function to call.
    // You could have a more sophisticated way to determine the user's intent.
    if (loadedFolderFiles.length > 0 || userInput.value.toLowerCase().startsWith('ask:')) {
        askAI();
    } else {
        processEntry();
    }
  });
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      askAI();
    }
  });

  exportXlsxBtn.addEventListener("click", () => {
    const chatHistory = getChatHistoryForExport();
    const worksheet = XLSX.utils.json_to_sheet(chatHistory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chat History");
    XLSX.writeFile(workbook, "chat_history.xlsx");
  });

  const getChatHistoryForExport = () => {
    const history = [];
    const messages = chatContainer.querySelectorAll('.chat-message');
    messages.forEach(msg => {
        const sender = msg.classList.contains('user-message') ? 'You' : 'Rapid AI';
        history.push({ Sender: sender, Message: msg.innerText });
    });
    return history;
  }

  const getChatHistory = () => {
    let history = "";
    const messages = chatContainer.querySelectorAll('.chat-message');
    messages.forEach(msg => {
        const sender = msg.classList.contains('user-message') ? 'You' : 'Rapid AI';
        history += `${sender}: ${msg.innerText}\n\n`;
    });
    return history;
  }

  exportTxtBtn.addEventListener("click", () => {
    const history = getChatHistory();
    const blob = new Blob([history], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-history.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  exportPdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const history = getChatHistory();
    doc.text(history, 10, 10);
    doc.save('chat-history.pdf');
  });

  exportDocBtn.addEventListener("click", () => {
    const history = getChatHistory();
    const blob = new Blob([`<html><body>${history.replace(/\n/g, '<br>')}</body></html>`], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-history.doc';
    a.click();
    URL.revokeObjectURL(url);
  });

  newChatBtn.addEventListener("click", () => {
    chatContainer.innerHTML = '';
    loadedFolderFiles = []; // Clear stored files on new chat
  });

  imageToTextBtn.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    appendMessage(`🖼️ Processing image: ${file.name}...`, "user");

    // Here you would typically send the image to the server
    // to be processed by an OCR library or service.
    // For this example, we'll just simulate it.
    setTimeout(() => {
        const extractedText = `This is simulated text extracted from ${file.name}.`;
        userInput.value = extractedText;
        appendMessage(`✅ Image processed. Extracted text has been added to the input box.`, "ai");
    }, 2000);
  });

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  voiceToTextBtn.addEventListener('click', () => {
    recognition.start();
    voiceToTextBtn.style.color = '#ff4d4d'; // Indicate recording
  });

  recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');

    userInput.value = transcript;
  });

  recognition.addEventListener('end', () => {
    voiceToTextBtn.style.color = '#66fcf1'; // Reset color
  });

  loadTemplateBtn.addEventListener("click", () => {
    templateInput.click();
  });

  templateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fileInput = event.target.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    if (!file) {
        appendMessage("Please select a template file to upload.", "ai");
        return;
    }
    uploadTemplate(file);
  });

  const uploadTemplate = async (file) => {
    appendMessage(`📄 Uploading template: ${file.name}...`, "user");
    const formData = new FormData();
    formData.append('template', file);

    try {
        const res = await fetch("/upload-template", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
        }

        const data = await res.json();
        appendMessage(`✅ Template uploaded successfully. The following fields were found: ${data.fields.join(', ')}`, "ai");
    } catch (error) {
        appendMessage(`❌ Error uploading template: ${error.message}`, "ai");
        console.error("❌ Template Upload Error:", error);
    }
  };

  templateInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    appendMessage(`📄 Using ${file.name} as a template.`, 'user');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        appendMessage(`✅ Template ${file.name} is ready. Now, provide instructions in the chat.`, 'ai');
        
        // Ask for output format
        setTimeout(() => {
            const format = prompt("In which format should the final document be saved? (e.g., PDF, DOCX, XLSX)");
            if (format) {
                appendMessage(`📝 Understood. The output will be a ${format} file.`, 'ai');
                // You can store this preference and use it when calling the backend.
            }
        }, 500);
    };
    reader.readAsText(file);
  });

});
