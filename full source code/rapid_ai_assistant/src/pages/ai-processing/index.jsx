import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProgressIndicator from '../../components/ui/ProgressIndicator';
import SecurityBadge from '../../components/ui/SecurityBadge';
import ProcessingQueue from './components/ProcessingQueue';
import ResultsDisplay from './components/ResultsDisplay';
import CustomPromptInterface from './components/CustomPromptInterface';
import ExportPreparation from './components/ExportPreparation';
import ProcessingControls from './components/ProcessingControls';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AIProcessing = () => {
  const navigate = useNavigate();
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentView, setCurrentView] = useState('processing');

  // Mock data for active jobs
  const mockActiveJobs = [
    {
      id: 1,
      fileName: "financial_report_2024.pdf",
      template: "Financial Analysis Template",
      status: "processing",
      progress: 75,
      estimatedTime: 120,
      priority: "high",
      startTime: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      fileName: "customer_data.xlsx",
      template: "Data Extraction Template",
      status: "processing",
      progress: 45,
      estimatedTime: 180,
      priority: "medium",
      startTime: new Date(Date.now() - 180000)
    },
    {
      id: 3,
      fileName: "invoice_batch.pdf",
      template: "Invoice Processing Template",
      status: "paused",
      progress: 30,
      estimatedTime: 240,
      priority: "low",
      startTime: new Date(Date.now() - 600000)
    }
  ];

  // Mock data for completed jobs
  const mockCompletedJobs = [
    {
      id: 4,
      fileName: "market_analysis.pdf",
      template: "Market Research Template",
      status: "completed",
      completedAt: "2 hours ago",
      processingTime: "3m 45s"
    },
    {
      id: 5,
      fileName: "employee_records.xlsx",
      template: "HR Data Template",
      status: "completed",
      completedAt: "1 day ago",
      processingTime: "2m 15s"
    },
    {
      id: 6,
      fileName: "product_images.zip",
      template: "Image Analysis Template",
      status: "error",
      completedAt: "2 days ago",
      processingTime: "Failed after 1m 30s"
    }
  ];

  // Mock result data
  const mockResult = {
    id: 4,
    fileName: "market_analysis.pdf",
    fileType: "pdf",
    template: "Market Research Template",
    processingTime: "3m 45s",
    data: {
      sections: [
        {
          title: "Executive Summary",
          content: `The market analysis reveals significant growth opportunities in the technology sector.\n\nKey findings indicate a 25% increase in demand for AI-powered solutions, with particular strength in healthcare and finance verticals.\n\nRecommendations include strategic partnerships and increased R&D investment.`,
          highlights: ["25% growth", "AI solutions", "Healthcare", "Finance"]
        },
        {
          title: "Market Trends",
          content: `Current market trends show accelerating adoption of cloud technologies.\n\nRemote work solutions continue to drive demand for collaboration tools.\n\nSustainability initiatives are becoming key differentiators.`,
          highlights: ["Cloud adoption", "Remote work", "Sustainability"]
        },
        {
          title: "Competitive Analysis",
          content: `The competitive landscape is dominated by three major players.\n\nEmerging startups are disrupting traditional business models.\n\nPrice competition is intensifying in the mid-market segment.`,
          highlights: ["Three major players", "Startup disruption", "Price competition"]
        }
      ]
    },
    rawOutput: `MARKET ANALYSIS REPORT - 2024\n\nEXECUTIVE SUMMARY:\nThe technology sector shows unprecedented growth with AI solutions leading the charge...\n\nMARKET TRENDS:\n- Cloud adoption: 78% of enterprises\n- Remote work tools: 156% growth\n- Sustainability focus: 89% of companies\n\nCOMPETITIVE LANDSCAPE:\n1. TechCorp Inc. - 34% market share\n2. InnovateSoft - 28% market share\n3. DataDynamics - 22% market share\n\nRECOMMENDations:\n- Invest in AI capabilities\n- Expand cloud offerings\n- Develop sustainability features`,
    insights: [
      {
        title: "Growth Opportunity",
        description: "AI solutions market is expanding rapidly with 25% YoY growth",
        confidence: 92
      },
      {
        title: "Market Positioning",
        description: "Healthcare and finance verticals offer highest ROI potential",
        confidence: 87
      },
      {
        title: "Competitive Advantage",
        description: "Sustainability features can differentiate from competitors",
        confidence: 78
      }
    ]
  };

  useEffect(() => {
    setActiveJobs(mockActiveJobs);
    setCompletedJobs(mockCompletedJobs);
    setSelectedResult(mockResult);
    setIsProcessing(true);

    // Simulate processing updates
    const interval = setInterval(() => {
      setActiveJobs(prev => prev.map(job => ({
        ...job,
        progress: Math.min(job.progress + Math.random() * 5, 100),
        estimatedTime: Math.max(job.estimatedTime - 5, 0)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePauseJob = (jobId) => {
    setActiveJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'paused' } : job
    ));
  };

  const handleRestartJob = (jobId) => {
    setActiveJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'processing' } : job
    ));
  };

  const handleDeleteJob = (jobId) => {
    setActiveJobs(prev => prev.filter(job => job.id !== jobId));
    setCompletedJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleViewResult = (jobId) => {
    const result = completedJobs.find(job => job.id === jobId);
    if (result) {
      setSelectedResult(mockResult);
      setCurrentView('results');
    }
  };

  const handleSubmitPrompt = (prompt) => {
    console.log('Submitting prompt:', prompt);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  const handleExportResult = (resultId) => {
    navigate('/export-center');
  };

  const handleRefinePrompt = (resultId) => {
    setCurrentView('prompt');
  };

  const handleVerifyResult = (resultId) => {
    console.log('Verifying result:', resultId);
  };

  const handleExport = (config) => {
    console.log('Exporting with config:', config);
    navigate('/export-center');
  };

  const handlePreview = (config) => {
    console.log('Previewing export:', config);
  };

  const handlePauseAll = () => {
    setActiveJobs(prev => prev.map(job => ({ ...job, status: 'paused' })));
  };

  const handleResumeAll = () => {
    setActiveJobs(prev => prev.map(job => ({ ...job, status: 'processing' })));
  };

  const handleClearCompleted = () => {
    setCompletedJobs([]);
  };

  const handleBatchOperation = (operation) => {
    console.log('Batch operation:', operation);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <Breadcrumb />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">AI Processing</h1>
                <p className="text-muted-foreground">
                  Monitor and control document analysis with real-time AI processing
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <SecurityBadge variant="processing" showDetails />
                <Button
                  variant="outline"
                  iconName="Upload"
                  onClick={() => navigate('/file-upload')}
                >
                  Add Files
                </Button>
                <Button
                  variant="default"
                  iconName="FileTemplate"
                  onClick={() => navigate('/template-library')}
                >
                  Templates
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator 
              currentStep={3} 
              totalSteps={4}
              steps={[
                { label: 'Upload', icon: 'Upload', description: 'Files uploaded' },
                { label: 'Template', icon: 'FileTemplate', description: 'Template selected' },
                { label: 'Process', icon: 'Brain', description: 'AI analysis' },
                { label: 'Export', icon: 'Download', description: 'Download results' }
              ]}
            />
          </div>

          {/* View Toggle */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-muted rounded-lg p-1 w-fit">
              <button
                onClick={() => setCurrentView('processing')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-smooth ${
                  currentView === 'processing' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Brain" size={16} className="mr-2" />
                Processing
              </button>
              <button
                onClick={() => setCurrentView('results')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-smooth ${
                  currentView === 'results' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="FileText" size={16} className="mr-2" />
                Results
              </button>
              <button
                onClick={() => setCurrentView('prompt')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-smooth ${
                  currentView === 'prompt' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="MessageSquare" size={16} className="mr-2" />
                Custom Prompt
              </button>
              <button
                onClick={() => setCurrentView('export')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-smooth ${
                  currentView === 'export'
                    ? 'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Download" size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Main Content */}
          {currentView === 'processing' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Processing Queue - 30% width on desktop */}
              <div className="xl:col-span-4 space-y-6">
                <ProcessingQueue
                  activeJobs={activeJobs}
                  completedJobs={completedJobs}
                  onPauseJob={handlePauseJob}
                  onRestartJob={handleRestartJob}
                  onViewResult={handleViewResult}
                  onDeleteJob={handleDeleteJob}
                />
                
                <ProcessingControls
                  onPauseAll={handlePauseAll}
                  onResumeAll={handleResumeAll}
                  onClearCompleted={handleClearCompleted}
                  onBatchOperation={handleBatchOperation}
                  activeJobsCount={activeJobs.length}
                  completedJobsCount={completedJobs.length}
                  isProcessing={isProcessing}
                />
              </div>

              {/* Results Display - 70% width on desktop */}
              <div className="xl:col-span-8">
                <ResultsDisplay
                  currentResult={selectedResult}
                  onExportResult={handleExportResult}
                  onRefinePrompt={handleRefinePrompt}
                  onVerifyResult={handleVerifyResult}
                />
              </div>
            </div>
          )}

          {currentView === 'results' && (
            <div className="max-w-6xl mx-auto">
              <ResultsDisplay
                currentResult={selectedResult}
                onExportResult={handleExportResult}
                onRefinePrompt={handleRefinePrompt}
                onVerifyResult={handleVerifyResult}
              />
            </div>
          )}

          {currentView === 'prompt' && (
            <div className="max-w-4xl mx-auto">
              <CustomPromptInterface
                onSubmitPrompt={handleSubmitPrompt}
                isProcessing={isProcessing}
                currentFile={selectedResult ? { name: selectedResult.fileName, type: selectedResult.fileType } : null}
              />
            </div>
          )}

          {currentView === 'export' && (
            <div className="max-w-4xl mx-auto">
              <ExportPreparation
                currentResult={selectedResult}
                onExport={handleExport}
                onPreview={handlePreview}
              />
            </div>
          )}

          {/* Mobile Optimization Notice */}
          <div className="lg:hidden mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Smartphone" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-primary mb-1">Mobile Optimized</h4>
                <p className="text-sm text-primary/80">
                  Swipe between views and use full-screen result display for better mobile experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIProcessing;