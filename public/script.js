document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("userInput").value;
  const responseBox = document.getElementById("responseBox");
  responseBox.innerHTML = "🤖 பதில் தயார் ஆகிறது...";

  try {
    const res = await fetch("https://rapid-ai-assistant.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: question })
    });

    const data = await res.json();
    responseBox.innerHTML = data.response || "🤖 பதில் இல்லை";
  } catch (error) {
    responseBox.innerHTML = "❌ பிழை ஏற்பட்டது!";
    console.error("Frontend error:", error);
  }
});
