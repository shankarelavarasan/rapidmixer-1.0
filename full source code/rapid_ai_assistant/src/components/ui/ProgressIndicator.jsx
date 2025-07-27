import React from 'react';
import Icon from '../AppIcon';

const ProgressIndicator = ({ 
  currentStep = 1, 
  totalSteps = 4, 
  steps = [],
  showLabels = true,
  size = 'default' 
}) => {
  const defaultSteps = [
    { label: 'Upload', icon: 'Upload', description: 'Select files' },
    { label: 'Process', icon: 'Brain', description: 'AI analysis' },
    { label: 'Review', icon: 'Eye', description: 'Check results' },
    { label: 'Export', icon: 'Download', description: 'Download files' }
  ];

  const progressSteps = steps.length > 0 ? steps : defaultSteps.slice(0, totalSteps);
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const getStepStatus = (stepIndex) => {
    const stepNumber = stepIndex + 1;
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground border-success';
      case 'current':
        return 'bg-primary text-primary-foreground border-primary animate-pulse';
      case 'pending':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    default: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-border">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {progressSteps.map((step, index) => {
            const status = getStepStatus(index);
            const stepClasses = getStepClasses(status);

            return (
              <div key={index} className="flex flex-col items-center">
                <div className={`
                  ${sizeClasses[size]} 
                  ${stepClasses}
                  rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 ease-out
                  relative z-10 bg-card
                `}>
                  {status === 'completed' ? (
                    <Icon name="Check" size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
                  ) : status === 'current' ? (
                    <Icon name={step.icon} size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
                  ) : (
                    <Icon name={step.icon} size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
                  )}
                </div>

                {showLabels && (
                  <div className="mt-3 text-center">
                    <div className={`
                      text-sm font-medium
                      ${status === 'current' ? 'text-primary' : 
                        status === 'completed' ? 'text-success' : 'text-muted-foreground'}
                    `}>
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Text */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;