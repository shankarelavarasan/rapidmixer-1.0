import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import QuickActionsPanel from './components/QuickActionsPanel';
import RecentActivityFeed from './components/RecentActivityFeed';
import WorkflowStatusCard from './components/WorkflowStatusCard';
import UsageStatistics from './components/UsageStatistics';
import RecentFilesTable from './components/RecentFilesTable';
import SecurityStatusPanel from './components/SecurityStatusPanel';
import projectService from '../../utils/projectService';
import fileService from '../../utils/fileService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    projectStats: null,
    fileStats: null,
    recentActivity: [],
    loading: true
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      const [projectsResult, projectStatsResult, fileStatsResult, activityResult] = await Promise.all([
        projectService.getUserProjects(),
        projectService.getProjectStats(),
        fileService.getFileStats(),
        projectService.getRecentActivity(5)
      ]);

      setDashboardData({
        projects: projectsResult.success ? projectsResult.data : [],
        projectStats: projectStatsResult.success ? projectStatsResult.data : null,
        fileStats: fileStatsResult.success ? fileStatsResult.data : null,
        recentActivity: activityResult.success ? activityResult.data : [],
        loading: false
      });
    } catch (error) {
      console.log('Dashboard data loading error:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  // Show loading state for unauthenticated users in preview mode
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={32} className="animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Preview mode for non-authenticated users
  const isPreviewMode = !user;
  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'Demo User';

  const workflowStats = [
    {
      title: 'Active Processing',
      count: dashboardData.projectStats?.processing || (isPreviewMode ? 3 : 0),
      icon: 'Brain',
      status: 'AI analysis in progress',
      progress: 67,
      estimatedTime: '~8 min remaining',
      variant: 'processing'
    },
    {
      title: 'Completed Today',
      count: dashboardData.projectStats?.completed || (isPreviewMode ? 12 : 0),
      icon: 'CheckCircle',
      status: 'Successfully processed',
      progress: 100,
      variant: 'completed'
    },
    {
      title: 'Total Projects',
      count: dashboardData.projectStats?.total || (isPreviewMode ? 18 : 0),
      icon: 'FolderOpen',
      status: 'All time projects',
      progress: 100,
      variant: 'info'
    }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleMobileActions = () => {
    setShowMobileActions(!showMobileActions);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Preview Mode Banner */}
          {isPreviewMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Eye" size={20} className="text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium">Preview Mode</p>
                  <p className="text-blue-600 text-sm">
                    You're viewing demo data. <button 
                      onClick={() => navigate('/login')} 
                      className="underline hover:no-underline"
                    >
                      Sign in
                    </button> to access your real dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {displayName}
                </h1>
                <p className="text-muted-foreground">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
                {userProfile?.role && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Icon name="Crown" size={14} className="mr-1" />
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} Plan
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                  <Icon name="Shield" size={16} />
                  <span>All Systems Secure</span>
                </div>
                <Button 
                  variant="default" 
                  iconName="Plus" 
                  iconPosition="left"
                  onClick={() => navigate('/file-upload')}
                  className="hidden sm:flex"
                >
                  Upload Files
                </Button>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left Sidebar - Quick Actions & Activity */}
            <div className="lg:col-span-3 space-y-6">
              <QuickActionsPanel />
              <div className="hidden lg:block">
                <RecentActivityFeed 
                  activities={dashboardData.recentActivity}
                  loading={dashboardData.loading}
                  isPreviewMode={isPreviewMode}
                />
              </div>
            </div>

            {/* Center Area - Workflow Status */}
            <div className="lg:col-span-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {workflowStats.map((stat, index) => (
                  <WorkflowStatusCard
                    key={index}
                    title={stat.title}
                    count={stat.count}
                    icon={stat.icon}
                    status={stat.status}
                    progress={stat.progress}
                    estimatedTime={stat.estimatedTime}
                    variant={stat.variant}
                  />
                ))}
              </div>

              {/* Mobile Activity Feed */}
              <div className="lg:hidden">
                <RecentActivityFeed 
                  activities={dashboardData.recentActivity}
                  loading={dashboardData.loading}
                  isPreviewMode={isPreviewMode}
                />
              </div>
            </div>

            {/* Right Sidebar - Statistics & Security */}
            <div className="lg:col-span-3 space-y-6">
              <UsageStatistics 
                userProfile={userProfile}
                fileStats={dashboardData.fileStats}
                isPreviewMode={isPreviewMode}
              />
              <SecurityStatusPanel />
            </div>
          </div>

          {/* Recent Files Table */}
          <div className="mb-8">
            <RecentFilesTable 
              projects={dashboardData.projects}
              loading={dashboardData.loading}
              isPreviewMode={isPreviewMode}
            />
          </div>

          {/* Mobile Floating Action Button */}
          <div className="fixed bottom-6 right-6 sm:hidden z-50">
            <Button
              variant="default"
              size="icon"
              iconName={showMobileActions ? "X" : "Plus"}
              onClick={toggleMobileActions}
              className="w-14 h-14 rounded-full shadow-hover"
            />
            
            {showMobileActions && (
              <div className="absolute bottom-16 right-0 space-y-2">
                <Button
                  variant="secondary"
                  iconName="Upload"
                  onClick={() => {
                    navigate('/file-upload');
                    setShowMobileActions(false);
                  }}
                  className="w-12 h-12 rounded-full shadow-modal"
                />
                <Button
                  variant="secondary"
                  iconName="FileTemplate"
                  onClick={() => {
                    navigate('/template-library');
                    setShowMobileActions(false);
                  }}
                  className="w-12 h-12 rounded-full shadow-modal"
                />
                <Button
                  variant="secondary"
                  iconName="Brain"
                  onClick={() => {
                    navigate('/ai-processing');
                    setShowMobileActions(false);
                  }}
                  className="w-12 h-12 rounded-full shadow-modal"
                />
              </div>
            )}
          </div>

          {/* Mobile Actions Overlay */}
          {showMobileActions && (
            <div
              className="fixed inset-0 bg-black/20 z-40 sm:hidden"
              onClick={() => setShowMobileActions(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;