import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import languageService from '../../services/languageService';
import { updateMitelEmployeeState, createPresenceStatePayload } from '../../services/mitelService';

const UserProfileDropdown = ({ user = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availability, setAvailability] = useState('Available'); // State for availability
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const dropdownRef = useRef(null);

  const defaultUser = {
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@jkdm.gov.my',
    role: 'agent',
    department: 'Customer Service',
    avatar: null
  };

  const currentUser = user || defaultUser;

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (language) => {
    // Clear language cache to force fresh translations
    languageService.clearCache();
    
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
    setIsOpen(false);
    
    // Reload page to apply new language across all components
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-session');
    window.location.href = '/agent-login';
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
  };

  const handleAvailabilityChange = async (status) => {
    try {
      setIsUpdatingStatus(true);

      // Map UI status to Mitel status
      const mitelStatus = status === 'Do Not Disturb' ? 'DoNotDisturb' : status;

      // Create the payload using the helper function
      const payload = createPresenceStatePayload(mitelStatus);

      // Update Mitel employee state (using 'me' for current user)
      const response = await updateMitelEmployeeState('me', payload);

      if (response.success || response.status === 'success') {
        setAvailability(status);
        console.log('✅ Mitel status updated successfully:', status);
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Failed to update Mitel status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'agent': 'Customer Service Agent',
      'supervisor': 'Supervisor',
      'admin': 'System Administrator'
    };
    return roleMap?.[role] || 'User';
  };

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
          {currentUser?.avatar ? (
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(currentUser?.name)
          )}
        </div>
        
        {/* User Info - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground">{currentUser?.name}</div>
          <div className="text-xs text-muted-foreground">{getRoleDisplayName(currentUser?.role)}</div>
        </div>
        
        <Icon 
          name={isOpen ? 'ChevronUp' : 'ChevronDown'} 
          size={16} 
          className="text-muted-foreground hidden md:block"
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-lg shadow-modal z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser?.avatar} 
                    alt={currentUser?.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(currentUser?.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-popover-foreground truncate">
                  {currentUser?.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentUser?.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getRoleDisplayName(currentUser?.role)} • {currentUser?.department}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile Settings */}
            <button
              onClick={handleProfileSettings}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
            >
              <Icon name="User" size={16} />
              <span>Profile Settings</span>
            </button>

            {/* Language Selection */}
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">Language</div>
              <div className="space-y-1">
                {languages?.map((language) => (
                  <button
                    key={language?.code}
                    onClick={() => handleLanguageChange(language?.code)}
                    className={`w-full flex items-center space-x-3 px-2 py-1 rounded text-sm transition-colors duration-200 ${
                      currentLanguage === language?.code
                        ? 'bg-primary text-primary-foreground'
                        : 'text-popover-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{language?.flag}</span>
                    <span>{language?.name}</span>
                    {currentLanguage === language?.code && (
                      <Icon name="Check" size={14} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Status Section */}
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
                <span>Status</span>
                {isUpdatingStatus && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                )}
              </div>
              <div className="space-y-1">
                {['Available', 'Busy', 'Do Not Disturb', 'Offline'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleAvailabilityChange(status)}
                    disabled={isUpdatingStatus}
                    className={`w-full flex items-center space-x-3 px-2 py-1 rounded text-sm transition-colors duration-200 ${
                      availability === status
                        ? 'bg-primary text-primary-foreground'
                        : 'text-popover-foreground hover:bg-muted'
                    } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{status}</span>
                    {availability === status && (
                      <Icon name="Check" size={14} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-2"></div>

            {/* Help & Support */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
            >
              <Icon name="HelpCircle" size={16} />
              <span>Help & Support</span>
            </button>

            {/* Session Info */}
            <div className="px-4 py-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Session expires in 45 minutes
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-200"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;