import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatDistanceToNow } from 'date-fns';

const RecentActivityFeed = ({ activities = [], loading = false, isPreviewMode = false }) => {
  // Mock data for preview mode
  const mockActivities = [
    {
      id: '1',
      action_type: 'project_created',
      action_description: 'Created new project: Marketing Analysis',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      projects: { name: 'Marketing Analysis' }
    },
    {
      id: '2',
      action_type: 'file_uploaded',
      action_description: 'Uploaded file: quarterly_report.pdf',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      projects: { name: 'Financial Review' }
    },
    {
      id: '3',
      action_type: 'ai_processing_completed',
      action_description: 'AI analysis completed successfully',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      projects: { name: 'Data Processing' }
    },
    {
      id: '4',
      action_type: 'export_created',
      action_description: 'Exported report as PDF',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      projects: { name: 'Monthly Summary' }
    }
  ];

  const displayActivities = isPreviewMode ? mockActivities : activities;

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'project_created':
        return 'FolderPlus';
      case 'file_uploaded':
        return 'Upload';
      case 'ai_processing_completed':
        return 'Brain';
      case 'export_created':
        return 'Download';
      default:
        return 'Activity';
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'project_created':
        return 'text-blue-500';
      case 'file_uploaded':
        return 'text-green-500';
      case 'ai_processing_completed':
        return 'text-purple-500';
      case 'export_created':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        {isPreviewMode && (
          <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
            Demo
          </div>
        )}
      </div>
      
      {displayActivities.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Activity" size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No recent activity</p>
          <p className="text-muted-foreground text-xs">Your project activities will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <div key={activity.id || index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-muted ${getActionColor(activity.action_type)}`}>
                <Icon name={getActionIcon(activity.action_type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  {activity.action_description}
                </p>
                {activity.projects?.name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Project: {activity.projects.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {displayActivities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;