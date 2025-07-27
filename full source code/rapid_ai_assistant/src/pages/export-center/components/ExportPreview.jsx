import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ExportPreview = ({ selectedFile, isVisible, onClose }) => {
  const [previewMode, setPreviewMode] = useState('before');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  if (!isVisible || !selectedFile) return null;

  const previewData = {
    before: {
      title: "Original Document",
      content: `Original file: ${selectedFile.originalName}\nFile type: ${selectedFile.fileType.toUpperCase()}\nSize: ${selectedFile.size}\n\nThis is the original document content before AI processing and template application. The document contains raw data that will be transformed according to the selected template and export format.`,
      image: selectedFile.preview
    },
    after: {
      title: "Processed Output",
      content: `Processed file: ${selectedFile.fileName}\nTemplate applied: ${selectedFile.template}\nExport format: PDF\nEstimated size: 2.1 MB\n\nThis is the processed document after AI analysis and template application. The content has been structured, formatted, and optimized according to the selected export configuration.`,
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop"
    }
  };

  const currentPreview = previewData[previewMode];

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1100">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Export Preview</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedFile.fileName}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Preview Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('before')}
                className={`
                  px-3 py-1 text-sm font-medium rounded-md transition-smooth
                  ${previewMode === 'before' 
                    ? 'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                Before
              </button>
              <button
                onClick={() => setPreviewMode('after')}
                className={`
                  px-3 py-1 text-sm font-medium rounded-md transition-smooth
                  ${previewMode === 'after' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                After
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full flex space-x-6">
            {/* Document Preview */}
            <div className="flex-1 bg-muted/30 rounded-lg p-4 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-foreground">
                    {currentPreview.title}
                  </h3>
                  
                  {/* Page Navigation */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ChevronLeft"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange('prev')}
                    />
                    <span className="text-sm text-muted-foreground">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ChevronRight"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange('next')}
                    />
                  </div>
                </div>

                {/* Preview Image */}
                <div className="flex-1 bg-card rounded-lg overflow-hidden shadow-card">
                  <Image
                    src={currentPreview.image}
                    alt={currentPreview.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Preview Details */}
            <div className="w-80 space-y-4">
              {/* Quality Indicators */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Quality Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resolution</span>
                    <div className="flex items-center space-x-1">
                      <Icon name="CheckCircle" size={14} className="text-success" />
                      <span className="text-sm font-medium text-foreground">High</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Formatting</span>
                    <div className="flex items-center space-x-1">
                      <Icon name="CheckCircle" size={14} className="text-success" />
                      <span className="text-sm font-medium text-foreground">Preserved</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Compression</span>
                    <div className="flex items-center space-x-1">
                      <Icon name="CheckCircle" size={14} className="text-success" />
                      <span className="text-sm font-medium text-foreground">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Information */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">File Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Size:</span>
                    <span className="text-foreground">{selectedFile.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Export Size:</span>
                    <span className="text-foreground">2.1 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span className="text-foreground">{totalPages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="text-foreground">PDF</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Security Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Shield" size={14} className="text-success" />
                    <span className="text-sm text-muted-foreground">Metadata Removed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Lock" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Password Protection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Eye" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Watermark</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="default"
                  fullWidth
                  iconName="Download"
                  iconPosition="left"
                >
                  Download Preview
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  iconName="Settings"
                  iconPosition="left"
                >
                  Adjust Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>Processing time: ~15s</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="HardDrive" size={14} />
                <span>Local processing only</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close Preview
              </Button>
              <Button variant="default" iconName="Download" iconPosition="left">
                Export File
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;