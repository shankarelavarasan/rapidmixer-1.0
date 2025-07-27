import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const TemplateCard = ({ template, onApply, onCustomize, onPreview }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatUsageCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'invoice': 'bg-blue-100 text-blue-700',
      'data-extraction': 'bg-green-100 text-green-700',
      'content-generation': 'bg-purple-100 text-purple-700',
      'document-analysis': 'bg-orange-100 text-orange-700',
      'report-generation': 'bg-indigo-100 text-indigo-700',
      'form-processing': 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="Star" size={12} className="text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="Star" size={12} className="text-yellow-400 fill-current opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="Star" size={12} className="text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-hover transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Template Preview Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <Image
          src={template.previewImage}
          alt={`${template.name} preview`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPreview(template)}
              iconName="Eye"
              iconPosition="left"
            >
              Preview
            </Button>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
            {template.categoryLabel}
          </span>
        </div>

        {/* Custom Template Badge */}
        {template.isCustom && (
          <div className="absolute top-3 right-3">
            <div className="bg-accent text-accent-foreground px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
              <Icon name="User" size={10} />
              <span>Custom</span>
            </div>
          </div>
        )}

        {/* Featured Badge */}
        {template.isFeatured && (
          <div className="absolute top-3 right-3">
            <div className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
              <Icon name="Star" size={10} />
              <span>Featured</span>
            </div>
          </div>
        )}
      </div>

      {/* Template Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {template.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Supported File Types */}
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="FileType" size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Supported Files</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {template.supportedFileTypes.map((fileType, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded border"
              >
                {fileType}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={12} />
              <span>{formatUsageCount(template.usageCount)} uses</span>
            </div>
            <div className="flex items-center space-x-1">
              {getRatingStars(template.rating)}
              <span className="ml-1">({template.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={12} />
            <span>{template.processingTime}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            fullWidth
            onClick={() => onApply(template)}
            iconName="Play"
            iconPosition="left"
          >
            Apply Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCustomize(template)}
            iconName="Settings"
          />
        </div>

        {/* Additional Details on Hover */}
        {isHovered && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Created by:</span>
                <span className="font-medium">{template.author}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last updated:</span>
                <span>{template.lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Success rate:</span>
                <span className="text-success font-medium">{template.successRate}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;