import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TemplateUpload = ({ isOpen, onClose, onUpload }) => {
  const [uploadStep, setUploadStep] = useState(1);
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: '',
    supportedFileTypes: [],
    referenceFiles: [],
    aiPrompt: '',
    outputFormat: 'pdf'
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'invoice', label: 'Invoice Processing' },
    { value: 'data-extraction', label: 'Data Extraction' },
    { value: 'content-generation', label: 'Content Generation' },
    { value: 'document-analysis', label: 'Document Analysis' },
    { value: 'report-generation', label: 'Report Generation' },
    { value: 'form-processing', label: 'Form Processing' }
  ];

  const outputFormats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'word', label: 'Word Document' },
    { value: 'json', label: 'JSON Data' },
    { value: 'csv', label: 'CSV File' }
  ];

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'word', label: 'Word' },
    { value: 'image', label: 'Images' },
    { value: 'csv', label: 'CSV' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'text/csv'];
      return validTypes.includes(file.type);
    });

    setTemplateData(prev => ({
      ...prev,
      referenceFiles: [...prev.referenceFiles, ...validFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }))]
    }));
  };

  const removeFile = (fileId) => {
    setTemplateData(prev => ({
      ...prev,
      referenceFiles: prev.referenceFiles.filter(file => file.id !== fileId)
    }));
  };

  const handleInputChange = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (uploadStep < 3) {
      setUploadStep(uploadStep + 1);
    }
  };

  const handlePrevious = () => {
    if (uploadStep > 1) {
      setUploadStep(uploadStep - 1);
    }
  };

  const handleSubmit = () => {
    onUpload(templateData);
    onClose();
    setUploadStep(1);
    setTemplateData({
      name: '',
      description: '',
      category: '',
      supportedFileTypes: [],
      referenceFiles: [],
      aiPrompt: '',
      outputFormat: 'pdf'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create Custom Template</h2>
            <p className="text-sm text-muted-foreground">Step {uploadStep} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step <= uploadStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {step < uploadStep ? <Icon name="Check" size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${step < uploadStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Basic Info</span>
            <span>Reference Files</span>
            <span>AI Configuration</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {uploadStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Template Name"
                placeholder="Enter template name"
                value={templateData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
              
              <Input
                label="Description"
                placeholder="Describe what this template does"
                value={templateData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />

              <Select
                label="Category"
                placeholder="Select a category"
                options={categories}
                value={templateData.category}
                onChange={(value) => handleInputChange('category', value)}
                required
              />

              <Select
                label="Supported File Types"
                placeholder="Select supported file types"
                options={fileTypeOptions}
                value={templateData.supportedFileTypes}
                onChange={(value) => handleInputChange('supportedFileTypes', value)}
                multiple
                required
              />
            </div>
          )}

          {uploadStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reference Files
                </label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload example files that demonstrate the expected input and output format
                </p>
              </div>

              {/* File Upload Area */}
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF, Excel, Word, Images, and CSV files
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files List */}
              {templateData.referenceFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
                  {templateData.referenceFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon name="File" size={16} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 hover:bg-destructive/10 text-destructive rounded transition-smooth"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {uploadStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  AI Processing Prompt
                </label>
                <textarea
                  placeholder="Describe how the AI should process the uploaded files..."
                  value={templateData.aiPrompt}
                  onChange={(e) => handleInputChange('aiPrompt', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific about what data to extract and how to format the output
                </p>
              </div>

              <Select
                label="Output Format"
                placeholder="Select output format"
                options={outputFormats}
                value={templateData.outputFormat}
                onChange={(value) => handleInputChange('outputFormat', value)}
                required
              />

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon name="Lightbulb" size={16} className="text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Pro Tip</p>
                    <p className="text-xs text-muted-foreground">
                      Include specific examples in your prompt for better AI performance. 
                      Reference the uploaded files to show expected input/output patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={uploadStep === 1 ? onClose : handlePrevious}
          >
            {uploadStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          <div className="flex space-x-2">
            {uploadStep < 3 ? (
              <Button
                variant="default"
                onClick={handleNext}
                disabled={
                  (uploadStep === 1 && (!templateData.name || !templateData.category)) ||
                  (uploadStep === 2 && templateData.referenceFiles.length === 0)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={!templateData.aiPrompt}
              >
                Create Template
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateUpload;