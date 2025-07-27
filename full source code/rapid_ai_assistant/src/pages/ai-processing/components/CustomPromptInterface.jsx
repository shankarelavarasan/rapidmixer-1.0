import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CustomPromptInterface = ({ 
  onSubmitPrompt, 
  isProcessing = false,
  currentFile = null 
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [promptHistory, setPromptHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const templateSuggestions = [
    { value: 'extract_data', label: 'Extract Key Data', description: 'Extract important information and data points' },
    { value: 'summarize', label: 'Summarize Content', description: 'Create a concise summary of the document' },
    { value: 'analyze_sentiment', label: 'Analyze Sentiment', description: 'Determine the emotional tone and sentiment' },
    { value: 'find_patterns', label: 'Find Patterns', description: 'Identify recurring patterns and trends' },
    { value: 'validate_data', label: 'Validate Data', description: 'Check data accuracy and completeness' },
    { value: 'compare_documents', label: 'Compare Documents', description: 'Compare with other documents' },
    { value: 'custom', label: 'Custom Prompt', description: 'Write your own custom instructions' }
  ];

  const quickPrompts = [
    "Extract all numerical data and create a summary table",
    "Identify the main topics and key points discussed",
    "Find any dates, names, and important references",
    "Analyze the document structure and organization",
    "Extract contact information and addresses",
    "Identify any errors or inconsistencies in the data"
  ];

  const mockHistory = [
    {
      id: 1,
      prompt: "Extract all financial data and calculate totals",
      timestamp: "2 hours ago",
      file: "financial_report.pdf",
      success: true
    },
    {
      id: 2,
      prompt: "Summarize key findings and recommendations",
      timestamp: "1 day ago",
      file: "research_document.pdf",
      success: true
    },
    {
      id: 3,
      prompt: "Identify all customer names and contact details",
      timestamp: "2 days ago",
      file: "customer_list.xlsx",
      success: false
    }
  ];

  const handleTemplateChange = (value) => {
    setSelectedTemplate(value);
    
    const template = templateSuggestions.find(t => t.value === value);
    if (template && template.value !== 'custom') {
      setPromptText(getTemplatePrompt(template.value));
    } else if (template && template.value === 'custom') {
      setPromptText('');
    }
  };

  const getTemplatePrompt = (templateType) => {
    const prompts = {
      extract_data: "Please extract all important data points, numbers, dates, and key information from this document. Organize the extracted data in a structured format with clear categories.",
      summarize: "Please provide a comprehensive summary of this document, highlighting the main points, key findings, and important conclusions. Keep the summary concise but informative.",
      analyze_sentiment: "Analyze the sentiment and tone of this document. Identify positive, negative, and neutral elements, and provide an overall sentiment assessment.",
      find_patterns: "Identify any patterns, trends, or recurring themes in this document. Look for data patterns, structural patterns, or content patterns that might be significant.",
      validate_data: "Review this document for data accuracy, completeness, and consistency. Identify any potential errors, missing information, or inconsistencies.",
      compare_documents: "Compare this document with similar documents to identify differences, similarities, and unique elements. Highlight any notable variations or patterns."
    };
    return prompts[templateType] || '';
  };

  const handleSubmit = () => {
    if (!promptText.trim()) return;

    const newPrompt = {
      text: promptText,
      template: selectedTemplate,
      file: currentFile?.name || 'Unknown file',
      timestamp: new Date().toISOString()
    };

    onSubmitPrompt(newPrompt);
    
    // Add to history
    setPromptHistory(prev => [
      { ...newPrompt, id: Date.now(), success: true },
      ...prev.slice(0, 9) // Keep only last 10
    ]);
  };

  const handleQuickPrompt = (prompt) => {
    setPromptText(prompt);
    setSelectedTemplate('custom');
  };

  const handleHistoryPrompt = (historyItem) => {
    setPromptText(historyItem.prompt);
    setSelectedTemplate('custom');
    setShowHistory(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Custom AI Prompt</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="History"
            onClick={() => setShowHistory(!showHistory)}
          >
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="HelpCircle"
          >
            Help
          </Button>
        </div>
      </div>

      {/* Current File Info */}
      {currentFile && (
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="File" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{currentFile.name}</span>
            <span className="text-xs text-muted-foreground">• {currentFile.type}</span>
          </div>
        </div>
      )}

      {/* Template Selection */}
      <div className="mb-4">
        <Select
          label="Prompt Template"
          description="Choose a template or select custom to write your own"
          options={templateSuggestions}
          value={selectedTemplate}
          onChange={handleTemplateChange}
          placeholder="Select a template..."
          searchable
        />
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <Input
          label="AI Instructions"
          description="Describe what you want the AI to do with your document"
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Enter your custom prompt or instructions..."
          className="min-h-24"
        />
      </div>

      {/* Quick Prompts */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Quick Prompts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-left p-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-smooth border border-border"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="mb-4 bg-muted/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Prompts</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => handleHistoryPrompt(item)}
                className="cursor-pointer p-2 bg-card rounded border border-border hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{item.prompt}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{item.file}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    </div>
                  </div>
                  <Icon 
                    name={item.success ? "CheckCircle" : "AlertCircle"} 
                    size={12} 
                    className={item.success ? "text-success" : "text-error"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Shield" size={14} className="text-success" />
          <span>Secure processing • Data stays local</span>
        </div>
        
        <Button
          variant="default"
          iconName="Send"
          iconPosition="right"
          onClick={handleSubmit}
          disabled={!promptText.trim() || isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Submit Prompt'}
        </Button>
      </div>
    </div>
  );
};

export default CustomPromptInterface;