import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'upload',
      title: 'Upload Files',
      description: 'Upload documents for AI processing',
      icon: 'Upload',
      variant: 'default',
      path: '/file-upload'
    },
    {
      id: 'template',
      title: 'New Template',
      description: 'Create custom processing template',
      icon: 'FileTemplate',
      variant: 'outline',
      path: '/template-library'
    },
    {
      id: 'ai-process',
      title: 'AI Processing',
      description: 'Start intelligent document analysis',
      icon: 'Brain',
      variant: 'secondary',
      path: '/ai-processing'
    }
  ];

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Zap" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      </div>
      
      <div className="space-y-3">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant}
            fullWidth
            iconName={action.icon}
            iconPosition="left"
            onClick={() => handleActionClick(action.path)}
            className="justify-start h-auto p-4"
          >
            <div className="text-left">
              <div className="font-medium">{action.title}</div>
              <div className="text-xs opacity-80 mt-1">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Processing Credits</span>
          <span className="font-medium text-success">2,847 remaining</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div className="bg-success h-2 rounded-full" style={{ width: '78%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;