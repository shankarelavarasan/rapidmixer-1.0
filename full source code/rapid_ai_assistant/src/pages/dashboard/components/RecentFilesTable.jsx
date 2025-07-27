import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

const RecentFilesTable = ({ projects = [], loading = false, isPreviewMode = false }) => {
  const navigate = useNavigate();

  // Mock data for preview mode
  const mockProjects = [
    {
      id: '1',
      name: 'Marketing Campaign Analysis',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      project_files: [
        { file_name: 'campaign_data.xlsx', file_size_mb: '2.5', status: 'completed' },
        { file_name: 'analytics_report.pdf', file_size_mb: '1.8', status: 'completed' }
      ]
    },
    {
      id: '2',
      name: 'Financial Report Processing',
      status: 'processing',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      project_files: [
        { file_name: 'q4_financials.pdf', file_size_mb: '5.2', status: 'processing' }
      ]
    },
    {
      id: '3',
      name: 'Customer Feedback Analysis',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      project_files: [
        { file_name: 'feedback_data.csv', file_size_mb: '0.8', status: 'completed' },
        { file_name: 'sentiment_analysis.json', file_size_mb: '0.3', status: 'completed' }
      ]
    }
  ];

  const displayProjects = isPreviewMode ? mockProjects : projects;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'processing':
        return 'Loader';
      case 'failed':
        return 'AlertCircle';
      case 'draft':
        return 'Edit';
      default:
        return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'processing':
        return 'text-blue-500';
      case 'failed':
        return 'text-red-500';
      case 'draft':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getFileTypeIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'FileText';
      case 'xlsx': case'xls':
        return 'Sheet';
      case 'csv':
        return 'Database';
      case 'json':
        return 'Code';
      case 'docx': case'doc':
        return 'FileText';
      default:
        return 'File';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Projects</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div>
                  <div className="h-4 bg-muted rounded w-48 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
              </div>
              <div className="w-20 h-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
        {isPreviewMode && (
          <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
            Demo Data
          </div>
        )}
      </div>

      {displayProjects.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="FolderOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No projects yet</h4>
          <p className="text-muted-foreground text-sm mb-6">
            Create your first project to get started with AI-powered processing
          </p>
          <Button 
            variant="default" 
            onClick={() => navigate('/file-upload')}
            iconName="Plus"
            iconPosition="left"
          >
            Create Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayProjects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/ai-processing?project=${project.id}`)}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${getStatusColor(project.status)} bg-current/10`}>
                  <Icon 
                    name={getStatusIcon(project.status)} 
                    size={20} 
                    className={`${getStatusColor(project.status)} ${project.status === 'processing' ? 'animate-spin' : ''}`} 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-foreground truncate">{project.name}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                    </span>
                    {project.project_files && project.project_files.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Paperclip" size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {project.project_files.length} file{project.project_files.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {project.project_files && project.project_files.length > 0 && (
                  <div className="hidden sm:flex items-center space-x-2">
                    {project.project_files.slice(0, 3).map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-xs"
                        title={`${file.file_name} (${file.file_size_mb}MB)`}
                      >
                        <Icon name={getFileTypeIcon(file.file_name)} size={12} />
                        <span className="max-w-20 truncate">{file.file_name}</span>
                      </div>
                    ))}
                    {project.project_files.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{project.project_files.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ExternalLink"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ai-processing?project=${project.id}`);
                  }}
                />
              </div>
            </div>
          ))}

          {displayProjects.length > 5 && (
            <div className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/ai-processing')}
              >
                View all {displayProjects.length} projects
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentFilesTable;