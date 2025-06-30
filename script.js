document.getElementById("askBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const resBox = document.getElementById("response");

  try {
    const response = await fetch("https://rapid-ai-assistant.onrender.com/ask-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (response.ok) {
      resBox.textContent = data.text;
    } else {
      resBox.textContent = "Error: " + data.error;
    }
  } catch (error) {
    resBox.textContent = "Gemini API call failed: " + error;
  }
});
