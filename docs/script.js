document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const folderInput = document.getElementById('folder-input');

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Get the first selected file
        if (!file) return; // Exit if no file is selected

        console.log('Selected file:', file.name);

        const reader = new FileReader();

        reader.onload = (e) => {
            const fileContent = e.target.result; // Read the file content
            console.log('File content loaded.');
            // Now send the file content to the AI
            sendFileContentToAI(fileContent, file.name); // Call the new function
        };

        reader.onerror = (e) => {
            console.error("Error reading file:", e);
            // You could show an error message to the user here
        };

        // Tell the FileReader to read the file as text
        reader.readAsText(file);
    });

    folderInput.addEventListener('change', (event) => {
        const files = event.target.files;
        console.log('Selected folder contents:', files);
        // Logic to handle multiple files from a folder needs to be implemented here.
        // This would likely involve iterating through the 'files' FileList,
        // reading each one, and sending their content to the backend.
    });

  const askBtn = document.getElementById("askBtn");
  const userInput = document.getElementById("userInput");
  const chatContainer = document.getElementById("chat-container");

  const exportTxtBtn = document.getElementById("exportTxt");
  const exportPdfBtn = document.getElementById("exportPdf");
  const exportDocBtn = document.getElementById("exportDoc");
  const newChatBtn = document.getElementById("newChatBtn");

  const askAI = async () => {
    const question = userInput.value.trim();
    if (!question) return;

    appendMessage(question, "user");
    userInput.value = "";

    appendMessage("🤖 Thinking...", "ai");

    try {
      const res = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: question }),
      });

      const data = await res.json();
      updateLastAIMessage(data.response || "🤖 Sorry, something went wrong.");
    } catch (error) {
      updateLastAIMessage("❌ Error fetching response.");
      console.error("❌ Fetch Error:", error);
    }
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

  const sendFileContentToAI = async (content, fileName) => {
    appendMessage(`📁 Sending file: ${fileName}`, "user");
    appendMessage("🤖 Processing file...", "ai");

    try {
        const res = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileContent: content, fileName: fileName }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
        }

        const data = await res.json();
        updateLastAIMessage(data.response || "🤖 Sorry, something went wrong with file processing.");

    } catch (error) { 
        updateLastAIMessage("❌ Error processing file.");
        console.error("❌ File Fetch Error:", error);
    }
  };

});
