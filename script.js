document.getElementById('zipInput').addEventListener('change', function (e) {
  const files = e.target.files;
  let allText = '';
  let txtCount = 0;

  const readerPromises = Array.from(files).map(file => {
    if (!file.type && file.name.endsWith('.txt')) {
      txtCount++;
      return file.text().then(content => {
        allText += `\n\n--- ${file.name} ---\n${content}`;
      });
    }
  });

  Promise.all(readerPromises).then(() => {
    document.getElementById("responseArea").textContent = `📄 ${txtCount} files loaded.\nReady to run Gemini.`;
  });
});

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const userPrompt = document.getElementById('promptInput').value;
  const displayText = document.getElementById("responseArea").textContent;

  if (!displayText.includes("---")) {
    alert("📂 Please select a folder with .txt files first!");
    return;
  }

  const fullPrompt = userPrompt + '\n\n' + displayText;

  document.getElementById("responseArea").textContent = "⌛ Sending prompt to Gemini...";

  try {
    const response = await fetch("https://plaid-occipital-noise.glitch.me/ask-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt })
    });

    const result = await response.text();
    document.getElementById("responseArea").textContent = result;
  } catch (error) {
    document.getElementById("responseArea").textContent = "❌ Gemini API failed.\n" + error;
  }
});
