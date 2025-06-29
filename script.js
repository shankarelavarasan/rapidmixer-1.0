document.getElementById('folderInput').addEventListener('change', async function (e) {
  const files = e.target.files;
  let allText = '';
  for (const file of files) {
    if (file.name.endsWith('.txt')) {
      const content = await file.text();
      allText += `\n\n--- ${file.name} ---\n${content}`;
    }
  }

  const prompt = document.getElementById('promptInput').value;
  const fullPrompt = prompt + "\n\n" + allText;

  document.getElementById("responseArea").textContent = "⌛ Processing...";

  const response = await fetch("https://plaid-occipital-noise.glitch.me/ask-gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: fullPrompt })
  });

  const result = await response.text();
  document.getElementById("responseArea").textContent = result;
});