// public/script.js

document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("userInput").value;
  const responseBox = document.getElementById("responseBox");
  responseBox.innerHTML = "Thinking...";

  const res = await fetch("/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: question })
  });

  const data = await res.json();
  responseBox.innerHTML = data.response || "No response from Gemini";
});
