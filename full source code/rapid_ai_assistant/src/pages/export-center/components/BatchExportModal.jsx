import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const BatchExportModal = ({ isOpen, onClose, selectedFiles = [] }) => {
  const [batchSettings, setBatchSettings] = useState({
    createZipArchive: true,
    uniformFormat: true,
    selectedFormat: 'pdf',
    includeMetadata: false,
    passwordProtect: false,
    compressionLevel: 'medium'
  });

  const [fileSettings, setFileSettings] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'word', label: 'Word Document' },
    { value: 'text', label: 'Plain Text' }
  ];

  const compressionOptions = [
    { value: 'low', label: 'Low (Larger files, faster)' },
    { value: 'medium', label: 'Medium (Balanced)' },
    { value: 'high', label: 'High (Smaller files, slower)' }
  ];

  if (!isOpen) return null;

  const handleBatchSettingChange = (key, value) => {
    setBatchSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFileSettingChange = (fileId, key, value) => {
    setFileSettings(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [key]: value
      }
    }));
  };

  const getEstimatedSize = () => {
    const baseSize = selectedFiles.length * 2.5; // Average 2.5MB per file
    const compressionFactor = {
      low: 1.0,
      medium: 0.8,
      high: 0.6
    };
    return (baseSize * compressionFactor[batchSettings.compressionLevel]).toFixed(1);
  };

  const getEstimatedTime = () => {
    const baseTime = selectedFiles.length * 15; // 15 seconds per file
    return Math.ceil(baseTime / 60); // Convert to minutes
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Batch Export Settings</h3>
              
              <div className="space-y-4">
                <Checkbox
                  label="Create ZIP Archive"
                  description="Package all files into a single ZIP archive"
                  checked={batchSettings.createZipArchive}
                  onChange={(e) => handleBatchSettingChange('createZipArchive', e.target.checked)}
                />

                <Checkbox
                  label="Use Uniform Format"
                  description="Export all files in the same format"
                  checked={batchSettings.uniformFormat}
                  onChange={(e) => handleBatchSettingChange('uniformFormat', e.target.checked)}
                />

                {batchSettings.uniformFormat && (
                  <Select
                    label="Export Format"
                    options={formatOptions}
                    value={batchSettings.selectedFormat}
                    onChange={(value) => handleBatchSettingChange('selectedFormat', value)}
                  />
                )}

                <Select
                  label="Compression Level"
                  options={compressionOptions}
                  value={batchSettings.compressionLevel}
                  onChange={(value) => handleBatchSettingChange('compressionLevel', value)}
                />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Batch Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Files to export:</span>
                  <span className="text-foreground">{selectedFiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated size:</span>
                  <span className="text-foreground">{getEstimatedSize()} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing time:</span>
                  <span className="text-foreground">~{getEstimatedTime()} minutes</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Individual File Settings</h3>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon name="FileText" size={18} className="text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground mb-1">
                          {file.fileName}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {file.size} • {file.template}
                        </p>
                        
                        {!batchSettings.uniformFormat && (
                          <Select
                            label="Export Format"
                            options={formatOptions}
                            value={fileSettings[file.id]?.format || 'pdf'}
                            onChange={(value) => handleFileSettingChange(file.id, 'format', value)}
                            className="mb-3"
                          />
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            label="Password protect"
                            checked={fileSettings[file.id]?.passwordProtect || false}
                            onChange={(e) => handleFileSettingChange(file.id, 'passwordProtect', e.target.checked)}
                            size="sm"
                          />
                          <Checkbox
                            label="Add watermark"
                            checked={fileSettings[file.id]?.watermark || false}
                            onChange={(e) => handleFileSettingChange(file.id, 'watermark', e.target.checked)}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Security & Privacy</h3>
              
              <div className="space-y-4">
                <Checkbox
                  label="Remove All Metadata"
                  description="Strip all metadata from exported files for privacy"
                  checked={batchSettings.includeMetadata}
                  onChange={(e) => handleBatchSettingChange('includeMetadata', e.target.checked)}
                />

                <Checkbox
                  label="Password Protect Archive"
                  description="Protect the ZIP archive with a password"
                  checked={batchSettings.passwordProtect}
                  onChange={(e) => handleBatchSettingChange('passwordProtect', e.target.checked)}
                />

                {batchSettings.passwordProtect && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Archive Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter password for ZIP archive"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-success/10 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="Shield" size={16} className="text-success mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-success mb-1">Privacy Guaranteed</h4>
                  <p className="text-xs text-success/80">
                    All processing happens locally. Your files never leave your device, and export links expire after your session ends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return true;
    if (currentStep === 2) return true;
    if (currentStep === 3) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartExport = () => {
    console.log('Starting batch export with settings:', batchSettings, fileSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1100">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Batch Export</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure export settings for {selectedFiles.length} files
              </p>
            </div>
            <Button variant="ghost" size="sm" iconName="X" onClick={onClose} />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {step < currentStep ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`
                    w-12 h-0.5 mx-2
                    ${step < currentStep ? 'bg-primary' : 'bg-border'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of 3
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  variant="default"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleStartExport}
                  iconName="Download"
                  iconPosition="left"
                >
                  Start Export
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchExportModal;