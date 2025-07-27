import React from 'react';
import Icon from '../../../components/AppIcon';
import SecurityBadge from '../../../components/ui/SecurityBadge';

const SecurityStatusPanel = () => {
  const securityFeatures = [
    {
      id: 'encryption',
      title: 'End-to-End Encryption',
      description: 'All data encrypted in transit and at rest',
      status: 'active',
      icon: 'Lock'
    },
    {
      id: 'local',
      title: 'Local Processing',
      description: 'AI processing happens on your device',
      status: 'active',
      icon: 'Shield'
    },
    {
      id: 'privacy',
      title: 'Privacy Protection',
      description: 'No data stored on external servers',
      status: 'active',
      icon: 'Eye'
    },
    {
      id: 'compliance',
      title: 'GDPR Compliant',
      description: 'Meets European data protection standards',
      status: 'active',
      icon: 'CheckCircle'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Icon name="CheckCircle" size={16} className="text-success" />;
      case 'warning':
        return <Icon name="AlertTriangle" size={16} className="text-warning" />;
      case 'error':
        return <Icon name="XCircle" size={16} className="text-destructive" />;
      default:
        return <Icon name="Circle" size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} className="text-success" />
          <h3 className="text-lg font-semibold text-foreground">Security Status</h3>
        </div>
        <SecurityBadge variant="secure" showDetails />
      </div>

      <div className="space-y-4">
        {securityFeatures.map((feature) => (
          <div key={feature.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
            <div className="p-1 rounded-full bg-background">
              {getStatusIcon(feature.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Icon name={feature.icon} size={16} className="text-muted-foreground" />
                <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last security scan</span>
          <span className="font-medium text-success">2 minutes ago</span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Icon name="Shield" size={14} className="text-success" />
          <span className="text-xs text-success">All systems secure</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatusPanel;