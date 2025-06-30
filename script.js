document.getElementById("askBtn").addEventListener("click", async function () {
  const prompt = document.getElementById("prompt").value;
  const resultArea = document.getElementById("result");

  if (!prompt.trim()) {
    resultArea.textContent = "Please enter a question!";
    return;
  }

  resultArea.textContent = "Thinking...";

  try {
    const response = await fetch("https://your-backend-url.onrender.com/ask-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
      throw new Error("Gemini API response not ok");
    }

    const data = await response.json();
    resultArea.textContent = data.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    resultArea.textContent = "Error: Could not get response from Gemini API.";
  }
});
