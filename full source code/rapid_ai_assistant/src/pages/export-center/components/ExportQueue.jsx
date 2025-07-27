import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ExportQueue = ({ onSelectFile }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const queueItems = [
    {
      id: 1,
      fileName: "Financial_Report_Q4.pdf",
      originalName: "quarterly_report.xlsx",
      template: "Financial Analysis Template",
      processedAt: "2025-07-27 07:05:14",
      fileType: "pdf",
      status: "completed",
      size: "2.4 MB",
      preview: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      fileName: "Invoice_Summary_July.xlsx",
      originalName: "invoices_batch.pdf",
      template: "Invoice Processing Template",
      processedAt: "2025-07-27 07:03:22",
      fileType: "excel",
      status: "completed",
      size: "1.8 MB",
      preview: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      fileName: "Customer_Data_Analysis.docx",
      originalName: "customer_info.csv",
      template: "Data Analysis Template",
      processedAt: "2025-07-27 07:01:45",
      fileType: "word",
      status: "completed",
      size: "3.1 MB",
      preview: "https://images.pixabay.com/photo/2016/04/04/14/12/monitor-1307227_1280.jpg?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      fileName: "Marketing_Report.pdf",
      originalName: "marketing_data.xlsx",
      template: "Marketing Analysis Template",
      processedAt: "2025-07-27 06:58:12",
      fileType: "pdf",
      status: "processing",
      size: "1.9 MB",
      preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      fileName: "Employee_Records.xlsx",
      originalName: "hr_data.pdf",
      template: "HR Processing Template",
      processedAt: "2025-07-27 06:55:33",
      fileType: "excel",
      status: "completed",
      size: "2.7 MB",
      preview: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400&h=300&fit=crop"
    }
  ];

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return 'FileText';
      case 'excel': return 'FileSpreadsheet';
      case 'word': return 'FileText';
      default: return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'processing': return 'text-primary';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const handleFileSelect = (file) => {
    onSelectFile(file);
  };

  const handleBatchSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Export Queue</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              iconPosition="left"
            >
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{queueItems.filter(item => item.status === 'completed').length} Ready</span>
          <span>{queueItems.filter(item => item.status === 'processing').length} Processing</span>
          <span>{selectedFiles.length} Selected</span>
        </div>
      </div>

      <div className="p-6">
        {selectedFiles.length > 0 && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary font-medium">
                {selectedFiles.length} files selected for batch export
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {queueItems.map((item) => (
            <div
              key={item.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-smooth hover:shadow-card
                ${selectedFiles.includes(item.id) ? 'border-primary bg-primary/5' : 'border-border'}
              `}
              onClick={() => handleFileSelect(item)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleBatchSelect(item.id);
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                </div>

                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {item.preview ? (
                    <Image
                      src={item.preview}
                      alt={item.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name={getFileIcon(item.fileType)} size={20} className="text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {item.fileName}
                    </h3>
                    <div className={`flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                      <Icon 
                        name={item.status === 'completed' ? 'CheckCircle' : 'Clock'} 
                        size={14} 
                      />
                      <span className="text-xs capitalize">{item.status}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    From: {item.originalName}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.template}</span>
                    <span>{item.size}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.processedAt)}
                    </span>
                    
                    {item.status === 'completed' && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          iconName="Eye"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileSelect(item);
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          iconName="Download"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="default"
              fullWidth
              iconName="Download"
              iconPosition="left"
            >
              Export Selected ({selectedFiles.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportQueue;