import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import geminiRoutes from './routes/gemini.js';
import cors from "cors";
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const allowedOrigins = [
    'https://shankarelavarasan.github.io',
    ...(process.env.ALLOWED_ORIGINS || '').split(',')
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/api/process', upload.fields([{ name: 'template', maxCount: 1 }, { name: 'documents' }]), (req, res) => {
    const templateFile = req.files.template ? req.files.template[0] : null;
    const documentFiles = req.files.documents || [];

    if (!templateFile || documentFiles.length === 0) {
        return res.status(400).json({ message: 'Template and documents are required.' });
    }

    // Placeholder for AI processing logic
    console.log('Template File:', templateFile.filename);
    console.log('Document Files:', documentFiles.map(f => f.filename));

    res.json({ 
        message: 'Files uploaded successfully. Processing...', 
        template: templateFile.filename,
        documents: documentFiles.map(f => f.filename)
    });
});

app.post('/api/chat', (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required.' });
    }
    // Placeholder for AI chat logic
    res.json({ response: `You said: "${prompt}". I am a helpful assistant.` });
});

app.use('/', geminiRoutes);

// Serve frontend files from the 'docs' directory
app.use(express.static('docs'));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
