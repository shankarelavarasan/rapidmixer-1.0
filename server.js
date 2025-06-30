const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post("/ask-gemini", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

app.listen(port, () => {
  console.log(`✅ Listening on port ${port}`);
});
