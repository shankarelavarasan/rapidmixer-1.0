document.getElementById('zipInput').addEventListener('change', function (e) {
  const zipFile = e.target.files[0];
  const reader = new FileReader();

  reader.onload = async function (event) {
    const zip = await JSZip.loadAsync(event.target.result);
    let allText = '';

    for (const filename in zip.files) {
      const file = zip.files[filename];
      if (!file.dir && file.name.endsWith('.txt')) {
        const content = await file.async('text');
        allText += `\n\n--- ${file.name} ---\n${content}`;
      }
    }

    // ✅ FIXED ID HERE (was 'promptInput', changed to 'prompt')
    const userPrompt = document.getElementById('prompt').value;
    const fullPrompt = userPrompt + '\n\n' + allText;

    document.getElementById("responseArea").textContent = "⌛ Processing...";

    const response = await fetch("https://balanced-bolder-rhythm.glitch.me/ask-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt })
    });

    const result = await response.text();
    document.getElementById("responseArea").textContent = result;
  };

  reader.readAsArrayBuffer(zipFile);
});
