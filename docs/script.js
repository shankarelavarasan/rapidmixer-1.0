// script.js

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const folderInput = document.getElementById('folder-input');

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        console.log('Selected files:', files);
        // நீங்கள் இப்போது தேர்ந்தெடுக்கப்பட்ட கோப்புகளைச் செயலாக்கலாம்
    });

    folderInput.addEventListener('change', (event) => {
        const files = event.target.files;
        console.log('Selected folder contents:', files);
        // நீங்கள் இப்போது தேர்ந்தெடுக்கப்பட்ட கோப்புகளைச் செயலாக்கலாம்
    });

  const askBtn = document.getElementById("askBtn");
  const userInput = document.getElementById("userInput");
  const chatContainer = document.getElementById("chat-container");

  const exportTxtBtn = document.getElementById("exportTxt");
  const exportPdfBtn = document.getElementById("exportPdf");
  const exportDocBtn = document.getElementById("exportDoc");

  const askAI = async () => {
    const question = userInput.value.trim();
    if (!question) return;

    appendMessage(question, "user");
    userInput.value = "";

    appendMessage("🤖 Thinking...", "ai");

    try {
      // ** இங்கேதான் API அழைப்பு முகவரி Render backend முழு முகவரிக்கு மாற்றப்பட்டுள்ளது **
      const res = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
        method: "POST", // POST முறை சரியாக உள்ளது
        headers: {
          "Content-Type": "application/json", // Content-Type சரியாக உள்ளது
        },
        body: JSON.stringify({ prompt: question }), // JSON body சரியாக உள்ளது
      });

      // பதில் வெற்றிகரமாக வந்ததா என்று status code-ஐ சரிபார்ப்பது நல்லது (optional but recommended)
      if (!res.ok) {
          const errorText = await res.text(); // பிழை பதிலை படிக்கவும்
          throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }

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
        // HTML உள்ளீடாகக் கருதுவதைத் தவிர்க்க innerText பயன்படுத்துகிறோம்
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
        // innerText பயன்படுத்துவதால் HTML entity-கள் சரியாக வரும்
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
    // PDF-க்கு உரை சேர்க்க
    const textLines = doc.splitTextToSize(history, 180); // பக்கத்தின் அகலத்திற்கு ஏற்ப உரையை பிரிக்கும்
    doc.text(textLines, 10, 10); // PDF-க்கு உரையை சேர்க்கும்

    doc.save('chat-history.pdf');
  });

  exportDocBtn.addEventListener("click", () => {
    // DOC export HTML structure பயன்படுத்தி - இது ஒரு அடிப்படை முறை
    const history = getChatHistory();
    // Line breaks-ஐ <br> ஆக மாற்றுகிறோம் HTML-க்காக
    const htmlContent = `<html><head><meta charset="UTF-8"></head><body>${history.replace(/\n/g, '<br>')}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-history.doc';
    a.click();
    URL.revokeObjectURL(url);
  });

});
