document.getElementById("askBtn").addEventListener("click", async () => {
  const message = document.getElementById("userInput").value.trim();
  const resBox = document.getElementById("responseBox");
  if (!message) {
    resBox.textContent = "❌ Please enter a message.";
    return;
  }
  resBox.textContent = "⏳ Thinking...";
  try {
    const resp = await fetch("/ask-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    if (!resp.ok) throw new Error("API failed");
    const data = await resp.json();
    resBox.textContent = data.text;
  } catch (e) {
    console.error(e);
    resBox.textContent = "❌ API call failed.";
  }
});
