import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkflowStatusCard = ({ title, count, icon, status, progress, estimatedTime, variant = 'default' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'processing':
        return 'border-primary/20 bg-primary/5';
      case 'completed':
        return 'border-success/20 bg-success/5';
      case 'pending':
        return 'border-warning/20 bg-warning/5';
      default:
        return 'border-border bg-card';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'processing':
        return 'text-primary';
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getProgressColor = () => {
    switch (variant) {
      case 'processing':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div className={`border rounded-lg p-6 shadow-card transition-smooth hover:shadow-hover ${getVariantClasses()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-background/50 ${getIconColor()}`}>
            <Icon 
              name={icon} 
              size={24} 
              className={variant === 'processing' ? 'animate-pulse' : ''} 
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{count}</div>
          {estimatedTime && (
            <div className="text-xs text-muted-foreground">{estimatedTime}</div>
          )}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" iconName="Eye" iconPosition="left">
          View Details
        </Button>
        {variant === 'processing' && (
          <Button variant="outline" size="sm" iconName="Pause" iconPosition="left">
            Pause
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkflowStatusCard;