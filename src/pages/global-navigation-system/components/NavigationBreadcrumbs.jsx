import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const NavigationBreadcrumbs = ({ currentPath, customBreadcrumbs = null }) => {
  const navigate = useNavigate();

  const routeMap = {
    '/': { label: 'Dashboard', parent: null },
    '/agent-dashboard': { label: 'Agent Dashboard', parent: null },
    '/supervisor-dashboard': { label: 'Supervisor Dashboard', parent: null },
    '/ticket-management': { label: 'Ticket Management', parent: '/agent-dashboard' },
    '/ticket/new': { label: 'New Ticket', parent: '/ticket-management' },
    '/customer-360-profile': { label: 'Customer 360', parent: '/ticket-management' },
    '/knowledge-base-portal': { label: 'Knowledge Base', parent: '/agent-dashboard' },
    '/knowledge-base-content-creator-portal': { label: 'Content Creator Portal', parent: '/knowledge-base-portal' },
    '/citizen-self-service-portal': { label: 'Citizen Portal', parent: null },
    '/system-administration': { label: 'Administration', parent: null },
    '/analytics-and-reporting': { label: 'Analytics & Reports', parent: '/supervisor-dashboard' },
    '/global-navigation-system': { label: 'Global Navigation System', parent: '/system-administration' }
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

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
    
    if (breadcrumbs?.length === 0) {
      return [{ label: 'Dashboard', path: '/agent-dashboard', isActive: true }];
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path) => {
    if (path && path !== currentPath) {
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

export default NavigationBreadcrumbs;