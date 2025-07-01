document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("userInput").value;
  const responseBox = document.getElementById("responseBox");

  // பதில் லோடிங் animation
  responseBox.innerHTML = "🤖 பதில் தயாராகிறது... தயவு செய்து காத்திருக்கவும்...";

  try {
    const res = await fetch("https://rapid-ai-assistant.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: question })
    });

    // பதிலை JSON ஆக மாற்று
    const data = await res.json();

    // Gemini-ன் பதிலை காட்டுங்கள்
    responseBox.innerHTML = data.response || "🤖 பதில் கிடைக்கவில்லை.";
  } catch (error) {
    responseBox.innerHTML = "❌ பிழை ஏற்பட்டது. தயவு செய்து மீண்டும் முயற்சிக்கவும்.";
    console.error("❌ Fetch Error:", error);
  }
});
