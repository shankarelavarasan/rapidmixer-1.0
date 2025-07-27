import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingQueue = ({ 
  activeJobs = [], 
  completedJobs = [], 
  onPauseJob, 
  onRestartJob, 
  onViewResult,
  onDeleteJob 
}) => {
  const [activeTab, setActiveTab] = useState('active');

  const formatTimeRemaining = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'text-primary';
      case 'paused': return 'text-warning';
      case 'completed': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return 'Brain';
      case 'paused': return 'Pause';
      case 'completed': return 'CheckCircle';
      case 'error': return 'AlertCircle';
      default: return 'Clock';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error/10 text-error';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Processing Queue</h2>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeTab === 'active' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeTab === 'completed'
                ? 'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed ({completedJobs.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'active' ? (
          <div className="space-y-3">
            {activeJobs.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Brain" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active processing jobs</p>
              </div>
            ) : (
              activeJobs.map((job) => (
                <div key={job.id} className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {job.fileName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.template}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{job.progress}% complete</span>
                      <span>ETA: {formatTimeRemaining(job.estimatedTime)}</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getStatusIcon(job.status)} 
                        size={14} 
                        className={`${getStatusColor(job.status)} ${job.status === 'processing' ? 'animate-pulse' : ''}`}
                      />
                      <span className={`text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {job.status === 'processing' && (
                        <Button
                          variant="ghost"
                          size="xs"
                          iconName="Pause"
                          onClick={() => onPauseJob(job.id)}
                        >
                          Pause
                        </Button>
                      )}
                      {job.status === 'paused' && (
                        <Button
                          variant="ghost"
                          size="xs"
                          iconName="Play"
                          onClick={() => onRestartJob(job.id)}
                        >
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        iconName="Trash2"
                        onClick={() => onDeleteJob(job.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {completedJobs.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No completed jobs</p>
              </div>
            ) : (
              completedJobs.map((job) => (
                <div key={job.id} className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {job.fileName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed {job.completedAt}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getStatusIcon(job.status)} 
                        size={14} 
                        className={getStatusColor(job.status)}
                      />
                      <span className={`text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Processing time: {job.processingTime}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        iconName="Eye"
                        onClick={() => onViewResult(job.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        iconName="Trash2"
                        onClick={() => onDeleteJob(job.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingQueue;