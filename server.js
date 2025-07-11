import express from "express"; 
 import dotenv from "dotenv"; 
 import path from "path"; 
 import { fileURLToPath } from "url"; 
 import geminiRoutes from './routes/gemini.js'; 
 import cors from "cors";
import fs from 'fs'; 
  
 dotenv.config(); 
  
 const __filename = fileURLToPath(import.meta.url); 
 const __dirname = path.dirname(__filename); 
  
 const app = express(); 
 const PORT = process.env.PORT || 10000; 
  
app.use(cors()); 
 app.use(express.json()); 
 app.use(express.urlencoded({ extended: true })); 
  
 // Serve frontend files from the 'docs' directory 
 app.use(express.static('docs'));

/**
 * @route GET /api/templates
 * @description Get a list of available template files.
 * @access Public
 */
app.get('/api/templates', (req, res) => {
    const templatesDir = path.join(__dirname, 'docs', 'templates');
    fs.readdir(templatesDir, (err, files) => {
        if (err) {
            console.error('Error reading templates directory:', err);
            return res.status(500).send('Error reading templates directory');
        }
        res.json(files);
    });
});

// Gemini API routes
app.use('/api', geminiRoutes); 
  
 app.listen(PORT, () => { 
   console.log(`✅ Server running on port ${PORT}`); 
 });
