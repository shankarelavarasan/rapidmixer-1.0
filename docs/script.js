document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const folderInput = document.getElementById('folder-input');

    let loadedFolderFiles = []; // { name: 'filename.txt', content: 'file content' }

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        appendMessage(`📁 Reading ${file.name}...`, "user");
        const reader = new FileReader();

        reader.onload = (e) => {
            const fileContent = e.target.result;
            loadedFolderFiles = [{ name: file.name, content: fileContent }];
            appendMessage(`✅ Finished reading ${file.name}. Now ask AI a question.`, "ai");
        };

        reader.onerror = (e) => {
            console.error(`Error reading file ${file.name}:`, e);
            appendMessage(`❌ Error reading file ${file.name}.`, "ai");
        };

        reader.readAsText(file);
    });

    folderInput.addEventListener('change', (event) => {
        const files = event.target.files;
        loadedFolderFiles = []; // Clear previous files

        if (files.length === 0) {
            appendMessage("No files selected from folder.", "ai");
            return;
        }

        appendMessage(`📁 Reading ${files.length} files from folder...`, "user");

        let filesReadCount = 0;
        const totalFiles = files.length;

        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (e) => {
                const fileContent = e.target.result;
                loadedFolderFiles.push({ name: file.name, content: fileContent });

                filesReadCount++;
                if (filesReadCount === totalFiles) {
                    appendMessage(`✅ Finished reading ${totalFiles} files. Now ask AI a question.`, "ai");
                }
            };

            reader.onerror = (e) => {
                console.error("Error reading file:", file.name, e);
                filesReadCount++;
                if (filesReadCount === totalFiles) {
                    appendMessage(`❌ Finished reading folder with errors.`, "ai");
                }
            };

            reader.readAsText(file);
        }
    });


  const askBtn = document.getElementById("askBtn");
  const userInput = document.getElementById("userInput");
  const chatContainer = document.getElementById("chat-container");

  const exportTxtBtn = document.getElementById("exportTxt");
  const exportPdfBtn = document.getElementById("exportPdf");
  const exportDocBtn = document.getElementById("exportDoc");
  const newChatBtn = document.getElementById("newChatBtn");
  const imageToTextBtn = document.getElementById("image-to-text-btn");
  const voiceToTextBtn = document.getElementById("voice-to-text-btn");
  const imageInput = document.getElementById("image-input");
  const loadTemplateBtn = document.getElementById("load-template-btn");
  const templateInput = document.getElementById("template-input");



  const processEntry = async () => {
      const userInputText = userInput.value.trim();
      if (!userInputText) {
          appendMessage("Please provide instructions for the entry.", "ai");
          return;
      }

      // For now, we'll use a hardcoded folder path.
      // In a real application, you'd get this from a folder picker.
      const folderPath = 'C:/Users/admin/rapid-ai-assistant/entries';

      appendMessage(`📝 Processing entry with your instructions...`, "user");
      userInput.value = "";

      try {
          const res = await fetch("/process-entry", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                  userInput: userInputText,
                  folderPath: folderPath
              }),
          });

          if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
          }

          const data = await res.json();
          appendMessage(`✅ Entry created at: ${data.data.file_path}`, "ai");
      } catch (error) {
          appendMessage(`❌ Error: ${error.message}`, "ai");
          console.error("❌ Fetch Error:", error);
      }
  };

  const askAI = async () => {
      const question = userInput.value.trim();
      if (!question && loadedFolderFiles.length === 0) {
          appendMessage("Please enter a question or select a folder/file.", "ai");
          return;
      }

      appendMessage(question || "Processing files...", "user");
      userInput.value = "";

      appendMessage("🤖 Thinking...", "ai");

      const filesToSend = loadedFolderFiles;

      try {
          const res = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                  prompt: question,
                  filesData: filesToSend
              }),
          });

          if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
          }

          const data = await res.json();
          updateLastAIMessage(data.response || "🤖 Sorry, something went wrong.");
      } catch (error) {
          updateLastAIMessage(`❌ Error: ${error.message}`);
          console.error("❌ Fetch Error:", error);
      }
  };

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

  templateInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    appendMessage(`📄 Using ${file.name} as a template.`, 'user');
    // Store template file for backend processing
    const reader = new FileReader();
    reader.onload = (e) => {
        // We can store the template content if needed on the frontend
        // For now, we just acknowledge it's loaded.
        appendMessage(`✅ Template ${file.name} is ready. Now, provide instructions in the chat.`, 'ai');
    };
    reader.readAsText(file); // or readAsDataURL for binary files
  });

});
