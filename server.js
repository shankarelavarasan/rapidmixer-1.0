// server.js

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import geminiRoutes from './routes/gemini.js';
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Allow requests from your GitHub Pages site
const corsOptions = {
  origin: 'https://shankarelavarasan.github.io',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/', geminiRoutes);

// Serve frontend files from the 'docs' directory

app.use(express.static('docs'));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
