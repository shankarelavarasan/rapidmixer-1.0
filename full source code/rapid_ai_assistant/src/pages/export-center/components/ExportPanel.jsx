import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const ExportPanel = ({ selectedFile }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [customizations, setCustomizations] = useState({
    includeWatermark: false,
    passwordProtect: false,
    removeMetadata: true,
    compressFile: true
  });
  const [formatOptions, setFormatOptions] = useState({
    pdf: {
      pageSize: 'A4',
      orientation: 'portrait',
      quality: 'high'
    },
    excel: {
      sheetName: 'Export Data',
      includeFormulas: true,
      preserveFormatting: true
    },
    word: {
      template: 'standard',
      includeImages: true,
      pageBreaks: 'auto'
    },
    text: {
      encoding: 'UTF-8',
      lineEndings: 'auto',
      includeFormatting: false
    }
  });

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: 'FileText' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: 'FileSpreadsheet' },
    { value: 'word', label: 'Word Document', icon: 'FileText' },
    { value: 'text', label: 'Plain Text', icon: 'File' }
  ];

  const pageSizeOptions = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'Legal', label: 'Legal (8.5 × 14 in)' }
  ];

  const orientationOptions = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' }
  ];

  const qualityOptions = [
    { value: 'high', label: 'High Quality' },
    { value: 'medium', label: 'Medium Quality' },
    { value: 'low', label: 'Low Quality (Smaller Size)' }
  ];

  const templateOptions = [
    { value: 'standard', label: 'Standard Template' },
    { value: 'professional', label: 'Professional Template' },
    { value: 'minimal', label: 'Minimal Template' }
  ];

  const encodingOptions = [
    { value: 'UTF-8', label: 'UTF-8' },
    { value: 'ASCII', label: 'ASCII' },
    { value: 'ISO-8859-1', label: 'ISO-8859-1' }
  ];

  const handleCustomizationChange = (key, value) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFormatOptionChange = (format, key, value) => {
    setFormatOptions(prev => ({
      ...prev,
      [format]: {
        ...prev[format],
        [key]: value
      }
    }));
  };

  const renderFormatSpecificOptions = () => {
    const currentOptions = formatOptions[selectedFormat];

    switch (selectedFormat) {
      case 'pdf':
        return (
          <div className="space-y-4">
            <Select
              label="Page Size"
              options={pageSizeOptions}
              value={currentOptions.pageSize}
              onChange={(value) => handleFormatOptionChange('pdf', 'pageSize', value)}
            />
            <Select
              label="Orientation"
              options={orientationOptions}
              value={currentOptions.orientation}
              onChange={(value) => handleFormatOptionChange('pdf', 'orientation', value)}
            />
            <Select
              label="Quality"
              options={qualityOptions}
              value={currentOptions.quality}
              onChange={(value) => handleFormatOptionChange('pdf', 'quality', value)}
            />
          </div>
        );

      case 'excel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sheet Name
              </label>
              <input
                type="text"
                value={currentOptions.sheetName}
                onChange={(e) => handleFormatOptionChange('excel', 'sheetName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Checkbox
              label="Include Formulas"
              checked={currentOptions.includeFormulas}
              onChange={(e) => handleFormatOptionChange('excel', 'includeFormulas', e.target.checked)}
            />
            <Checkbox
              label="Preserve Formatting"
              checked={currentOptions.preserveFormatting}
              onChange={(e) => handleFormatOptionChange('excel', 'preserveFormatting', e.target.checked)}
            />
          </div>
        );

      case 'word':
        return (
          <div className="space-y-4">
            <Select
              label="Document Template"
              options={templateOptions}
              value={currentOptions.template}
              onChange={(value) => handleFormatOptionChange('word', 'template', value)}
            />
            <Checkbox
              label="Include Images"
              checked={currentOptions.includeImages}
              onChange={(e) => handleFormatOptionChange('word', 'includeImages', e.target.checked)}
            />
            <Select
              label="Page Breaks"
              options={[
                { value: 'auto', label: 'Automatic' },
                { value: 'manual', label: 'Manual Only' },
                { value: 'none', label: 'No Page Breaks' }
              ]}
              value={currentOptions.pageBreaks}
              onChange={(value) => handleFormatOptionChange('word', 'pageBreaks', value)}
            />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <Select
              label="Text Encoding"
              options={encodingOptions}
              value={currentOptions.encoding}
              onChange={(value) => handleFormatOptionChange('text', 'encoding', value)}
            />
            <Select
              label="Line Endings"
              options={[
                { value: 'auto', label: 'Auto Detect' },
                { value: 'windows', label: 'Windows (CRLF)' },
                { value: 'unix', label: 'Unix (LF)' }
              ]}
              value={currentOptions.lineEndings}
              onChange={(value) => handleFormatOptionChange('text', 'lineEndings', value)}
            />
            <Checkbox
              label="Include Basic Formatting"
              checked={currentOptions.includeFormatting}
              onChange={(e) => handleFormatOptionChange('text', 'includeFormatting', e.target.checked)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">Export Configuration</h2>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            Configuring export for: {selectedFile.fileName}
          </p>
        )}
      </div>

      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        {/* Format Selection */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Export Format</h3>
          <div className="grid grid-cols-2 gap-3">
            {exportFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`
                  p-3 border rounded-lg text-left transition-smooth
                  ${selectedFormat === format.value
                    ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <Icon name={format.icon} size={16} />
                  <span className="text-sm font-medium">{format.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format-Specific Options */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Format Options</h3>
          {renderFormatSpecificOptions()}
        </div>

        {/* Security & Privacy Options */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Security & Privacy</h3>
          <div className="space-y-3">
            <Checkbox
              label="Add Watermark"
              description="Add a subtle watermark to the document"
              checked={customizations.includeWatermark}
              onChange={(e) => handleCustomizationChange('includeWatermark', e.target.checked)}
            />
            <Checkbox
              label="Password Protection"
              description="Protect the file with a password"
              checked={customizations.passwordProtect}
              onChange={(e) => handleCustomizationChange('passwordProtect', e.target.checked)}
            />
            <Checkbox
              label="Remove Metadata"
              description="Strip all metadata for privacy"
              checked={customizations.removeMetadata}
              onChange={(e) => handleCustomizationChange('removeMetadata', e.target.checked)}
            />
            <Checkbox
              label="Compress File"
              description="Reduce file size when possible"
              checked={customizations.compressFile}
              onChange={(e) => handleCustomizationChange('compressFile', e.target.checked)}
            />
          </div>
        </div>

        {/* File Size Estimate */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Size:</span>
            <span className="font-medium text-foreground">2.1 MB</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Processing Time:</span>
            <span className="font-medium text-foreground">~15 seconds</span>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border">
        <div className="space-y-3">
          <Button
            variant="default"
            fullWidth
            iconName="Download"
            iconPosition="left"
            disabled={!selectedFile}
          >
            Export Now
          </Button>
          <Button
            variant="outline"
            fullWidth
            iconName="Eye"
            iconPosition="left"
            disabled={!selectedFile}
          >
            Preview Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;