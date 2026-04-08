import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavigationSidebar from './ui/NavigationSidebar';
import Header from './ui/Header';
import BreadcrumbNavigation from './ui/BreadcrumbNavigation';

interface HeaderUser {
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string | null;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get user from localStorage - using useMemo to avoid re-parsing on every render
  const user = useMemo<HeaderUser | null>(() => {
    const userSession = localStorage.getItem('user-session');
    if (!userSession) return null;
    
    try {
      const userData = JSON.parse(userSession);
      // Handle role being either a string or an object
      let roleString = 'agent';
      if (typeof userData.role === 'string') {
        roleString = userData.role;
      } else if (userData.role && typeof userData.role === 'object') {
        roleString = userData.role.slug || userData.role.name || 'agent';
      }
      
      return {
        name: userData.name || 'User',
        email: userData.email || '',
        role: roleString,
        department: userData.department || '',
        avatar: userData.avatar || null
      };
    } catch (error) {
      console.error('Error parsing user session:', error);
      return null;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      navigate('/agent-login');
    }
  }, [user, navigate]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Don't render layout on login page
  const isLoginPage = location.pathname === '/' || location.pathname === '/agent-login';
  
  if (isLoginPage || !user) {
    return <>{children}</>;
  }

  // At this point, user is guaranteed to be non-null due to the check above
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        userRole={user.role}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        {/* Header */}
        <Header user={user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation />
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
