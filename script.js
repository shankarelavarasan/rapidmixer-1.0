const analyzeBtn = document.getElementById("analyzeBtn");
const folderInput = document.getElementById("folderInput");
const promptInput = document.getElementById("prompt");
const responseText = document.getElementById("responseText");

analyzeBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    responseText.textContent = "Please enter a prompt.";
    return;
  }

  const files = Array.from(folderInput.files);
  const fileNames = files.map(file => file.name).join("\n");
  const fullPrompt = `User files:\n${fileNames}\n\nTask: ${prompt}`;

  try {
    responseText.textContent = "Thinking...";
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=REPLACE_WITH_KEY
", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      })
    });

    const data = await res.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    responseText.textContent = result;
  } catch (err) {
    responseText.textContent = "Error: " + err.message;
  }
});
