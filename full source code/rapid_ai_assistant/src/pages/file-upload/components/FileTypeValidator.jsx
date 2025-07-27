import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const FileTypeValidator = ({ files, onValidationComplete }) => {
  const supportedTypes = {
    'application/pdf': { icon: 'FileText', label: 'PDF Document', color: 'text-red-500' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'FileSpreadsheet', label: 'Excel Spreadsheet', color: 'text-green-500' },
    'application/vnd.ms-excel': { icon: 'FileSpreadsheet', label: 'Excel Spreadsheet', color: 'text-green-500' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'FileType', label: 'Word Document', color: 'text-indigo-500' },
    'image/jpeg': { icon: 'Image', label: 'JPEG Image', color: 'text-blue-500' },
    'image/png': { icon: 'Image', label: 'PNG Image', color: 'text-blue-500' },
    'image/gif': { icon: 'Image', label: 'GIF Image', color: 'text-blue-500' },
    'text/plain': { icon: 'FileText', label: 'Text File', color: 'text-gray-500' }
  };

  const validateFiles = (fileList) => {
    return fileList.map(file => {
      const isSupported = supportedTypes[file.type];
      const sizeValid = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      return {
        ...file,
        isValid: isSupported && sizeValid,
        typeInfo: isSupported || { icon: 'AlertTriangle', label: 'Unsupported Format', color: 'text-destructive' },
        sizeValid,
        validationMessage: !isSupported 
          ? 'File type not supported' 
          : !sizeValid 
          ? 'File size exceeds 50MB limit' :'Ready for processing'
      };
    });
  };

  const validatedFiles = validateFiles(files);
  const validFiles = validatedFiles.filter(f => f.isValid);
  const invalidFiles = validatedFiles.filter(f => !f.isValid);

  React.useEffect(() => {
    onValidationComplete?.(validatedFiles);
  }, [files, onValidationComplete]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Validation Summary */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            invalidFiles.length === 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            <Icon 
              name={invalidFiles.length === 0 ? 'CheckCircle' : 'AlertTriangle'} 
              size={16} 
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">File Validation</h3>
            <p className="text-xs text-muted-foreground">
              {validFiles.length} valid, {invalidFiles.length} invalid files
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            {validFiles.length}/{files.length}
          </div>
          <div className="text-xs text-muted-foreground">Files ready</div>
        </div>
      </div>

      {/* Invalid Files Warning */}
      {invalidFiles.length > 0 && (
        <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-warning">Files Need Attention</h4>
              <div className="space-y-1">
                {invalidFiles.map((file, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    <span className="font-medium">{file.name}</span> - {file.validationMessage}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                These files will be skipped during processing. Please check file formats and sizes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supported Formats Guide */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-3">Supported File Types</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(supportedTypes).map(([mimeType, info]) => (
            <div key={mimeType} className="flex items-center space-x-2">
              <Icon name={info.icon} size={14} className={info.color} />
              <span className="text-xs text-muted-foreground">{info.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Info" size={12} />
            <span>Maximum file size: 50MB per file</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileTypeValidator;