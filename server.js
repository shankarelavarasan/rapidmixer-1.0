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
  
app.use(cors({ 
   origin: '*', // Allow all origins 
   methods: ['GET', 'POST'], // Allowed methods 
   allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers 
 })); 
 app.use(express.json()); 
 app.use(express.urlencoded({ extended: true })); 
  
 // Serve frontend files from the 'docs' directory 
 app.use(express.static('docs')); 
 




// Gemini API routes
app.use('/api', geminiRoutes); 
  
 app.listen(PORT, () => { 
   console.log(`✅ Server running on port ${PORT}`); 
 });
