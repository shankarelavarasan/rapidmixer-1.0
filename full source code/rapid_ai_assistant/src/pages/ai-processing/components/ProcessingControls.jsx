import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ProcessingControls = ({ 
  onPauseAll, 
  onResumeAll, 
  onClearCompleted,
  onBatchOperation,
  activeJobsCount = 0,
  completedJobsCount = 0,
  isProcessing = false 
}) => {
  const [batchAction, setBatchAction] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const batchActionOptions = [
    { value: 'pause_all', label: 'Pause All Jobs', description: 'Pause all active processing jobs' },
    { value: 'resume_all', label: 'Resume All Jobs', description: 'Resume all paused jobs' },
    { value: 'restart_failed', label: 'Restart Failed Jobs', description: 'Restart jobs that failed processing' },
    { value: 'clear_completed', label: 'Clear Completed', description: 'Remove all completed jobs from queue' },
    { value: 'export_all', label: 'Export All Results', description: 'Export all completed results' },
    { value: 'delete_all', label: 'Delete All Jobs', description: 'Remove all jobs from queue' }
  ];

  const handleBatchAction = () => {
    if (!batchAction) return;
    
    switch (batchAction) {
      case 'pause_all':
        onPauseAll();
        break;
      case 'resume_all':
        onResumeAll();
        break;
      case 'clear_completed':
        onClearCompleted();
        break;
      default:
        onBatchOperation(batchAction);
    }
    
    setBatchAction('');
  };

  const getSystemStatus = () => {
    if (activeJobsCount === 0) return { status: 'idle', color: 'text-muted-foreground', icon: 'Pause' };
    if (isProcessing) return { status: 'processing', color: 'text-primary', icon: 'Brain' };
    return { status: 'ready', color: 'text-success', icon: 'CheckCircle' };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Processing Controls</h3>
        <Button
          variant="ghost"
          size="sm"
          iconName={showAdvanced ? "ChevronUp" : "ChevronDown"}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Advanced
        </Button>
      </div>

      {/* System Status */}
      <div className="bg-muted/20 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon 
              name={systemStatus.icon} 
              size={20} 
              className={`${systemStatus.color} ${isProcessing ? 'animate-pulse' : ''}`}
            />
            <div>
              <div className="text-sm font-medium text-foreground">
                System Status: {systemStatus.status.charAt(0).toUpperCase() + systemStatus.status.slice(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                {activeJobsCount} active • {completedJobsCount} completed
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs text-success font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          iconName="Pause"
          onClick={onPauseAll}
          disabled={activeJobsCount === 0}
          fullWidth
        >
          Pause All
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Play"
          onClick={onResumeAll}
          disabled={activeJobsCount === 0}
          fullWidth
        >
          Resume All
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Trash2"
          onClick={onClearCompleted}
          disabled={completedJobsCount === 0}
          fullWidth
        >
          Clear Completed
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="RefreshCw"
          disabled={activeJobsCount === 0}
          fullWidth
        >
          Refresh Status
        </Button>
      </div>

      {/* Batch Operations */}
      <div className="space-y-3">
        <Select
          label="Batch Operations"
          description="Perform actions on multiple jobs at once"
          options={batchActionOptions}
          value={batchAction}
          onChange={setBatchAction}
          placeholder="Select batch action..."
        />
        
        <Button
          variant="secondary"
          iconName="Zap"
          onClick={handleBatchAction}
          disabled={!batchAction}
          fullWidth
        >
          Execute Batch Action
        </Button>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <h4 className="text-sm font-medium text-foreground">Advanced Settings</h4>
          
          {/* Processing Priority */}
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Processing Priority</span>
              <Button variant="ghost" size="xs" iconName="Settings">
                Configure
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button className="px-2 py-1 text-xs bg-error/10 text-error rounded border border-error/20">
                High Priority
              </button>
              <button className="px-2 py-1 text-xs bg-warning/10 text-warning rounded border border-warning/20">
                Medium Priority
              </button>
              <button className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded border border-border">
                Low Priority
              </button>
            </div>
          </div>

          {/* Resource Management */}
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Resource Usage</span>
              <span className="text-xs text-success">Optimal</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="text-foreground">45%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className="text-foreground">32%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-success h-1.5 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={16} className="text-success" />
              <div className="flex-1">
                <div className="text-sm font-medium text-success">Secure Processing Active</div>
                <div className="text-xs text-success/80">
                  All processing happens locally • End-to-end encryption enabled
                </div>
              </div>
              <Button variant="ghost" size="xs" iconName="Settings">
                Configure
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Info" size={12} />
          <span>
            {isProcessing 
              ? "AI processing in progress. Results will appear automatically."
              : activeJobsCount > 0 
                ? "Jobs queued and ready for processing."
                : "No active processing jobs. Upload files to get started."
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingControls;