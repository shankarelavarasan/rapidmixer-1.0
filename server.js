require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ No GEMINI_API_KEY in env!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask-gemini", async (req, res) => {
  try {
    const message = req.body.message;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
