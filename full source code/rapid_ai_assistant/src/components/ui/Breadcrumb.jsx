import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeLabels = {
    '/dashboard': 'Dashboard',
    '/file-upload': 'Upload Files',
    '/template-library': 'Template Library',
    '/ai-processing': 'AI Processing',
    '/export-center': 'Export Center'
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];

    // Always start with Dashboard as home
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    });

    // Add current page if not dashboard
    if (location.pathname !== '/dashboard' && routeLabels[location.pathname]) {
      breadcrumbs.push({
        label: routeLabels[location.pathname],
        path: location.pathname,
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center space-x-2">
            {index > 0 && (
              <Icon name="ChevronRight" size={14} className="text-muted-foreground/60" />
            )}
            
            {crumb.isActive ? (
              <span className="text-foreground font-medium" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <button
                onClick={() => handleNavigation(crumb.path)}
                className="hover:text-foreground transition-smooth"
              >
                {crumb.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;