import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const TemplatePreview = ({ template, isOpen, onClose, onApply, onCustomize }) => {
  if (!isOpen || !template) return null;

  const formatUsageCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="Star" size={16} className="text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="Star" size={16} className="text-yellow-400 fill-current opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="Star" size={16} className="text-gray-300" />
      );
    }

    return stars;
  };

  const sampleInputs = [
    {
      type: 'PDF',
      name: 'invoice_sample.pdf',
      description: 'Sample invoice document for processing'
    },
    {
      type: 'Excel',
      name: 'data_template.xlsx',
      description: 'Excel template with expected data structure'
    }
  ];

  const sampleOutputs = [
    {
      format: 'JSON',
      description: 'Structured data extraction with key-value pairs'
    },
    {
      format: 'Excel',
      description: 'Formatted spreadsheet with processed information'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="FileTemplate" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{template.name}</h2>
              <p className="text-sm text-muted-foreground">{template.categoryLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Image */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <Image
                src={template.previewImage}
                alt={`${template.name} preview`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {template.features?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Icon name="Check" size={16} className="text-success" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                )) || [
                  'Automated data extraction',
                  'Multi-format support',
                  'High accuracy processing',
                  'Customizable output'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Icon name="Check" size={16} className="text-success" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Inputs */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Sample Inputs</h3>
              <div className="space-y-2">
                {sampleInputs.map((input, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Icon name="File" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{input.name}</p>
                      <p className="text-xs text-muted-foreground">{input.description}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      {input.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Outputs */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Expected Outputs</h3>
              <div className="space-y-2">
                {sampleOutputs.map((output, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Icon name="Download" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{output.format} Output</p>
                      <p className="text-xs text-muted-foreground">{output.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Template Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usage Count</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatUsageCount(template.usageCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(template.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({template.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium text-success">
                    {template.successRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing Time</span>
                  <span className="text-sm font-medium text-foreground">
                    {template.processingTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Supported File Types */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Supported Files</h4>
              <div className="flex flex-wrap gap-2">
                {template.supportedFileTypes.map((fileType, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-card border border-border text-foreground rounded"
                  >
                    {fileType}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Template Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created by</span>
                  <span className="text-foreground font-medium">{template.author}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="text-foreground">{template.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="text-foreground">v{template.version || '1.0'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="default"
                fullWidth
                onClick={() => onApply(template)}
                iconName="Play"
                iconPosition="left"
              >
                Apply Template
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => onCustomize(template)}
                iconName="Settings"
                iconPosition="left"
              >
                Customize Template
              </Button>
              <Button
                variant="ghost"
                fullWidth
                iconName="Download"
                iconPosition="left"
              >
                Download Sample
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center space-x-2 p-3 bg-success/10 text-success rounded-lg text-sm">
              <Icon name="Shield" size={16} />
              <span>Secure Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;