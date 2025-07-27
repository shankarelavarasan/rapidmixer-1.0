import React from 'react';
import Icon from '../../../components/AppIcon';
import TemplateCard from './TemplateCard';

const FeaturedTemplates = ({ templates, onApply, onCustomize, onPreview }) => {
  const featuredTemplates = templates.filter(template => template.isFeatured).slice(0, 3);

  if (featuredTemplates.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Star" size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Featured Templates</h2>
            <p className="text-sm text-muted-foreground">
              Most popular and highly-rated templates
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="TrendingUp" size={16} />
          <span>Updated daily</span>
        </div>
      </div>

      {/* Featured Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredTemplates.map((template) => (
          <div key={template.id} className="relative">
            {/* Featured Badge Overlay */}
            <div className="absolute -top-2 -right-2 z-10">
              <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full shadow-md flex items-center space-x-1">
                <Icon name="Crown" size={12} />
                <span>Featured</span>
              </div>
            </div>
            
            <TemplateCard
              template={template}
              onApply={onApply}
              onCustomize={onCustomize}
              onPreview={onPreview}
            />
          </div>
        ))}
      </div>

      {/* Featured Stats */}
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {featuredTemplates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Uses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {(featuredTemplates.reduce((sum, t) => sum + t.rating, 0) / featuredTemplates.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(featuredTemplates.reduce((sum, t) => sum + t.successRate, 0) / featuredTemplates.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedTemplates;