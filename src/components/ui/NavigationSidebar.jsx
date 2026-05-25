import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
// import { menuService } from '../../services/menuService'; // commented out: dynamic API menu (see below)
import cxLogo from '../../assets/cxlogo.png';

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

  // ─── DYNAMIC API MENU (commented out — to re-enable, uncomment below and remove the role-based block) ───
  // const [navigationItems, setNavigationItems] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  //
  // useEffect(() => {
  //   const fetchMenuItems = async () => {
  //     setIsLoading(true);
  //     try {
  //       const items = await menuService.getMenuItems();
  //       setNavigationItems(items);
  //     } catch (error) {
  //       console.error('Failed to load menu items:', error);
  //       setNavigationItems(getDefaultMenuItems());
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchMenuItems();
  // }, [userRole]);
  //
  // const getDefaultMenuItems = () => [
  //   {
  //     label: 'Dashboard',
  //     path: userRole === 'supervisor'
  //       ? '/supervisor-dashboard'
  //       : (userRole === 'admin' || userRole === 'super admin')
  //         ? '/system-administration'
  //         : '/agent-dashboard',
  //     icon: 'LayoutDashboard',
  //     tooltip: 'View your daily workspace and active assignments'
  //   },
  //   { label: 'Tickets',        path: '/ticket-management',          icon: 'Ticket',    tooltip: 'Manage customer tickets and cases' },
  //   { label: 'Customer 360',   path: '/customer-360-profile',       icon: 'Users',     tooltip: 'Complete customer profile and interaction history' },
  //   { label: 'Knowledge Base', path: '/knowledge-base-portal',      icon: 'BookOpen',  tooltip: 'Access articles and documentation' },
  //   { label: 'Analytics',      path: '/analytics-and-reporting',    icon: 'BarChart3', tooltip: 'Performance monitoring and reports' },
  //   { label: 'Administration', path: '/system-administration',      icon: 'Settings',  tooltip: 'System configuration and user management' },
  //   { label: 'Citizen Portal', path: '/citizen-self-service-portal',icon: 'Globe',     tooltip: 'Public self-service interface' },
  // ];
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────

  // ─── ROLE-BASED STATIC MENU (active) ─────────────────────────────────────────
  const getMenuItems = (role) => {
    const isSupervisorOrAbove = role === 'supervisor' || role === 'admin' || role === 'super_admin' || role === 'super admin';

    if (isSupervisorOrAbove) {
      return [
        { label: 'Dashboard',      path: '/supervisor-dashboard',    icon: 'LayoutDashboard', tooltip: 'Supervisor dashboard overview' },
        { label: 'Tickets',        path: '/ticket-management',       icon: 'Ticket',          tooltip: 'Manage customer tickets' },
        { label: 'Customer 360',   path: '/customer-360-profile',    icon: 'Users',           tooltip: 'Complete customer profile' },
        { label: 'Knowledge Base', path: '/knowledge-base-portal',   icon: 'BookOpen',        tooltip: 'Access articles and documentation' },
        { label: 'Analytics',      path: '/analytics-and-reporting', icon: 'BarChart3',       tooltip: 'Jana laporan dan analitik dari Superset' },
        { label: 'Administration', path: '/system-administration',   icon: 'Settings',        tooltip: 'System configuration and user management' },
      ];
    }

    // Default: agent / user
    return [
      { label: 'Dashboard', path: '/agent-dashboard', icon: 'LayoutDashboard', tooltip: 'View your daily workspace' },
      { label: 'Tickets', path: '/ticket-management', icon: 'Ticket', tooltip: 'Manage customer tickets' },
      { label: 'Customer 360', path: '/customer-360-profile', icon: 'Users', tooltip: 'Complete customer profile' },
      { label: 'Knowledge Base', path: '/knowledge-base-portal', icon: 'BookOpen', tooltip: 'Access articles and documentation' },
    ];
  };

  const navigationItems = getMenuItems(userRole);
  // ─────────────────────────────────────────────────────────────────────────────

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  // Loading spinner — only used with the dynamic API menu above
  // if (isLoading) {
  //   return (
  //     <nav className={`fixed top-0 left-0 h-full bg-card border-r border-border z-[1000] transition-all duration-300 ease-in-out ${
  //       isCollapsed ? 'w-16' : 'w-60'
  //     }`}>
  //       <div className="flex items-center justify-center h-full">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //       </div>
  //     </nav>
  //   );
  // }

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-[1000] safe-area-inset-bottom">
        <div className="flex justify-around items-center px-2 py-2">
          {navigationItems?.slice(0, 4)?.map((item) => (
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
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={cxLogo} alt="CRM Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">JKDM CRM</h1>
                <p className="text-xs text-muted-foreground">Portal</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-12 h-12 flex items-center justify-center mx-auto">
              <img src={cxLogo} alt="CRM Logo" className="w-full h-full object-contain" />
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
            {navigationItems?.map((item) => (
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
              <img src={cxLogo} alt="CRM Logo" className="w-12 h-12 object-contain opacity-60" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationSidebar;