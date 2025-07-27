import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import SecurityBadge from '../../../components/ui/SecurityBadge';

const UploadSidebar = ({ uploadProgress, processingStats, onSettingsChange }) => {
  const [settings, setSettings] = useState({
    autoTemplateMatch: true,
    batchProcessing: true,
    privacyMode: true,
    autoRedirect: false
  });

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const mockProgress = [
    { fileName: 'invoice_2024.pdf', progress: 100, status: 'completed', size: '2.4 MB' },
    { fileName: 'data_analysis.xlsx', progress: 75, status: 'processing', size: '1.8 MB' },
    { fileName: 'report_draft.docx', progress: 45, status: 'processing', size: '956 KB' },
    { fileName: 'chart_image.png', progress: 0, status: 'queued', size: '445 KB' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'processing':
        return { icon: 'Loader', color: 'text-primary' };
      case 'queued':
        return { icon: 'Clock', color: 'text-muted-foreground' };
      case 'error':
        return { icon: 'AlertCircle', color: 'text-destructive' };
      default:
        return { icon: 'File', color: 'text-muted-foreground' };
    }
  };

  const getEstimatedTime = (status, progress) => {
    if (status === 'completed') return 'Completed';
    if (status === 'queued') return 'In queue';
    if (status === 'processing') {
      const remaining = Math.ceil((100 - progress) / 10);
      return `${remaining}s remaining`;
    }
    return 'Processing...';
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Security Status</h3>
          <SecurityBadge variant="secure" showDetails />
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={12} className="text-success" />
            <span>Local processing only</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Lock" size={12} className="text-success" />
            <span>End-to-end encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Database" size={12} className="text-success" />
            <span>No server storage</span>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Upload Progress</h3>
          <div className="text-xs text-muted-foreground">
            {mockProgress.filter(f => f.status === 'completed').length} of {mockProgress.length} complete
          </div>
        </div>

        <div className="space-y-3">
          {mockProgress.map((file, index) => {
            const statusIcon = getStatusIcon(file.status);
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Icon 
                      name={statusIcon.icon} 
                      size={14} 
                      className={`${statusIcon.color} ${file.status === 'processing' ? 'animate-spin' : ''} flex-shrink-0`} 
                    />
                    <span className="text-xs font-medium text-foreground truncate">
                      {file.fileName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{file.size}</span>
                </div>
                
                {file.status !== 'queued' && (
                  <div className="space-y-1">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          file.status === 'completed' ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getEstimatedTime(file.status, file.progress)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Processing Statistics */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-3">Processing Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-primary">24</div>
            <div className="text-xs text-muted-foreground">Files Today</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-success">156</div>
            <div className="text-xs text-muted-foreground">Total Processed</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-warning">2.4s</div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-accent">98%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-4">Upload Settings</h3>
        <div className="space-y-4">
          <Checkbox
            label="Auto Template Matching"
            description="Automatically suggest templates based on file content"
            checked={settings.autoTemplateMatch}
            onChange={(e) => handleSettingChange('autoTemplateMatch', e.target.checked)}
          />
          
          <Checkbox
            label="Batch Processing"
            description="Process multiple files simultaneously"
            checked={settings.batchProcessing}
            onChange={(e) => handleSettingChange('batchProcessing', e.target.checked)}
          />
          
          <Checkbox
            label="Enhanced Privacy Mode"
            description="Additional encryption for sensitive documents"
            checked={settings.privacyMode}
            onChange={(e) => handleSettingChange('privacyMode', e.target.checked)}
          />
          
          <Checkbox
            label="Auto-redirect after upload"
            description="Automatically go to processing screen"
            checked={settings.autoRedirect}
            onChange={(e) => handleSettingChange('autoRedirect', e.target.checked)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          fullWidth
          iconName="FileTemplate"
          iconPosition="left"
        >
          Browse Templates
        </Button>
        <Button
          variant="outline"
          fullWidth
          iconName="History"
          iconPosition="left"
        >
          View Upload History
        </Button>
        <Button
          variant="outline"
          fullWidth
          iconName="Settings"
          iconPosition="left"
        >
          Advanced Settings
        </Button>
      </div>
    </div>
  );
};

export default UploadSidebar;