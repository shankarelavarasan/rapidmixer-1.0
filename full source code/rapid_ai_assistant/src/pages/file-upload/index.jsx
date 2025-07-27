import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProgressIndicator from '../../components/ui/ProgressIndicator';
import FileDropZone from './components/FileDropZone';
import FileQueue from './components/FileQueue';
import UploadSidebar from './components/UploadSidebar';
import FileTypeValidator from './components/FileTypeValidator';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const FileUpload = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validatedFiles, setValidatedFiles] = useState([]);
  const [uploadSettings, setUploadSettings] = useState({
    autoTemplateMatch: true,
    batchProcessing: true,
    privacyMode: true,
    autoRedirect: false
  });
  const [isUploading, setIsUploading] = useState(false);

  // Supported file types and size limits
  const acceptedTypes = '.pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.gif,.txt';
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    // Set page title
    document.title = 'File Upload - Rapid AI Assistant';
  }, []);

  const handleFilesSelected = (files) => {
    // Filter out duplicates based on name and size
    const newFiles = files.filter(newFile => 
      !selectedFiles.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setValidatedFiles([]);
  };

  const handleValidationComplete = (validated) => {
    setValidatedFiles(validated);
  };

  const handleSettingsChange = (newSettings) => {
    setUploadSettings(newSettings);
  };

  const handleStartProcessing = async () => {
    if (validatedFiles.filter(f => f.isValid).length === 0) {
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUploading(false);
    
    // Navigate based on settings
    if (uploadSettings.autoRedirect) {
      navigate('/ai-processing');
    } else {
      navigate('/template-library');
    }
  };

  const validFileCount = validatedFiles.filter(f => f.isValid).length;
  const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Upload Files</h1>
                <p className="text-muted-foreground">
                  Securely upload your documents for AI-powered processing. All data remains local and private.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {selectedFiles.length} files selected
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(totalSize)} total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <ProgressIndicator 
              currentStep={1} 
              totalSteps={4}
              steps={[
                { label: 'Upload', icon: 'Upload', description: 'Select files' },
                { label: 'Template', icon: 'FileTemplate', description: 'Choose template' },
                { label: 'Process', icon: 'Brain', description: 'AI analysis' },
                { label: 'Export', icon: 'Download', description: 'Download results' }
              ]}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Drop Zone */}
              <FileDropZone
                onFilesSelected={handleFilesSelected}
                acceptedTypes={acceptedTypes}
                maxFileSize={maxFileSize}
              />

              {/* File Validation */}
              {selectedFiles.length > 0 && (
                <FileTypeValidator
                  files={selectedFiles}
                  onValidationComplete={handleValidationComplete}
                />
              )}

              {/* File Queue */}
              {selectedFiles.length > 0 && (
                <FileQueue
                  files={selectedFiles}
                  onRemoveFile={handleRemoveFile}
                  onClearAll={handleClearAll}
                />
              )}

              {/* Processing Actions */}
              {validFileCount > 0 && (
                <div className="p-6 bg-card border border-border rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Ready to Process
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {validFileCount} files ready for AI analysis
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/template-library')}
                        iconName="FileTemplate"
                        iconPosition="left"
                      >
                        Choose Template
                      </Button>
                      <Button
                        variant="default"
                        onClick={handleStartProcessing}
                        loading={isUploading}
                        iconName="Brain"
                        iconPosition="left"
                      >
                        Start Processing
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <UploadSidebar
                  uploadProgress={[]}
                  processingStats={{}}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            </div>
          </div>

          {/* Mobile Summary */}
          <div className="lg:hidden mt-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Files" size={20} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {selectedFiles.length} files selected
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {validFileCount} ready for processing
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {formatFileSize(totalSize)}
                </div>
                <div className="text-xs text-muted-foreground">Total size</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUpload;