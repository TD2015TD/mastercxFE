import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';
import ConversationNotification from './ConversationNotification';
import CommandPalette from './CommandPalette';
import TelephonyBar from '../TelephonyBar';
import cxLogo from '../../assets/cxlogo.png';

const Header = ({ user = null, onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const primaryNavItems = [
    {
      label: 'Dashboard',
      path: user?.role === 'supervisor'
        ? '/supervisor-dashboard'
        : (user?.role === 'admin' || user?.role === 'super admin')
          ? '/system-administration'
          : '/agent-dashboard',
      roles: ['agent', 'supervisor', 'admin', 'super admin']
    },
    {
      label: 'Tickets',
      path: '/ticket-management',
      roles: ['agent', 'supervisor', 'admin', 'super admin']
    },
    {
      label: 'Knowledge Base',
      path: '/knowledge-base-portal',
      roles: ['agent', 'supervisor', 'admin', 'super admin']
    },
    {
      label: 'Reports',
      path: '/analytics-and-reporting',
      roles: ['supervisor', 'admin', 'super admin']
    }
  ];

  const secondaryNavItems = [
    {
      label: 'Customer 360',
      path: '/customer-360-profile',
      roles: ['agent', 'supervisor', 'admin', 'super admin']
    },
    {
      label: 'Directory Search',
      path: '/directory-search-and-browsing',
      roles: ['agent', 'supervisor', 'admin', 'super admin']
    },
    {
      label: 'Administration',
      path: '/system-administration',
      roles: ['admin', 'super admin']
    },
    {
      label: 'Citizen Portal',
      path: '/citizen-self-service-portal',
      roles: ['agent', 'supervisor', 'admin', 'super admin']
    }
  ];

  const userRole = user?.role || 'agent';
  const filteredPrimaryItems = primaryNavItems?.filter(item =>
    item?.roles?.includes(userRole)
  );
  const filteredSecondaryItems = secondaryNavItems?.filter(item =>
    item?.roles?.includes(userRole)
  );

  // Enhanced keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + H - Go to Dashboard
      if (event?.ctrlKey && event?.key === 'h') {
        event?.preventDefault();
        const dashboardPath = user?.role === 'supervisor' ? '/supervisor-dashboard' : '/agent-dashboard';
        navigate(dashboardPath);
      }

      // Ctrl + / - Open Command Palette
      if (event?.ctrlKey && event?.key === '/') {
        event?.preventDefault();
        setIsCommandPaletteOpen(true);
      }

      // Escape key - Close command palette
      if (event?.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, user?.role, isCommandPaletteOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleDashboardNavigation = () => {
    const dashboardPath = user?.role === 'supervisor' ? '/supervisor-dashboard' : '/agent-dashboard';
    handleNavigation(dashboardPath);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCommandSelect = (command) => {
    setIsCommandPaletteOpen(false);
    if (command?.action === 'navigate') {
      navigate(command?.path);
    } else if (command?.action === 'home') {
      handleDashboardNavigation();
    }
  };

  // Handle telephony events
  const handleCallEvent = (eventType, eventData) => {
    console.log('📞 Telephony Event:', eventType, eventData);
    // You can add additional handling here (e.g., create ticket, log interaction)
  };

  // Handle conversation events from Employee Inbox
  const handleConversationEvent = (eventType, eventData) => {
    console.log('📬 Conversation Event:', eventType, eventData);
    // You can add additional handling here (e.g., notifications, logging)
  };

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo - Always returns to CRM Home */}
            <button
              onClick={handleDashboardNavigation}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
              title="Go to CRM Dashboard"
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
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item?.path)
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
                          className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${isActive(item?.path)
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

          {/* Right Section - Command Palette, Back to CRM Button and User Profile */}
          <div className="flex items-center space-x-4">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
              title="Open Command Palette (Ctrl + /)"
            >
              <Icon name="Search" size={16} />
              <span className="text-xs">Ctrl+/</span>
            </button>

            <ConversationNotification onConversationEvent={handleConversationEvent} />
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
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item?.path)
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
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item?.path)
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

      {/* Communication Tools - Directly below header */}
      <div className="sticky top-16 z-40 space-y-2 px-6 pt-2 bg-background">
        {/* Telephony Bar */}
        <TelephonyBar onCallEvent={handleCallEvent} />
      </div>

      {/* Command Palette */}
      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onCommandSelect={handleCommandSelect}
          navigationItems={[...filteredPrimaryItems, ...filteredSecondaryItems]}
          user={user}
        />
      )}
    </>
  );
};

export default Header;
