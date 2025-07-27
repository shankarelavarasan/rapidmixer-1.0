import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const FileQueue = ({ files, onRemoveFile, onClearAll }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return { icon: 'FileText', color: 'text-red-500' };
      case 'xlsx': case'xls':
        return { icon: 'FileSpreadsheet', color: 'text-green-500' };
      case 'docx': case'doc':
        return { icon: 'FileType', color: 'text-indigo-500' };
      case 'jpg': case'jpeg': case'png': case'gif':
        return { icon: 'Image', color: 'text-blue-500' };
      default:
        return { icon: 'File', color: 'text-muted-foreground' };
    }
  };

  const getFileStatus = (file) => {
    // Mock status based on file type
    const extension = file.name.split('.').pop().toLowerCase();
    if (['pdf', 'xlsx', 'xls', 'docx'].includes(extension)) {
      return { status: 'ready', label: 'Ready for AI processing', color: 'text-success' };
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return { status: 'ready', label: 'Image recognized', color: 'text-success' };
    } else {
      return { status: 'warning', label: 'Format may need conversion', color: 'text-warning' };
    }
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-foreground">File Queue</h3>
          <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          iconName="Trash2"
          iconPosition="left"
        >
          Clear All
        </Button>
      </div>

      {/* Total Size */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Icon name="HardDrive" size={16} />
        <span>Total size: {formatFileSize(getTotalSize())}</span>
      </div>

      {/* File List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.map((file, index) => {
          const fileIcon = getFileIcon(file.name);
          const fileStatus = getFileStatus(file);
          
          return (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg hover:shadow-card transition-smooth"
            >
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {file.type.startsWith('image/') ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Icon name={fileIcon.icon} size={20} className={fileIcon.color} />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </h4>
                  <div className={`flex items-center space-x-1 ${fileStatus.color}`}>
                    <Icon 
                      name={fileStatus.status === 'ready' ? 'CheckCircle' : 'AlertTriangle'} 
                      size={14} 
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className={fileStatus.color}>{fileStatus.label}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(index)}
                  iconName="X"
                  className="text-muted-foreground hover:text-destructive"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Button
          variant="default"
          iconName="Brain"
          iconPosition="left"
          className="flex-1"
          disabled={files.length === 0}
        >
          Process with AI ({files.length} files)
        </Button>
        <Button
          variant="outline"
          iconName="FileTemplate"
          iconPosition="left"
          className="flex-1"
        >
          Apply Template
        </Button>
      </div>
    </div>
  );
};

export default FileQueue;