import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ 
  selectedCategories, 
  onCategoryChange, 
  selectedFileTypes, 
  onFileTypeChange,
  showCustomOnly,
  onCustomToggle,
  onClearFilters 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    fileTypes: true,
    options: true
  });

  const categories = [
    { id: 'invoice', label: 'Invoice Processing', count: 12 },
    { id: 'data-extraction', label: 'Data Extraction', count: 8 },
    { id: 'content-generation', label: 'Content Generation', count: 15 },
    { id: 'document-analysis', label: 'Document Analysis', count: 6 },
    { id: 'report-generation', label: 'Report Generation', count: 9 },
    { id: 'form-processing', label: 'Form Processing', count: 4 }
  ];

  const fileTypes = [
    { id: 'pdf', label: 'PDF', icon: 'FileText', count: 24 },
    { id: 'excel', label: 'Excel', icon: 'FileSpreadsheet', count: 18 },
    { id: 'word', label: 'Word', icon: 'FileText', count: 12 },
    { id: 'image', label: 'Images', icon: 'Image', count: 16 },
    { id: 'csv', label: 'CSV', icon: 'FileSpreadsheet', count: 8 }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId, checked) => {
    if (checked) {
      onCategoryChange([...selectedCategories, categoryId]);
    } else {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    }
  };

  const handleFileTypeChange = (fileTypeId, checked) => {
    if (checked) {
      onFileTypeChange([...selectedFileTypes, fileTypeId]);
    } else {
      onFileTypeChange(selectedFileTypes.filter(id => id !== fileTypeId));
    }
  };

  const activeFiltersCount = selectedCategories.length + selectedFileTypes.length + (showCustomOnly ? 1 : 0);

  return (
    <div className="w-full bg-card border border-border rounded-lg p-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="text-sm font-medium text-foreground">Categories</span>
          <Icon 
            name={expandedSections.categories ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground"
          />
        </button>
        
        {expandedSections.categories && (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <Checkbox
                  label={category.label}
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                  size="sm"
                />
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Types Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('fileTypes')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="text-sm font-medium text-foreground">File Types</span>
          <Icon 
            name={expandedSections.fileTypes ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground"
          />
        </button>
        
        {expandedSections.fileTypes && (
          <div className="space-y-3">
            {fileTypes.map((fileType) => (
              <div key={fileType.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedFileTypes.includes(fileType.id)}
                    onChange={(e) => handleFileTypeChange(fileType.id, e.target.checked)}
                    size="sm"
                  />
                  <Icon name={fileType.icon} size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{fileType.label}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {fileType.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('options')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="text-sm font-medium text-foreground">Options</span>
          <Icon 
            name={expandedSections.options ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground"
          />
        </button>
        
        {expandedSections.options && (
          <div className="space-y-3">
            <Checkbox
              label="Custom Templates Only"
              description="Show only user-created templates"
              checked={showCustomOnly}
              onChange={(e) => onCustomToggle(e.target.checked)}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          iconName="Plus"
          iconPosition="left"
          className="mb-3"
        >
          Create Template
        </Button>
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          iconName="Upload"
          iconPosition="left"
        >
          Import Template
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;