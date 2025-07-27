/**
 * Middleware for handling file and folder uploads
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { FileProcessingError } from './errorHandler.js';

// Configure storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Allow all file types - validation will happen in the service layer
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Maximum 50 files per upload
  }
});

/**
 * Middleware for handling single file uploads
 */
export const uploadSingleFile = upload.single('file');

/**
 * Middleware for handling multiple file uploads
 */
export const uploadMultipleFiles = upload.array('files', 50);

/**
 * Process uploaded folder structure
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const processFolderUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Group files by their folder structure
    const folderStructure = {};
    
    req.files.forEach(file => {
      // Extract folder path from the file path
      const relativePath = file.originalname;
      const folderPath = path.dirname(relativePath);
      
      if (!folderStructure[folderPath]) {
        folderStructure[folderPath] = [];
      }
      
      folderStructure[folderPath].push({
        name: path.basename(relativePath),
        content: file.buffer.toString('base64'),
        type: file.mimetype,
        size: file.size,
        path: relativePath
      });
    });
    
    // Attach folder structure to request object
    req.folderStructure = folderStructure;
    next();
  } catch (error) {
    next(new FileProcessingError(`Error processing folder upload: ${error.message}`));
  }
};

/**
 * Middleware for handling folder uploads
 */
export const uploadFolder = [upload.array('folder'), processFolderUpload];