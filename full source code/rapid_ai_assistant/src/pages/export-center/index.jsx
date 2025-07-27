import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import SecurityBadge from '../../components/ui/SecurityBadge';
import ExportQueue from './components/ExportQueue';
import ExportPanel from './components/ExportPanel';
import ExportPreview from './components/ExportPreview';
import ExportHistory from './components/ExportHistory';
import BatchExportModal from './components/BatchExportModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ExportCenter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeView, setActiveView] = useState('export'); // 'export' or 'history'

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const handleBatchExport = (files) => {
    setSelectedFiles(files);
    setShowBatchModal(true);
  };

  const stats = {
    totalExports: 47,
    todayExports: 8,
    activeDownloads: 3,
    storageUsed: '12.4 GB'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Export Center</h1>
              <p className="text-muted-foreground">
                Download your processed documents in multiple formats with advanced customization options
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <SecurityBadge variant="secure" showDetails />
              <div className="flex items-center space-x-2">
                <Button
                  variant={activeView === 'export' ? 'default' : 'outline'}
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => setActiveView('export')}
                >
                  Export
                </Button>
                <Button
                  variant={activeView === 'history' ? 'default' : 'outline'}
                  size="sm"
                  iconName="History"
                  iconPosition="left"
                  onClick={() => setActiveView('history')}
                >
                  History
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Download" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Exports</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalExports}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Exports</p>
                  <p className="text-2xl font-bold text-foreground">{stats.todayExports}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Downloads</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeDownloads}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="HardDrive" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold text-foreground">{stats.storageUsed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {activeView === 'export' ? (
            <>
              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-5 gap-8 mb-8">
                {/* Export Queue - 40% width */}
                <div className="lg:col-span-2">
                  <ExportQueue 
                    onSelectFile={handleFileSelect}
                    onBatchExport={handleBatchExport}
                  />
                </div>

                {/* Export Panel - 60% width */}
                <div className="lg:col-span-3">
                  <ExportPanel selectedFile={selectedFile} />
                </div>
              </div>

              {/* Mobile/Tablet Layout */}
              <div className="lg:hidden space-y-6">
                {/* Queue Header for Mobile */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Ready for Export</h2>
                    <Button variant="outline" size="sm" iconName="List">
                      View Queue (5)
                    </Button>
                  </div>
                </div>

                {/* Export Panel */}
                <ExportPanel selectedFile={selectedFile} />
              </div>

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Eye"
                    iconPosition="left"
                    onClick={handlePreviewToggle}
                    disabled={!selectedFile}
                  >
                    Preview Export
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Package"
                    iconPosition="left"
                    onClick={() => setShowBatchModal(true)}
                  >
                    Batch Export
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Settings"
                    iconPosition="left"
                  >
                    Export Settings
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="RefreshCw"
                    iconPosition="left"
                  >
                    Refresh Queue
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <ExportHistory />
          )}

          {/* Security Notice */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Icon name="Shield" size={20} className="text-success mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-success mb-1">Secure Export Process</h3>
                <p className="text-sm text-success/80">
                  All file processing happens locally on your device. Export links are temporary and expire after your session ends. 
                  Your documents never leave your computer, ensuring complete privacy and security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ExportPreview
        selectedFile={selectedFile}
        isVisible={showPreview}
        onClose={() => setShowPreview(false)}
      />

      <BatchExportModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        selectedFiles={selectedFiles}
      />
    </div>
  );
};

export default ExportCenter;