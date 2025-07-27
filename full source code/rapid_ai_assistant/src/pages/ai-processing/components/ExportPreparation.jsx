import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportPreparation = ({ 
  currentResult = null, 
  onExport, 
  onPreview 
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeTimestamp: true,
    includeWatermark: false,
    compressOutput: true
  });
  const [customizations, setCustomizations] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    fontSize: 'medium',
    includeHeader: true,
    includeFooter: true
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', description: 'Portable Document Format with formatting' },
    { value: 'excel', label: 'Excel Spreadsheet', description: 'Microsoft Excel with data tables' },
    { value: 'word', label: 'Word Document', description: 'Microsoft Word with rich formatting' },
    { value: 'text', label: 'Plain Text', description: 'Simple text file without formatting' },
    { value: 'json', label: 'JSON Data', description: 'Structured data in JSON format' },
    { value: 'csv', label: 'CSV File', description: 'Comma-separated values for data' }
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

  const fontSizeOptions = [
    { value: 'small', label: 'Small (10pt)' },
    { value: 'medium', label: 'Medium (12pt)' },
    { value: 'large', label: 'Large (14pt)' }
  ];

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleCustomizationChange = (option, value) => {
    setCustomizations(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf': return 'FileText';
      case 'excel': return 'FileSpreadsheet';
      case 'word': return 'FileText';
      case 'text': return 'FileType';
      case 'json': return 'Code';
      case 'csv': return 'Table';
      default: return 'File';
    }
  };

  const getEstimatedSize = () => {
    if (!currentResult) return '0 KB';
    
    const baseSizes = {
      pdf: 250,
      excel: 150,
      word: 200,
      text: 50,
      json: 75,
      csv: 25
    };
    
    const baseSize = baseSizes[selectedFormat] || 100;
    const compressionFactor = exportOptions.compressOutput ? 0.7 : 1;
    const finalSize = Math.round(baseSize * compressionFactor);
    
    return finalSize > 1024 ? `${(finalSize / 1024).toFixed(1)} MB` : `${finalSize} KB`;
  };

  const handleExport = () => {
    const exportConfig = {
      format: selectedFormat,
      options: exportOptions,
      customizations: customizations,
      resultId: currentResult?.id
    };
    
    onExport(exportConfig);
  };

  const handlePreview = () => {
    const previewConfig = {
      format: selectedFormat,
      options: exportOptions,
      customizations: customizations,
      resultId: currentResult?.id
    };
    
    onPreview(previewConfig);
  };

  if (!currentResult) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <Icon name="Download" size={48} className="text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Results to Export</h3>
        <p className="text-muted-foreground">
          Process a document first to enable export options
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Export Preparation</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="FileText" size={16} />
            <span>{currentResult.fileName}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Format Selection */}
        <div>
          <Select
            label="Export Format"
            description="Choose the output format for your processed results"
            options={formatOptions}
            value={selectedFormat}
            onChange={setSelectedFormat}
            searchable
          />
        </div>

        {/* Export Options */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Export Options</h4>
          <div className="space-y-3">
            <Checkbox
              label="Include metadata and processing information"
              checked={exportOptions.includeMetadata}
              onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
            />
            <Checkbox
              label="Add timestamp to exported file"
              checked={exportOptions.includeTimestamp}
              onChange={(e) => handleOptionChange('includeTimestamp', e.target.checked)}
            />
            <Checkbox
              label="Include security watermark"
              checked={exportOptions.includeWatermark}
              onChange={(e) => handleOptionChange('includeWatermark', e.target.checked)}
            />
            <Checkbox
              label="Compress output file"
              description="Reduce file size while maintaining quality"
              checked={exportOptions.compressOutput}
              onChange={(e) => handleOptionChange('compressOutput', e.target.checked)}
            />
          </div>
        </div>

        {/* Format-specific Customizations */}
        {(selectedFormat === 'pdf' || selectedFormat === 'word') && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Document Settings</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Page Size"
                options={pageSizeOptions}
                value={customizations.pageSize}
                onChange={(value) => handleCustomizationChange('pageSize', value)}
              />
              <Select
                label="Orientation"
                options={orientationOptions}
                value={customizations.orientation}
                onChange={(value) => handleCustomizationChange('orientation', value)}
              />
              <Select
                label="Font Size"
                options={fontSizeOptions}
                value={customizations.fontSize}
                onChange={(value) => handleCustomizationChange('fontSize', value)}
              />
            </div>
            
            <div className="mt-4 space-y-3">
              <Checkbox
                label="Include document header"
                checked={customizations.includeHeader}
                onChange={(e) => handleCustomizationChange('includeHeader', e.target.checked)}
              />
              <Checkbox
                label="Include document footer"
                checked={customizations.includeFooter}
                onChange={(e) => handleCustomizationChange('includeFooter', e.target.checked)}
              />
            </div>
          </div>
        )}

        {/* Export Preview */}
        <div className="bg-muted/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Export Preview</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name={getFormatIcon(selectedFormat)} size={20} className="text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {currentResult.fileName.replace(/\.[^/.]+$/, '')}.{selectedFormat}
                </div>
                <div className="text-xs text-muted-foreground">
                  Estimated size: {getEstimatedSize()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="Shield" size={16} className="text-success mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-success mb-1">Secure Export</div>
              <div className="text-success/80">
                All exports are processed locally. Your data never leaves your device during the export process.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            iconName="Eye"
            onClick={handlePreview}
          >
            Preview Export
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              iconName="Settings"
            >
              Advanced Settings
            </Button>
            <Button
              variant="default"
              iconName="Download"
              onClick={handleExport}
            >
              Export Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPreparation;