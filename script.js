document.getElementById("askBtn").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value;
  const responseBox = document.getElementById("responseBox");

  responseBox.innerText = "Thinking...";

  try {
    const response = await fetch("/ask-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    });

    if (!response.ok) throw new Error("Gemini API response not ok");

    const data = await response.json();
    responseBox.innerText = data.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    responseBox.innerText = "❌ API failed. Please try again.";
  }
});
