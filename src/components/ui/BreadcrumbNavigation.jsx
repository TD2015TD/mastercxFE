import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbNavigation = ({ customBreadcrumbs = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/agent-dashboard': { label: 'Dashboard', parent: null },
    '/supervisor-dashboard': { label: 'Dashboard', parent: null },
    '/ticket-management': { label: 'Tickets', parent: '/agent-dashboard' },
    '/ticket/new': { label: 'New Ticket', parent: '/ticket-management' },
    '/customer-360-profile': { label: 'Customer 360', parent: '/ticket-management' },
    '/knowledge-base-portal': { label: 'Knowledge Base', parent: '/agent-dashboard' },
    '/knowledge-base-content-creator-portal': { label: 'Content Creator Portal', parent: '/knowledge-base-portal' },
    '/directory-search-and-browsing': { label: 'Directory Search', parent: '/knowledge-base-portal' },
    '/citizen-self-service-portal': { label: 'Citizen Portal', parent: null },
    '/system-administration': { label: 'Administration', parent: null },
    '/analytics-and-reporting': { label: 'Analytics & Reports', parent: '/supervisor-dashboard' },
    '/global-navigation-system': { label: 'Global Navigation System', parent: '/system-administration' }
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const currentPath = location?.pathname;
    const breadcrumbs = [];
    
    const buildPath = (path) => {
      const route = routeMap?.[path];
      if (!route) return;
      
      if (route?.parent) {
        buildPath(route?.parent);
      }
      
      breadcrumbs?.push({
        label: route?.label,
        path: path,
        isActive: path === currentPath
      });
    };

    buildPath(currentPath);
    
    // Always ensure we have a dashboard root
    if (breadcrumbs?.length === 0) {
      return [{ label: 'Dashboard', path: '/agent-dashboard', isActive: true }];
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path) => {
    if (path && path !== location?.pathname) {
      navigate(path);
    }
  };

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path || index} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={14} 
                className="text-muted-foreground mx-2" 
              />
            )}
            
            {crumb?.isActive ? (
              <span className="text-foreground font-medium" aria-current="page">
                {crumb?.label}
              </span>
            ) : (
              <button
                onClick={() => handleNavigation(crumb?.path)}
                className="hover:text-foreground transition-colors duration-200 focus:outline-none focus:text-foreground"
              >
                {crumb?.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;