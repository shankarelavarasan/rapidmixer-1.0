import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FilterSidebar from './components/FilterSidebar';
import SearchBar from './components/SearchBar';
import TemplateCard from './components/TemplateCard';
import FeaturedTemplates from './components/FeaturedTemplates';
import TemplateUpload from './components/TemplateUpload';
import TemplatePreview from './components/TemplatePreview';

const TemplateLibrary = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Mock templates data
  const mockTemplates = [
    {
      id: 1,
      name: "Invoice Data Extractor",
      description: "Automatically extract key information from invoices including vendor details, amounts, dates, and line items with high accuracy.",
      category: "invoice",
      categoryLabel: "Invoice Processing",
      previewImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
      supportedFileTypes: ["PDF", "Image", "Excel"],
      usageCount: 2847,
      rating: 4.8,
      reviewCount: 156,
      processingTime: "2-3 min",
      successRate: 94,
      author: "AI Templates Team",
      lastUpdated: "2 days ago",
      version: "2.1",
      isFeatured: true,
      isCustom: false,
      features: [
        "Multi-language invoice support",
        "Automatic vendor recognition",
        "Line item extraction",
        "Tax calculation verification"
      ]
    },
    {
      id: 2,
      name: "PDF Content Analyzer",
      description: "Comprehensive analysis of PDF documents with content summarization, key topic extraction, and structured data output.",
      category: "document-analysis",
      categoryLabel: "Document Analysis",
      previewImage: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop",
      supportedFileTypes: ["PDF"],
      usageCount: 1923,
      rating: 4.6,
      reviewCount: 89,
      processingTime: "1-2 min",
      successRate: 91,
      author: "DocAI Solutions",
      lastUpdated: "1 week ago",
      version: "1.8",
      isFeatured: true,
      isCustom: false,
      features: [
        "Content summarization",
        "Key topic extraction",
        "Sentiment analysis",
        "Entity recognition"
      ]
    },
    {
      id: 3,
      name: "Excel Data Processor",
      description: "Process and analyze Excel spreadsheets with automated data cleaning, validation, and report generation capabilities.",
      category: "data-extraction",
      categoryLabel: "Data Extraction",
      previewImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      supportedFileTypes: ["Excel", "CSV"],
      usageCount: 3156,
      rating: 4.9,
      reviewCount: 203,
      processingTime: "30 sec",
      successRate: 97,
      author: "DataFlow Inc",
      lastUpdated: "3 days ago",
      version: "3.2",
      isFeatured: true,
      isCustom: false,
      features: [
        "Data validation",
        "Automated cleaning",
        "Statistical analysis",
        "Chart generation"
      ]
    },
    {
      id: 4,
      name: "Form Data Extractor",
      description: "Extract structured data from various form types including applications, surveys, and registration forms.",
      category: "form-processing",
      categoryLabel: "Form Processing",
      previewImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
      supportedFileTypes: ["PDF", "Image", "Word"],
      usageCount: 1456,
      rating: 4.5,
      reviewCount: 67,
      processingTime: "1-2 min",
      successRate: 89,
      author: "FormAI Labs",
      lastUpdated: "5 days ago",
      version: "1.5",
      isFeatured: false,
      isCustom: false,
      features: [
        "Multi-format form support",
        "Field validation",
        "Data normalization",
        "Export flexibility"
      ]
    },
    {
      id: 5,
      name: "Report Generator Pro",
      description: "Generate comprehensive reports from raw data with customizable templates and professional formatting.",
      category: "report-generation",
      categoryLabel: "Report Generation",
      previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      supportedFileTypes: ["Excel", "CSV", "JSON"],
      usageCount: 987,
      rating: 4.7,
      reviewCount: 45,
      processingTime: "3-5 min",
      successRate: 93,
      author: "ReportMaster",
      lastUpdated: "1 week ago",
      version: "2.0",
      isFeatured: false,
      isCustom: false,
      features: [
        "Custom templates",
        "Interactive charts",
        "Multi-format export",
        "Automated insights"
      ]
    },
    {
      id: 6,
      name: "Custom Invoice Template",
      description: "My personalized invoice processing template with specific field mappings for our company format.",
      category: "invoice",
      categoryLabel: "Invoice Processing",
      previewImage: "https://images.unsplash.com/photo-1554224154-26032fced8bd?w=400&h=300&fit=crop",
      supportedFileTypes: ["PDF", "Excel"],
      usageCount: 234,
      rating: 4.3,
      reviewCount: 12,
      processingTime: "2 min",
      successRate: 88,
      author: "You",
      lastUpdated: "2 weeks ago",
      version: "1.0",
      isFeatured: false,
      isCustom: true,
      features: [
        "Company-specific fields",
        "Custom validation rules",
        "Branded output format",
        "Integration ready"
      ]
    }
  ];

  const [filteredTemplates, setFilteredTemplates] = useState(mockTemplates);

  // Filter and search logic
  useEffect(() => {
    let filtered = mockTemplates;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(template =>
        selectedCategories.includes(template.category)
      );
    }

    // Apply file type filter
    if (selectedFileTypes.length > 0) {
      filtered = filtered.filter(template =>
        template.supportedFileTypes.some(fileType =>
          selectedFileTypes.includes(fileType.toLowerCase())
        )
      );
    }

    // Apply custom template filter
    if (showCustomOnly) {
      filtered = filtered.filter(template => template.isCustom);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategories, selectedFileTypes, showCustomOnly, sortBy]);

  const handleSearchSubmit = () => {
    // Search is handled by useEffect
  };

  const handleApplyTemplate = (template) => {
    // Navigate to AI processing with template
    navigate('/ai-processing', { state: { selectedTemplate: template } });
  };

  const handleCustomizeTemplate = (template) => {
    // Navigate to AI processing with customization mode
    navigate('/ai-processing', { state: { selectedTemplate: template, customizeMode: true } });
  };

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
  };

  const handleUploadTemplate = (templateData) => {
    console.log('New template uploaded:', templateData);
    // In a real app, this would save to backend
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedFileTypes([]);
    setShowCustomOnly(false);
    setSearchQuery('');
  };

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'recent', label: 'Recently Updated' },
    { value: 'name', label: 'Name (A-Z)' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Template Library</h1>
              <p className="text-muted-foreground">
                Browse and apply AI processing templates for your documents
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Create Template
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                iconName="Filter"
                className="lg:hidden"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          {/* Featured Templates */}
          <FeaturedTemplates
            templates={mockTemplates}
            onApply={handleApplyTemplate}
            onCustomize={handleCustomizeTemplate}
            onPreview={handlePreviewTemplate}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className={`lg:w-1/4 ${isFilterSidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <FilterSidebar
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                selectedFileTypes={selectedFileTypes}
                onFileTypeChange={setSelectedFileTypes}
                showCustomOnly={showCustomOnly}
                onCustomToggle={setShowCustomOnly}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {filteredTemplates.length} templates found
                  </span>
                  {(selectedCategories.length > 0 || selectedFileTypes.length > 0 || showCustomOnly) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      iconName="X"
                      iconPosition="left"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center border border-border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-smooth ${
                        viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon name="Grid3X3" size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-smooth ${
                        viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon name="List" size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Templates Grid */}
              {filteredTemplates.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' ?'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' :'grid-cols-1'
                }`}>
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onApply={handleApplyTemplate}
                      onCustomize={handleCustomizeTemplate}
                      onPreview={handlePreviewTemplate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Template Upload Modal */}
      <TemplateUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadTemplate}
      />

      {/* Template Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onApply={handleApplyTemplate}
        onCustomize={handleCustomizeTemplate}
      />
    </div>
  );
};

export default TemplateLibrary;