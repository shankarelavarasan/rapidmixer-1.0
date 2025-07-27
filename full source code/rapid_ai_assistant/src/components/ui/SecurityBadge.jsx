import React, { useState } from 'react';
import Icon from '../AppIcon';

const SecurityBadge = ({ 
  variant = 'secure',
  showDetails = false,
  className = ''
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const securityStates = {
    secure: {
      icon: 'Shield',
      label: 'Secure',
      color: 'success',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      details: {
        title: 'Your data is secure',
        features: [
          'Local processing only',
          'End-to-end encryption',
          'No data stored on servers',
          'GDPR compliant'
        ]
      }
    },
    processing: {
      icon: 'ShieldCheck',
      label: 'Processing',
      color: 'primary',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      details: {
        title: 'Secure processing active',
        features: [
          'AI analysis in progress',
          'Data remains local',
          'Encrypted processing',
          'No external transmission'
        ]
      }
    },
    warning: {
      icon: 'ShieldAlert',
      label: 'Check Settings',
      color: 'warning',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      details: {
        title: 'Security notice',
        features: [
          'Review privacy settings',
          'Update security preferences',
          'Check data retention',
          'Verify encryption status'
        ]
      }
    }
  };

  const currentState = securityStates[variant] || securityStates.secure;

  const handleMouseEnter = () => {
    if (showDetails) {
      setIsTooltipVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium
          ${currentState.bgColor} ${currentState.textColor}
          ${showDetails ? 'cursor-pointer' : ''}
          transition-smooth
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Icon 
          name={currentState.icon} 
          size={14} 
          className={variant === 'processing' ? 'animate-pulse' : ''}
        />
        <span>{currentState.label}</span>
      </div>

      {/* Tooltip */}
      {showDetails && isTooltipVisible && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-modal z-1050 p-4">
          <div className="text-sm font-medium text-popover-foreground mb-2">
            {currentState.details.title}
          </div>
          <ul className="space-y-1">
            {currentState.details.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon name="Check" size={12} className="text-success flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
        </div>
      )}
    </div>
  );
};

export default SecurityBadge;