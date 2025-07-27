import React from 'react';
import Icon from '../../../components/AppIcon';

const CompanyLogo = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
          <Icon name="Zap" size={24} color="white" />
        </div>
      </div>
      
      {/* Company Name */}
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Rapid AI Assistant
      </h1>
      
      {/* Tagline */}
      <p className="text-sm text-muted-foreground mb-6">
        Secure AI-powered document processing platform
      </p>
      
      {/* Welcome Message */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to access your secure document processing workspace
        </p>
      </div>
    </div>
  );
};

export default CompanyLogo;