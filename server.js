const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/ask-gemini", async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Gemini API request failed." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Listening on port ${PORT}`);
});
