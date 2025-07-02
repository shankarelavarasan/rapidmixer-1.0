document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const folderInput = document.getElementById('folder-input');

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        appendMessage(`📁 Uploading ${file.name}...`, "user");
        const loadingMessage = appendMessage("⏳ Loading file...", "ai");

        try {
            const content = await readFileContent(file);
            await sendFileContentToAI(content, file.name);
            loadingMessage.remove(); // Remove loading message on success
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            updateLastAIMessage(`❌ Error processing file ${file.name}`);
        }
    });

    folderInput.addEventListener('change', async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        appendMessage(`📁 Processing ${files.length} files...`, "user");
        const loadingMessage = appendMessage("⏳ Loading files...", "ai");

        for (const file of files) {
            try {
                const content = await readFileContent(file);
                await sendFileContentToAI(content, file.name);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between files
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                appendMessage(`❌ Error processing file ${file.name}`, "user");
            }
        }
        loadingMessage.remove(); // Remove loading message after all files are processed
    });

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error(`Error reading file ${file.name}`));
            reader.readAsText(file);
        });
    };

  const askBtn = document.getElementById("askBtn");
  const userInput = document.getElementById("userInput");
  const chatContainer = document.getElementById("chat-container");

  const exportTxtBtn = document.getElementById("exportTxt");
  const exportPdfBtn = document.getElementById("exportPdf");
  const exportDocBtn = document.getElementById("exportDoc");
  const newChatBtn = document.getElementById("newChatBtn");

  const callAI = async (body, userMessage, thinkingMessage = "🤖 Thinking...") => {
    appendMessage(userMessage, "user");
    appendMessage(thinkingMessage, "ai");

    try {
      const res = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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

  const askAI = () => {
    const question = userInput.value.trim();
    if (!question) return;
    userInput.value = "";
    callAI({ prompt: question }, question);
  };

  const appendMessage = (text, sender) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", `${sender}-message`);
    messageDiv.innerText = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  const updateLastAIMessage = (text) => {
    const aiMessages = chatContainer.querySelectorAll('.ai-message');
    const lastMessage = aiMessages[aiMessages.length - 1];
    if (lastMessage) {
        lastMessage.innerText = text;
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
  });

  const sendFileContentToAI = (content, fileName) => {
    const userMessage = `📁 Analyzing ${fileName}`;
    const thinkingMessage = `🤖 Processing ${fileName}...`;
    return callAI({ fileContent: content, fileName: fileName }, userMessage, thinkingMessage);
  };

});
