import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'End-to-End Encryption',
      description: 'Your data is encrypted at all times'
    },
    {
      icon: 'Lock',
      title: 'Local Processing',
      description: 'Documents processed on your device only'
    },
    {
      icon: 'Eye',
      title: 'Privacy First',
      description: 'No data stored on external servers'
    },
    {
      icon: 'Award',
      title: 'GDPR Compliant',
      description: 'Meets all data protection standards'
    }
  ];

  const certifications = [
    {
      name: 'SOC 2 Type II',
      icon: 'CheckCircle',
      color: 'text-success'
    },
    {
      name: 'ISO 27001',
      icon: 'Shield',
      color: 'text-primary'
    },
    {
      name: 'GDPR Ready',
      icon: 'Lock',
      color: 'text-accent'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Security Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {securityFeatures.map((feature, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-card/50 border border-border/50 rounded-lg"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={feature.icon} size={16} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                {feature.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="text-center">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Trusted & Certified
        </h3>
        <div className="flex items-center justify-center space-x-6">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Icon name={cert.icon} size={16} className={cert.color} />
              <span className="text-xs text-muted-foreground">
                {cert.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-success/5 border border-success/20 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon name="ShieldCheck" size={18} className="text-success" />
          <span className="text-sm font-medium text-success">
            100% Secure Processing
          </span>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Your documents never leave your device. All AI processing happens locally with enterprise-grade security.
        </p>
      </div>
    </div>
  );
};

export default SecurityBadges;