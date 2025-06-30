document.getElementById('folderInput').addEventListener('change', async function (e) {
  const files = e.target.files;
  let allText = '';

  for (const file of files) {
    if (file.type === 'text/plain') {
      const content = await file.text();
      allText += `\n\n--- ${file.name} ---\n${content}`;
    }
  }

  const userPrompt = document.getElementById('promptInput').value;
  const fullPrompt = userPrompt + '\n\n' + allText;

  document.getElementById("responseArea").textContent = "⌛ Processing...";

  try {
    const response = await fetch("https://developing-fluff-sunday.glitch.me/ask-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt })
    });

    if (!response.ok) {
      throw new Error("Gemini API response not ok");
    }

    const result = await response.text();
    document.getElementById("responseArea").textContent = result;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    document.getElementById("responseArea").textContent = "❌ Gemini API call failed. Please try again.";
  }
});
