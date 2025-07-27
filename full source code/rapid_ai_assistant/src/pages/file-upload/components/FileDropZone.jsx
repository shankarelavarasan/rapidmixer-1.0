import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileDropZone = ({ onFilesSelected, acceptedTypes, maxFileSize }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsProcessing(true);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setIsProcessing(true);
    processFiles(files);
  };

  const processFiles = async (files) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    onFilesSelected(files);
    setIsProcessing(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openFolderDialog = () => {
    folderInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Main Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
          }
          ${isProcessing ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg font-medium text-foreground">Processing files...</div>
            <div className="text-sm text-muted-foreground">Analyzing file types and preparing for upload</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-6">
              {/* Upload Icon */}
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                ${isDragOver ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground'}
              `}>
                <Icon name="Upload" size={32} />
              </div>

              {/* Main Text */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {isDragOver ? 'Drop files here' : 'Drag & drop files or folders'}
                </h3>
                <p className="text-muted-foreground">
                  Or click to browse your computer
                </p>
              </div>

              {/* Supported Formats */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: 'FileText', label: 'PDF', color: 'text-red-500' },
                  { icon: 'FileSpreadsheet', label: 'Excel', color: 'text-green-500' },
                  { icon: 'Image', label: 'Images', color: 'text-blue-500' },
                  { icon: 'FileType', label: 'Word', color: 'text-indigo-500' }
                ].map((type) => (
                  <div key={type.label} className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full">
                    <Icon name={type.icon} size={16} className={type.color} />
                    <span className="text-xs font-medium text-muted-foreground">{type.label}</span>
                  </div>
                ))}
              </div>

              {/* File Size Limit */}
              <div className="text-xs text-muted-foreground">
                Maximum file size: {formatFileSize(maxFileSize)} per file
              </div>
            </div>
          </>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          variant="outline"
          onClick={openFileDialog}
          iconName="File"
          iconPosition="left"
          className="flex-1"
          disabled={isProcessing}
        >
          Select Files
        </Button>
        <Button
          variant="outline"
          onClick={openFolderDialog}
          iconName="Folder"
          iconPosition="left"
          className="flex-1"
          disabled={isProcessing}
        >
          Select Folder
        </Button>
      </div>

      {/* Upload Tips */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Upload Tips:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Batch upload multiple files for faster processing</li>
              <li>• Folder uploads maintain directory structure</li>
              <li>• All processing happens locally - your data never leaves your device</li>
              <li>• Supported formats: PDF, Excel (.xlsx, .xls), Images (JPG, PNG), Word (.docx)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropZone;