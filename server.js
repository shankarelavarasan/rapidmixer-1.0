import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import geminiRoutes from './routes/gemini.js';
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', geminiRoutes);

// Serve frontend files from the 'docs' directory
app.use(express.static('docs'));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
