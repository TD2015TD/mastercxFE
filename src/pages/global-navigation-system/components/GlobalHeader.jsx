import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import UserProfileDropdown from '../../../components/ui/UserProfileDropdown';
import NotificationCenter from '../../../components/ui/NotificationCenter';
import cxLogo from '../../../assets/cxlogo.png';

const GlobalHeader = ({ 
  user = null, 
  currentPath = '/', 
  onNavigate, 
  onShowCommandPalette, 
  onShowKeyboardShortcuts 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const primaryNavItems = [
    {
      label: 'Dashboard',
      path: user?.role === 'supervisor' ? '/supervisor-dashboard' : '/agent-dashboard',
      roles: ['agent', 'supervisor', 'admin']
    },
    {
      label: 'Tickets',
      path: '/ticket-management',
      roles: ['agent', 'supervisor']
    },
    {
      label: 'Knowledge Base',
      path: '/knowledge-base-portal',
      roles: ['agent', 'supervisor', 'admin']
    },
    {
      label: 'Reports',
      path: '/analytics-and-reporting',
      roles: ['supervisor', 'admin']
    }
  ];

  const secondaryNavItems = [
    {
      label: 'Customer 360',
      path: '/customer-360-profile',
      roles: ['agent', 'supervisor']
    },
    {
      label: 'Administration',
      path: '/system-administration',
      roles: ['admin']
    },
    {
      label: 'Citizen Portal',
      path: '/citizen-self-service-portal',
      roles: ['agent', 'supervisor', 'admin']
    }
  ];

  const userRole = user?.role || 'agent';
  const filteredPrimaryItems = primaryNavItems?.filter(item => 
    item?.roles?.includes(userRole)
  );
  const filteredSecondaryItems = secondaryNavItems?.filter(item => 
    item?.roles?.includes(userRole)
  );

  const handleNavigation = (path) => {
    onNavigate?.(path);
    setIsMobileMenuOpen(false);
  };

  const handleDashboardNavigation = () => {
    const dashboardPath = user?.role === 'supervisor' ? '/supervisor-dashboard' : '/agent-dashboard';
    handleNavigation(dashboardPath);
  };

  const isActive = (path) => {
    return currentPath === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo - Always returns to CRM Home */}
          <button 
            onClick={handleDashboardNavigation}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={cxLogo} alt="CRM Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">JKDM CRM Portal</h1>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {filteredPrimaryItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item?.label}
              </button>
            ))}
            
            {/* More Menu */}
            {filteredSecondaryItems?.length > 0 && (
              <div className="relative group">
                <button className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 flex items-center space-x-1">
                  <span>More</span>
                  <Icon name="ChevronDown" size={16} />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    {filteredSecondaryItems?.map((item) => (
                      <button
                        key={item?.path}
                        onClick={() => handleNavigation(item?.path)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                          isActive(item?.path)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-popover-foreground hover:bg-muted'
                        }`}
                      >
                        {item?.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors duration-200"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>

        {/* Center Section - Global Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <button
            onClick={onShowCommandPalette}
            className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-left text-muted-foreground hover:bg-muted/80 transition-colors duration-200 flex items-center space-x-2"
          >
            <Icon name="Search" size={16} />
            <span className="flex-1">Search tickets, customers, articles...</span>
            <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">
              Ctrl /
            </kbd>
          </button>
        </div>

        {/* Right Section - Actions and User Profile */}
        <div className="flex items-center space-x-4">
          {/* Back to CRM Button (for non-dashboard pages) */}
          {!currentPath?.includes('dashboard') && (
            <button
              onClick={handleDashboardNavigation}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground hover:bg-muted/80 transition-colors duration-200"
            >
              <Icon name="Home" size={16} />
              <span>Back to CRM</span>
            </button>
          )}
          
          {/* Mobile Search Button */}
          <button
            onClick={onShowCommandPalette}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors duration-200"
          >
            <Icon name="Search" size={20} />
          </button>
          
          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onShowKeyboardShortcuts}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
            title="Keyboard Shortcuts (F1)"
          >
            <Icon name="Keyboard" size={20} />
          </button>
          
          <NotificationCenter />
          <UserProfileDropdown user={user} />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-6 py-4 space-y-2">
            {/* Mobile Back to CRM Home */}
            <button
              onClick={handleDashboardNavigation}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground flex items-center space-x-2"
            >
              <Icon name="Home" size={16} />
              <span>🏠 Back to CRM Home</span>
            </button>
            
            <div className="text-sm font-medium text-muted-foreground mt-4 mb-3">Primary</div>
            {filteredPrimaryItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item?.label}
              </button>
            ))}
            
            {filteredSecondaryItems?.length > 0 && (
              <>
                <div className="text-sm font-medium text-muted-foreground mt-4 mb-3">More</div>
                {filteredSecondaryItems?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(item?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {item?.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default GlobalHeader;