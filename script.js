const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();
const port = 1988;

app.use(cors()); // ✅ Allow all origins (Important!)
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask-gemini", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.send(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).send("Gemini API request failed.");
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
