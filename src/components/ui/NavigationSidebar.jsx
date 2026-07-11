import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { menuService } from '../../services/menuService';
import cxLogo from '../../assets/cxlogo.png';

// Maps a parent menu path to its "Create" child route shown when can_create is true
const CREATE_CHILD_ROUTES = {
  '/ticket-management':      { label: 'Create Ticket',  path: '/ticket-management/create',              icon: 'Plus' },
  '/knowledge-base-portal':  { label: 'Create Article', path: '/knowledge-base-content-creator-portal', icon: 'Plus' },
  '/system-administration':  { label: 'Add User',       path: '/system-administration/users/create',    icon: 'UserPlus' },
};

const NavigationSidebar = ({ isCollapsed = false, onToggleCollapse, userRole = 'agent' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ─── DYNAMIC API MENU — reads from DB via role-based menu assignments ────────
  const [navigationItems, setNavigationItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getDefaultMenuItems = () => {
    const isSupervisorOrAbove = userRole === 'supervisor' || userRole === 'admin' || userRole === 'super_admin' || userRole === 'super admin';
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
    return [
      { label: 'Dashboard',      path: '/agent-dashboard',          icon: 'LayoutDashboard', tooltip: 'View your daily workspace' },
      { label: 'Tickets',        path: '/ticket-management',        icon: 'Ticket',          tooltip: 'Manage customer tickets' },
      { label: 'Customer 360',   path: '/customer-360-profile',     icon: 'Users',           tooltip: 'Complete customer profile' },
      { label: 'Knowledge Base', path: '/knowledge-base-portal',    icon: 'BookOpen',        tooltip: 'Access articles and documentation' },
    ];
  };

  useEffect(() => {
    // Wipe any stale localStorage menu cache from the old caching implementation
    localStorage.removeItem('menu_items_cache');
    localStorage.removeItem('menu_items_cache_timestamp');

    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        const items = await menuService.getMenuItems();
        // Only show items where can_view is true (or has no permissions key = default menus)
        const visible = (items || []).filter(item =>
          !item.permissions || item.permissions.can_view !== false
        );
        setNavigationItems(visible.length > 0 ? visible : getDefaultMenuItems());
      } catch (error) {
        console.error('Failed to load menu items:', error);
        setNavigationItems(getDefaultMenuItems());
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuItems();
  }, [userRole]);
  // ─────────────────────────────────────────────────────────────────────────────

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  const isParentActive = (item) => {
    if (isActive(item?.path)) return true;
    const child = CREATE_CHILD_ROUTES[item?.path];
    return child ? isActive(child.path) : false;
  };

  const toggleExpand = (path) => {
    setExpandedItems(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Auto-expand parent when a child route is active
  useEffect(() => {
    const currentPath = location?.pathname;
    Object.entries(CREATE_CHILD_ROUTES).forEach(([parentPath, child]) => {
      if (currentPath === child.path) {
        setExpandedItems(prev => ({ ...prev, [parentPath]: true }));
      }
    });
  }, [location?.pathname]);

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
            {navigationItems?.map((item) => {
              const hasCreate = item?.permissions?.can_create && CREATE_CHILD_ROUTES[item?.path];
              const childRoute = CREATE_CHILD_ROUTES[item?.path];
              const isExpanded = expandedItems[item?.path];
              const parentActive = isParentActive(item);

              return (
                <div key={item?.path}>
                  {/* Parent row */}
                  <div className="flex items-center">
                    <button
                      onClick={() => hasCreate ? toggleExpand(item?.path) : handleNavigation(item?.path)}
                      className={`flex-1 flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group ${
                        parentActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      title={isCollapsed ? item?.tooltip : ''}
                    >
                      <Icon
                        name={item?.icon}
                        size={20}
                        className={`flex-shrink-0 ${parentActive ? 'text-primary-foreground' : ''}`}
                      />
                      {!isCollapsed && (
                        <span className="font-medium text-sm truncate flex-1">{item?.label}</span>
                      )}
                      {!isCollapsed && hasCreate && (
                        <Icon
                          name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                          size={14}
                          className={`flex-shrink-0 ${parentActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                        />
                      )}
                      {isCollapsed && (
                        <div className="absolute left-16 bg-popover border border-border rounded-md px-2 py-1 text-sm font-medium text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item?.label}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Child rows — shown when expanded and not collapsed */}
                  {!isCollapsed && hasCreate && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {/* View All */}
                      <button
                        onClick={() => handleNavigation(item?.path)}
                        className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-left transition-all duration-200 text-xs ${
                          isActive(item?.path)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name="List" size={14} className="flex-shrink-0" />
                        <span>View All</span>
                      </button>
                      {/* Create child */}
                      <button
                        onClick={() => handleNavigation(childRoute.path)}
                        className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-left transition-all duration-200 text-xs ${
                          isActive(childRoute.path)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name={childRoute.icon} size={14} className="flex-shrink-0" />
                        <span>{childRoute.label}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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