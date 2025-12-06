import React from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import Icon from '../AppIcon';
import { routeConfig } from '../../config/routes';

const BreadcrumbNavigation = ({ customBreadcrumbs = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const currentPath = location?.pathname;
    const breadcrumbs = [];
    
    // Find matching route (handle dynamic routes)
    let matchedRoute = null;
    let matchedPath = null;
    
    // First try exact match
    if (routeConfig[currentPath]) {
      matchedRoute = routeConfig[currentPath];
      matchedPath = currentPath;
    } else {
      // Try pattern matching for dynamic routes
      for (const [path, route] of Object.entries(routeConfig)) {
        if (route?.pattern) {
          const match = matchPath(route.pattern, currentPath);
          if (match) {
            matchedRoute = route;
            matchedPath = path;
            break;
          }
        }
      }
    }
    
    const buildPath = (path) => {
      const route = routeConfig?.[path];
      if (!route) return;
      
      if (route?.parent) {
        buildPath(route?.parent);
      }
      
      breadcrumbs?.push({
        label: route?.label,
        path: route?.pattern ? currentPath : path,
        isActive: path === matchedPath
      });
    };

    if (matchedPath) {
      buildPath(matchedPath);
    }
    
    // Return empty if no match (single page, no breadcrumb needed)
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