require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/ask-gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const content = await model.generateContent(prompt);
    res.send(content.response.text());
  } catch (e) {
    console.error(e);
    res.status(500).send('Gemini API error');
  }
});

app.listen(PORT, () => console.log(`✅ Listening on port ${PORT}`));
