import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ExportHistory = () => {
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [sortBy, setSortBy] = useState('newest');

  const historyItems = [
    {
      id: 1,
      fileName: "Financial_Report_Q4.pdf",
      originalName: "quarterly_report.xlsx",
      exportedAt: "2025-07-27 07:05:14",
      format: "PDF",
      size: "2.4 MB",
      status: "completed",
      downloadCount: 3,
      expiresAt: "2025-07-27 19:05:14"
    },
    {
      id: 2,
      fileName: "Invoice_Summary_July.xlsx",
      originalName: "invoices_batch.pdf",
      exportedAt: "2025-07-27 07:03:22",
      format: "Excel",
      size: "1.8 MB",
      status: "completed",
      downloadCount: 1,
      expiresAt: "2025-07-27 19:03:22"
    },
    {
      id: 3,
      fileName: "Customer_Data_Analysis.docx",
      originalName: "customer_info.csv",
      exportedAt: "2025-07-27 07:01:45",
      format: "Word",
      size: "3.1 MB",
      status: "completed",
      downloadCount: 2,
      expiresAt: "2025-07-27 19:01:45"
    },
    {
      id: 4,
      fileName: "Marketing_Report.pdf",
      originalName: "marketing_data.xlsx",
      exportedAt: "2025-07-27 06:58:12",
      format: "PDF",
      size: "1.9 MB",
      status: "expired",
      downloadCount: 0,
      expiresAt: "2025-07-27 18:58:12"
    },
    {
      id: 5,
      fileName: "Employee_Records.xlsx",
      originalName: "hr_data.pdf",
      exportedAt: "2025-07-27 06:55:33",
      format: "Excel",
      size: "2.7 MB",
      status: "completed",
      downloadCount: 5,
      expiresAt: "2025-07-27 18:55:33"
    }
  ];

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'File Name' },
    { value: 'size', label: 'File Size' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'expired': return 'text-destructive';
      case 'processing': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'expired': return 'XCircle';
      case 'processing': return 'Clock';
      default: return 'Circle';
    }
  };

  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'pdf': return 'FileText';
      case 'excel': return 'FileSpreadsheet';
      case 'word': return 'FileText';
      default: return 'File';
    }
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

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const handleRedownload = (item) => {
    console.log('Re-downloading:', item.fileName);
  };

  const handleConvertFormat = (item) => {
    console.log('Converting format for:', item.fileName);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Export History</h2>
          <div className="flex items-center space-x-3">
            <Select
              options={periodOptions}
              value={filterPeriod}
              onChange={setFilterPeriod}
              className="w-32"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              className="w-36"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{historyItems.filter(item => item.status === 'completed').length} Available</span>
          <span>{historyItems.filter(item => item.status === 'expired').length} Expired</span>
          <span>{historyItems.reduce((sum, item) => sum + item.downloadCount, 0)} Total Downloads</span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-border rounded-lg hover:shadow-card transition-smooth"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={getFormatIcon(item.format)} size={18} className="text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {item.fileName}
                      </h3>
                      <div className={`flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                        <Icon name={getStatusIcon(item.status)} size={14} />
                        <span className="text-xs capitalize">{item.status}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      From: {item.originalName}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{item.format} • {item.size}</span>
                      <span>Downloaded {item.downloadCount} times</span>
                      <span>{formatDate(item.exportedAt)}</span>
                    </div>

                    {item.status === 'completed' && (
                      <div className="mt-2">
                        <span className="text-xs text-warning">
                          {getTimeRemaining(item.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {item.status === 'completed' ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Download"
                        onClick={() => handleRedownload(item)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="RefreshCw"
                        onClick={() => handleConvertFormat(item)}
                      >
                        Convert
                      </Button>
                    </>
                  ) : item.status === 'expired' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="RotateCcw"
                      onClick={() => handleConvertFormat(item)}
                    >
                      Re-export
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                    >
                      Processing...
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {historyItems.length === 0 && (
          <div className="text-center py-8">
            <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Export History</h3>
            <p className="text-muted-foreground">
              Your exported files will appear here once you start processing documents.
            </p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Shield" size={14} />
            <span>Files expire after 12 hours for security</span>
          </div>
          <Button variant="ghost" size="sm" iconName="Trash2">
            Clear History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportHistory;