import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalHeader from './components/GlobalHeader';
import SearchCommandPalette from './components/SearchCommandPalette';
import KeyboardShortcutsOverlay from './components/KeyboardShortcutsOverlay';
import NavigationBreadcrumbs from './components/NavigationBreadcrumbs';

const GlobalNavigationSystem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@jkdm.gov.my',
    role: 'agent',
    department: 'Customer Service',
    avatar: null
  });

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + H - Go to Dashboard
      if (event?.ctrlKey && event?.key === 'h') {
        event?.preventDefault();
        navigate('/agent-dashboard');
      }
      
      // Ctrl + / - Open Command Palette
      if (event?.ctrlKey && event?.key === '/') {
        event?.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Escape - Close overlays
      if (event?.key === 'Escape') {
        setShowCommandPalette(false);
        setShowKeyboardShortcuts(false);
      }
      
      // F1 - Show keyboard shortcuts
      if (event?.key === 'F1') {
        event?.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleGlobalSearch = (query) => {
    console.log('Searching for:', query);
    // In real implementation, this would perform search across tickets, customers, and knowledge articles
    setShowCommandPalette(false);
  };

  const handleCommandSelect = (command) => {
    switch (command?.action) {
      case 'navigate':
        navigate(command?.path);
        break;
      case 'search':
        handleGlobalSearch(command?.query);
        break;
      case 'shortcuts':
        setShowKeyboardShortcuts(true);
        break;
      default:
        console.log('Command executed:', command);
    }
    setShowCommandPalette(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header with Navigation */}
      <GlobalHeader 
        user={currentUser}
        currentPath={location?.pathname}
        onNavigate={handleNavigation}
        onShowCommandPalette={() => setShowCommandPalette(true)}
        onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
      />
      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-8">
        {/* Navigation Breadcrumbs */}
        <NavigationBreadcrumbs currentPath={location?.pathname} />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Global Navigation System
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive navigation system providing persistent header navigation across all JKDM CRM modules. 
            Features include role-based navigation, global search, keyboard shortcuts, and seamless module switching 
            with consistent user experience and government accessibility standards.
          </p>
        </div>

        {/* Navigation Features Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Navigation Overview */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Navigation Features</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground">Persistent Header</h3>
                  <p className="text-sm text-muted-foreground">
                    Always visible navigation across all modules with "JKDM CRM Portal" logo that returns to dashboard
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground">Role-Based Navigation</h3>
                  <p className="text-sm text-muted-foreground">
                    Primary tabs (Dashboard, Tickets, Knowledge Base, Reports) with role-based visibility controls
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground">Global Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Smart suggestions across tickets, customers, and knowledge articles with Ctrl+/ shortcut
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground">Breadcrumb Navigation</h3>
                  <p className="text-sm text-muted-foreground">
                    Clickable breadcrumbs showing current location hierarchy for easy navigation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Go to Dashboard</span>
                <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
                  Ctrl + H
                </kbd>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Open Command Palette</span>
                <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
                  Ctrl + /
                </kbd>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
                  F1
                </kbd>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Close Overlays</span>
                <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation State Demo */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Navigation State</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Current Location</h3>
              <p className="text-sm text-muted-foreground">{location?.pathname}</p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-foreground mb-2">User Role</h3>
              <p className="text-sm text-muted-foreground capitalize">{currentUser?.role}</p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Department</h3>
              <p className="text-sm text-muted-foreground">{currentUser?.department}</p>
            </div>
          </div>
        </div>
      </main>
      {/* Command Palette Modal */}
      {showCommandPalette && (
        <SearchCommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onCommandSelect={handleCommandSelect}
          onSearch={handleGlobalSearch}
        />
      )}
      {/* Keyboard Shortcuts Overlay */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsOverlay
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}
    </div>
  );
};

export default GlobalNavigationSystem;