document.addEventListener('DOMContentLoaded', () => {
    const templateInput = document.getElementById('templateInput');
    let templateFile = null;

    templateInput.addEventListener('change', (event) => {
        templateFile = event.target.files[0];
        if (templateFile) {
            appendMessage(`📄 Template added: ${templateFile.name}`, 'ai');
        }
    });
    
    const folderInput = document.getElementById('folder-input');

    let loadedFolderFiles = []; // { name: 'filename.txt', content: 'file content' }



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

  const exportBtn = document.getElementById("exportBtn");
  const exportFormat = document.getElementById("exportFormat");

  const voiceTextBtn = document.getElementById("voiceTextBtn");
  const voiceTaskBtn = document.getElementById("voiceTaskBtn");
  const newChatBtn = document.getElementById("newChatBtn");



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
      const promptData = {
        prompt: question,
        filesData: filesToSend
      };

      if (templateFile) {
        promptData.templateFile = {
            name: templateFile.name,
            type: templateFile.type,
            size: templateFile.size
        };
      }

      try {
          const res = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(promptData),
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

  let lastAIResponse = "";

  const updateLastAIMessage = (text) => {
    const aiMessages = chatContainer.querySelectorAll('.ai-message');
    const lastMessage = aiMessages[aiMessages.length - 1];
    if (lastMessage) {
        lastMessage.innerText = text;
        lastAIResponse = text; // Store the response
    }
  }

  askBtn.addEventListener("click", askAI);
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

  const exportAsFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  exportBtn.addEventListener("click", () => {
    const format = exportFormat.value;
    if (!lastAIResponse) {
        alert("There is no AI response to export.");
        return;
    }

    switch(format) {
        case 'txt':
            exportAsFile(lastAIResponse, `ai_output.txt`, 'text/plain');
            break;
        case 'pdf':
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(lastAIResponse, 10, 10);
            doc.save('ai_output.pdf');
            break;
        case 'docx':
            const docxContent = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun(lastAIResponse)
                            ],
                        }),
                    ],
                }, ],
            });

            docx.Packer.toBlob(docxContent).then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ai_output.docx';
                a.click();
                URL.revokeObjectURL(url);
            });
            break;
    }
  });



  const startVoiceRecognition = (callback) => {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
          const result = event.results[0][0].transcript;
          callback(result);
      };
      recognition.start();
  }

  voiceTextBtn.addEventListener('click', () => {
      startVoiceRecognition(result => {
          userInput.value = result;
      });
  });

  voiceTaskBtn.addEventListener('click', () => {
      startVoiceRecognition(command => {
          command = command.toLowerCase();
          if (command.includes("select folder")) {
              folderInput.click();
          } else if (command.includes("add template")) {
              templateInput.click();
          } else if (command.includes("export")) {
              exportBtn.click();
          } else {
              alert("Command not recognized");
          }
      });
  });

  newChatBtn.addEventListener("click", () => {
    chatContainer.innerHTML = '';
    loadedFolderFiles = []; // Clear stored files on new chat
    templateFile = null;
  });

});
