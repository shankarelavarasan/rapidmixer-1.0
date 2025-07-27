import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ResultsDisplay = ({ 
  currentResult = null, 
  onExportResult, 
  onRefinePrompt,
  onVerifyResult 
}) => {
  const [activeView, setActiveView] = useState('formatted');
  const [selectedText, setSelectedText] = useState('');

  if (!currentResult) {
    return (
      <div className="bg-card border border-border rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <Icon name="FileText" size={64} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Results Selected</h3>
          <p className="text-muted-foreground">
            Select a processing job from the queue to view results
          </p>
        </div>
      </div>
    );
  }

  const renderExcelData = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr className="bg-muted">
            {data.headers.map((header, index) => (
              <th key={index} className="border border-border px-3 py-2 text-left text-sm font-medium text-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-border px-3 py-2 text-sm text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPdfContent = (content) => (
    <div className="space-y-4">
      {content.sections.map((section, index) => (
        <div key={index} className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">{section.title}</h4>
          <div className="text-sm text-foreground leading-relaxed">
            {section.content.split('\n').map((paragraph, pIndex) => (
              <p key={pIndex} className="mb-2 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
          {section.highlights && section.highlights.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">Key Extractions:</h5>
              <div className="flex flex-wrap gap-2">
                {section.highlights.map((highlight, hIndex) => (
                  <span key={hIndex} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderImageAnalysis = (analysis) => (
    <div className="space-y-4">
      <div className="relative">
        <Image
          src={analysis.imageUrl}
          alt="Analyzed image"
          className="w-full max-h-96 object-contain rounded-lg border border-border"
        />
        {analysis.annotations && analysis.annotations.length > 0 && (
          <div className="absolute top-2 right-2">
            <Button variant="secondary" size="xs" iconName="Eye">
              {analysis.annotations.length} Annotations
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.detections.map((detection, index) => (
          <div key={index} className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">{detection.label}</h4>
              <span className="text-xs text-success font-medium">
                {Math.round(detection.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{detection.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const getFileTypeIcon = (type) => {
    switch (type) {
      case 'excel': return 'FileSpreadsheet';
      case 'pdf': return 'FileText';
      case 'image': return 'Image';
      default: return 'File';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name={getFileTypeIcon(currentResult.fileType)} size={20} className="text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">{currentResult.fileName}</h2>
              <p className="text-sm text-muted-foreground">
                Processed with {currentResult.template} • {currentResult.processingTime}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              onClick={() => onRefinePrompt(currentResult.id)}
            >
              Refine
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Download"
              onClick={() => onExportResult(currentResult.id)}
            >
              Export
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveView('formatted')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeView === 'formatted'
                ? 'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Formatted View
          </button>
          <button
            onClick={() => setActiveView('raw')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeView === 'raw' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Raw Output
          </button>
          <button
            onClick={() => setActiveView('insights')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeView === 'insights' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Insights
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeView === 'formatted' && (
          <div className="space-y-4">
            {currentResult.fileType === 'excel' && renderExcelData(currentResult.data)}
            {currentResult.fileType === 'pdf' && renderPdfContent(currentResult.data)}
            {currentResult.fileType === 'image' && renderImageAnalysis(currentResult.data)}
          </div>
        )}

        {activeView === 'raw' && (
          <div className="bg-muted/30 rounded-lg p-4">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
              {currentResult.rawOutput}
            </pre>
          </div>
        )}

        {activeView === 'insights' && (
          <div className="space-y-4">
            {currentResult.insights.map((insight, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="Lightbulb" size={16} className="text-accent mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    {insight.confidence && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <div className="flex-1 bg-border rounded-full h-1.5 max-w-24">
                          <div
                            className="bg-success h-1.5 rounded-full"
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-success font-medium">{insight.confidence}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Shield" size={16} className="text-success" />
            <span>Results verified • Data processed locally</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="CheckCircle"
            onClick={() => onVerifyResult(currentResult.id)}
          >
            Mark as Verified
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;