import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationSidebar = ({ isCollapsed = false, onToggleCollapse, userRole = 'agent' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: userRole === 'supervisor' ? '/supervisor-dashboard' : '/agent-dashboard',
      icon: 'LayoutDashboard',
      roles: ['agent', 'supervisor'],
      tooltip: 'View your daily workspace and active assignments'
    },
    {
      label: 'Tickets',
      path: '/ticket-management',
      icon: 'Ticket',
      roles: ['agent', 'supervisor'],
      tooltip: 'Manage customer tickets and cases'
    },
    {
      label: 'Customer 360',
      path: '/customer-360-profile',
      icon: 'Users',
      roles: ['agent', 'supervisor'],
      tooltip: 'Complete customer profile and interaction history'
    },
    {
      label: 'Knowledge Base',
      path: '/knowledge-base-portal',
      icon: 'BookOpen',
      roles: ['agent', 'supervisor', 'admin'],
      tooltip: 'Access articles and documentation'
    },
    {
      label: 'Analytics',
      path: '/analytics-and-reporting',
      icon: 'BarChart3',
      roles: ['supervisor', 'admin'],
      tooltip: 'Performance monitoring and reports'
    },
    {
      label: 'Administration',
      path: '/system-administration',
      icon: 'Settings',
      roles: ['admin'],
      tooltip: 'System configuration and user management'
    },
    {
      label: 'Citizen Portal',
      path: '/citizen-self-service-portal',
      icon: 'Globe',
      roles: ['agent', 'supervisor', 'admin'],
      tooltip: 'Public self-service interface'
    }
  ];

  const filteredItems = navigationItems?.filter(item => 
    item?.roles?.includes(userRole)
  );

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-[1000] safe-area-inset-bottom">
        <div className="flex justify-around items-center px-2 py-2">
          {filteredItems?.slice(0, 4)?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 min-w-0 flex-1 ${
                isActive(item?.path)
                  ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={item?.tooltip}
            >
              <Icon name={item?.icon} size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{item?.label}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 h-full bg-card border-r border-border z-[1000] transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-60'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={20} color="white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">JKDM CRM</h1>
                <p className="text-xs text-muted-foreground">Portal</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Icon name="Shield" size={20} color="white" />
            </div>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md hover:bg-muted transition-colors duration-200"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon 
                name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
                size={16} 
                className="text-muted-foreground"
              />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {filteredItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={isCollapsed ? item?.tooltip : ''}
              >
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  className={`flex-shrink-0 ${
                    isActive(item?.path) ? 'text-primary-foreground' : ''
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate">{item?.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 bg-popover border border-border rounded-md px-2 py-1 text-sm font-medium text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item?.label}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          {!isCollapsed ? (
            <div className="text-xs text-muted-foreground text-center">
              <p>Government of Malaysia</p>
              <p className="mt-1">Secure Portal v2.1</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Icon name="Shield" size={16} className="text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationSidebar;