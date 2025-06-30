document.getElementById("ask-button").addEventListener("click", async () => {
  const prompt = document.getElementById("user-input").value;
  const resultEl = document.getElementById("result");

  if (!prompt.trim()) {
    resultEl.textContent = "❌ Please enter a question.";
    return;
  }

  resultEl.textContent = "⏳ Thinking...";

  try {
    const response = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      resultEl.textContent = "❌ API Failed";
      return;
    }

    const data = await response.json();
    resultEl.textContent = data.text || "❌ No result from Gemini";
  } catch (error) {
    console.error(error);
    resultEl.textContent = "❌ Network or server error";
  }
});
