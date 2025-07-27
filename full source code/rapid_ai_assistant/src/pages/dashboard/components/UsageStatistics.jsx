import React from 'react';
import Icon from '../../../components/AppIcon';

const UsageStatistics = ({ userProfile, fileStats, isPreviewMode = false }) => {
  // Mock data for preview mode
  const mockData = {
    storageUsed: 2.3,
    storageLimit: 5.0,
    apiCallsUsed: 247,
    apiCallsLimit: 1000,
    filesProcessed: 18,
    totalProjects: 12
  };

  const storageUsed = fileStats?.totalSizeMB ? (fileStats.totalSizeMB / 1024).toFixed(2) : (isPreviewMode ? mockData.storageUsed : 0);
  const storageLimit = userProfile?.usage_quota_gb || (isPreviewMode ? mockData.storageLimit : 5);
  const apiCallsUsed = userProfile?.api_calls_this_month || (isPreviewMode ? mockData.apiCallsUsed : 0);
  const apiCallsLimit = userProfile?.api_calls_limit || (isPreviewMode ? mockData.apiCallsLimit : 1000);
  const filesProcessed = fileStats?.completed || (isPreviewMode ? mockData.filesProcessed : 0);

  const storagePercentage = (storageUsed / storageLimit) * 100;
  const apiCallsPercentage = (apiCallsUsed / apiCallsLimit) * 100;

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatBytes = (gb) => {
    if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Usage Statistics</h3>
        {isPreviewMode && (
          <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
            Demo
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Storage Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Icon name="HardDrive" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Storage</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(storagePercentage)}`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {storagePercentage.toFixed(1)}% used
          </p>
        </div>

        {/* API Calls */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Icon name="Zap" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">API Calls</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {apiCallsUsed.toLocaleString()} / {apiCallsLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(apiCallsPercentage)}`}
              style={{ width: `${Math.min(apiCallsPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {apiCallsPercentage.toFixed(1)}% used this month
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
              <Icon name="FileCheck" size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{filesProcessed}</p>
            <p className="text-xs text-muted-foreground">Files Processed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-full mx-auto mb-2">
              <Icon name="TrendingUp" size={16} className="text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isPreviewMode ? '98.5' : '100'}%
            </p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* Upgrade CTA for non-premium users */}
        {(userProfile?.role === 'standard' || isPreviewMode) && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Crown" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Upgrade to Premium</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get 50GB storage, unlimited API calls, and priority processing
            </p>
            <button className="w-full bg-primary text-primary-foreground text-sm py-2 rounded-md hover:bg-primary/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageStatistics;