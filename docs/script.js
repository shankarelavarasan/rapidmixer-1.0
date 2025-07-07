document.addEventListener('DOMContentLoaded', () => {
    const templateInput = document.getElementById('templateInput');
    let templateFile = null;
    let templateContent = null; // To store template content

    templateInput.addEventListener('change', (event) => {
        templateFile = event.target.files[0];
        if (templateFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                templateContent = e.target.result;
                appendMessage(`📄 Template added: ${templateFile.name}`, 'ai');
            };
            reader.readAsText(templateFile);
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
      const question = userInput.value.trim().toLowerCase();

      if (question.includes('fill template')) {
          processAndFillTemplates();
          userInput.value = "";
          return;
      }

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

  const processAndFillTemplates = () => {
    if (!templateContent) {
        appendMessage("Please add a template file first.", "ai");
        return;
    }
    if (loadedFolderFiles.length === 0) {
        appendMessage("Please select a folder with data files first.", "ai");
        return;
    }

    appendMessage("🤖 Processing files and filling templates...", "ai");
    generatedFiles = []; // Clear previous generated files

    loadedFolderFiles.forEach((file) => {
        const data = extractData(file.content);
        const filledContent = fillTemplate(templateContent, data);
        const originalExtension = templateFile.name.split('.').pop();
        generatedFiles.push({
            filename: `filled_${file.name.replace(/\.[^/.]+$/, "")}.${originalExtension}`,
            content: filledContent
        });
    });

    if (generatedFiles.length > 0) {
        updateLastAIMessage(`✅ Successfully generated ${generatedFiles.length} files. Select an export format and click 'Download Output'.`);
    } else {
        updateLastAIMessage("❌ Could not generate any files. Check your template and data files.");
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
  let generatedFiles = []; // To store { filename: '...', content: '...' }

  const fillTemplate = (template, data) => {
    let filledTemplate = template;
    for (const key in data) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        filledTemplate = filledTemplate.replace(regex, data[key]);
    }
    return filledTemplate;
  };

  const extractData = (text) => {
    const data = {};
    const patterns = {
        'Bill No': /Bill No[:\s]+(\w+)/i,
        'Date': /Date[:\s]+([\d-]+)/i,
        'GST': /GST[:\s]+([\d%]+)/i,
        'Qty': /Qty[:\s]+(\d+)/i,
        'Amount': /Amount[:\s]+([\d,]+)/i,
        'Invoice Date': /Invoice Date[:\s]+([\d-]+)/i,
        'Item': /Item[:\s]+(\w+)/i,
        'Total': /Total[:\s]+([\d,]+)/i
    };

    for (const key in patterns) {
        const match = text.match(patterns[key]);
        if (match) {
            data[key] = match[1].trim();
        }
    }
    return data;
  };

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
    const blob = (content instanceof Blob) ? content : new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  exportBtn.addEventListener("click", () => {
    const format = exportFormat.value;

    if (generatedFiles.length > 0) {
        generatedFiles.forEach(file => {
            const content = file.content;
            const filename = file.filename.replace(/\.[^/.]+$/, "");

            switch(format) {
                case 'txt':
                    exportAsFile(content, `${filename}.txt`, 'text/plain');
                    break;
                case 'pdf':
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    doc.text(content, 10, 10);
                    doc.save(`${filename}.pdf`);
                    break;
                case 'docx':
                    const docxContent = new docx.Document({
                        sections: [{
                            children: [new docx.Paragraph({ children: [new docx.TextRun(content)] })],
                        }],
                    });
                    docx.Packer.toBlob(docxContent).then(blob => {
                        exportAsFile(blob, `${filename}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    });
                    break;
            }
        });
        return;
    }

    if (!lastAIResponse) {
        alert("There is no AI response or generated files to export.");
        return;
    }

    // Fallback to exporting the last AI response if no files were generated
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
                    children: [new docx.Paragraph({ children: [new docx.TextRun(lastAIResponse)] })],
                }],
            });
            docx.Packer.toBlob(docxContent).then(blob => {
                exportAsFile(blob, 'ai_output.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
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
    loadedFolderFiles = [];
    templateFile = null;
    templateContent = null;
    generatedFiles = [];
    lastAIResponse = "";
  });

});
