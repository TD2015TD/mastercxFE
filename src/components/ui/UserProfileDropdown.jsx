import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import languageService from '../../services/languageService';
import { updateEmployeeStateDirect, createPresenceStatePayload, getMitelEmployeeState } from '../../services/mitelService';
import { toast } from 'react-toastify';
import BusyReasonModal from '../BusyReasonModal';
import { authService } from '../../services/authService';
import { useWebRTCSoftphone } from '../../hooks/useWebRTCSoftphone';
import mitelConfigService from '../../services/mitelConfigService';

const UserProfileDropdown = ({ user = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availability, setAvailability] = useState('Offline'); // Default to Offline until we fetch status
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBusyReasonModalOpen, setIsBusyReasonModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingStatusType, setPendingStatusType] = useState(null);
  const [isLoadingInitialStatus, setIsLoadingInitialStatus] = useState(true);
  const [isAgent, setIsAgent] = useState(false);
  const [telephonyEnabled, setTelephonyEnabled] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch telephony enabled state from admin configuration
  useEffect(() => {
    mitelConfigService.getTelephonyEnabled()
      .then(enabled => setTelephonyEnabled(enabled))
      .catch(() => setTelephonyEnabled(false));
  }, []);

  // Listen for admin changes to telephony enabled state
  useEffect(() => {
    const handler = (e) => setTelephonyEnabled(e.detail);
    window.addEventListener('telephony_enabled_changed', handler);
    return () => window.removeEventListener('telephony_enabled_changed', handler);
  }, []);

  // WebRTC Softphone hook
  const { initialize: initializeWebRTC, isRegistered: isWebRTCRegistered, disconnect: disconnectWebRTC } = useWebRTCSoftphone();

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

  // Check if user is an agent
  useEffect(() => {
    try {
      const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
      const authData = authService.getCurrentUser();
      const role = userSession?.role?.slug || authData?.role?.slug || currentUser?.role || '';
      const agentRoles = ['agent', 'supervisor', 'super-admin', 'admin'];
      const isAgentUser = agentRoles.includes(role.toLowerCase());

      setIsAgent(isAgentUser);
      console.log('👤 UserProfileDropdown - User role:', role, 'Is Agent:', isAgentUser);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAgent(false);
    }
  }, [currentUser]);

  // Fetch initial Mitel status on mount
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        setIsLoadingInitialStatus(true);

        // Get employee_id from user object (from localStorage or props)
        const authData = authService.getCurrentUser();
        console.log(authData);

        // Check if user is an agent
        const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
        const role = userSession?.role?.slug || authData?.role?.slug || currentUser?.role || '';
        const agentRoles = ['agent', 'supervisor', 'super-admin', 'admin'];
        const isAgent = agentRoles.includes(role.toLowerCase());

        if (!isAgent) {
          console.log('⚠️ User is not an agent, skipping Mitel status fetch');
          setAvailability('Offline');
          setIsLoadingInitialStatus(false);
          return;
        }

        const employeeId = currentUser?.agent?.employee_id || authData?.agent?.employee_id;

        if (!employeeId) {
          console.warn('⚠️ No employee ID found, cannot fetch Mitel status');
          setAvailability('Offline');
          setIsLoadingInitialStatus(false);
          return;
        }

        const response = await getMitelEmployeeState(employeeId);

        // Handle both response formats: { success: true } and { status: "success" }
        const isSuccess = response.success || response.status === 'success';
        const mitelState = response.data?.presence?.aggregate?.state;

        if (isSuccess && mitelState) {
          // Map Mitel state to UI state
          let uiState = mitelState;
          if (mitelState === 'DoNotDisturb') {
            uiState = 'Do Not Disturb';
          }

          setAvailability(uiState);
          console.log('✅ Initial Mitel status fetched:', uiState, 'for employee:', employeeId);

          // If status is Available, initialize WebRTC Softphone automatically
          if (uiState === 'Available' && !isWebRTCRegistered) {
            console.log('📞 Status is Available on load, initializing WebRTC softphone...');
            try {
              await initializeWebRTC(employeeId);
              console.log('✅ WebRTC softphone initialized successfully on load');
              toast.success('Softphone connected and ready for calls');
            } catch (error) {
              console.error('❌ Failed to initialize WebRTC softphone on load:', error);
              toast.warning('Could not connect softphone. You may not be able to make/receive calls through browser.');
            }
          }
        } else {
          console.warn('⚠️ Could not fetch initial Mitel status, defaulting to Offline');
          console.log('Response:', response);
          setAvailability('Offline');
        }
      } catch (error) {
        console.error('❌ Failed to fetch initial Mitel status:', error);
        setAvailability('Offline');
      } finally {
        setIsLoadingInitialStatus(false);
      }
    };

    fetchInitialStatus();
  }, [currentUser]);

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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, clear storage and redirect
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      window.location.href = '/agent-login';
    }
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
  };

  const handleAvailabilityChange = async (status) => {
    // Check if user is an agent
    const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
    const authData = authService.getCurrentUser();
    const role = userSession?.role?.slug || authData?.role?.slug || currentUser?.role || '';
    const agentRoles = ['agent', 'supervisor', 'super-admin', 'admin'];
    const isAgent = agentRoles.includes(role.toLowerCase());

    if (!isAgent) {
      toast.error('Status changes are only available for agents');
      return;
    }

    // Check if status requires reason code
    if (status === 'Busy' || status === 'Do Not Disturb') {
      // Show BusyReasonModal
      setPendingStatus(status);
      setPendingStatusType(status === 'Do Not Disturb' ? 'Dnd' : 'Busy');
      setIsBusyReasonModalOpen(true);
      return;
    }

    // For other statuses, update directly
    await updateStatusWithReason(status, null);
  };

  const handleBusyReasonSelected = async (reason) => {
    console.log('Busy/DND reason selected:', reason);
    // reason object contains: { id, name, reporting, type }

    await updateStatusWithReason(pendingStatus, reason.id);

    // Clear pending state
    setPendingStatus(null);
    setPendingStatusType(null);
  };

  const handleBusyReasonModalClose = () => {
    setIsBusyReasonModalOpen(false);
    setPendingStatus(null);
    setPendingStatusType(null);
  };

  const updateStatusWithReason = async (status, reasonCodeId = null) => {
    try {
      setIsUpdatingStatus(true);

      // Get employee_id from user object
      const authData = authService.getCurrentUser();
      const employeeId = currentUser?.agent?.employee_id || authData?.agent?.employee_id;

      if (!employeeId) {
        toast.error('Cannot update status: Employee ID not found');
        console.error('❌ No employee ID available for status update');
        setIsUpdatingStatus(false);
        return;
      }

      // Map UI status to Mitel status
      const mitelStatus = status === 'Do Not Disturb' ? 'DoNotDisturb' : status;

      // Create the payload using the helper function
      const payload = createPresenceStatePayload(mitelStatus, reasonCodeId);

      // Update Mitel employee state using actual employee ID
      const response = await updateEmployeeStateDirect(employeeId, payload);

      if (response.success || response.status === 'success') {
        setAvailability(status);
        console.log('✅ Mitel status updated successfully:', status, reasonCodeId ? `with reason: ${reasonCodeId}` : '', 'for employee:', employeeId);

        if (reasonCodeId) {
          toast.success(`Status changed to ${status}`);
        }

        // Initialize WebRTC Softphone when status becomes Available
        if (status === 'Available' && !isWebRTCRegistered) {
          console.log('📞 Status is now Available, initializing WebRTC softphone...');
          try {
            await initializeWebRTC(employeeId);
            console.log('✅ WebRTC softphone initialized successfully');
            toast.success('Softphone connected and ready for calls');
          } catch (error) {
            console.error('❌ Failed to initialize WebRTC softphone:', error);
            toast.warning('Status updated but softphone connection failed. You may not be able to make/receive calls.');
          }
        }

        // Disconnect WebRTC when status is no longer Available
        if (status !== 'Available' && isWebRTCRegistered) {
          console.log('📞 Status changed from Available, disconnecting WebRTC softphone...');
          try {
            disconnectWebRTC();
            console.log('✅ WebRTC softphone disconnected');
          } catch (error) {
            console.error('❌ Failed to disconnect WebRTC softphone:', error);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Failed to update Mitel status:', error);
      toast.error('Failed to update status. Please try again.');
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

            {/* Availability Status Section - hidden when telephony is disabled */}
            {telephonyEnabled && (
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
                <span>Status</span>
                {isUpdatingStatus && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                )}
                {!isAgent && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <Icon name="Lock" size={10} />
                    <span>Agent only</span>
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {['Available', 'Busy', 'Do Not Disturb', 'Offline'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleAvailabilityChange(status)}
                    disabled={isUpdatingStatus || !isAgent}
                    title={!isAgent ? 'Status changes are only available for agents' : ''}
                    className={`w-full flex items-center space-x-3 px-2 py-1 rounded text-sm transition-colors duration-200 ${
                      availability === status
                        ? 'bg-primary text-primary-foreground'
                        : 'text-popover-foreground hover:bg-muted'
                    } ${(isUpdatingStatus || !isAgent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{status}</span>
                    {availability === status && (
                      <Icon name="Check" size={14} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              {!isAgent && (
                <div className="mt-2 text-xs text-muted-foreground italic">
                  Status management is available for agent roles only
                </div>
              )}
            </div>
            )}

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

      {/* Busy Reason Modal */}
      <BusyReasonModal
        isOpen={isBusyReasonModalOpen}
        statusType={pendingStatusType}
        onClose={handleBusyReasonModalClose}
        onSelectReason={handleBusyReasonSelected}
        employeeId={currentUser?.agent?.employee_id || JSON.parse(localStorage.getItem('user') || '{}')?.agent?.employee_id}
      />
    </div>
  );
};

export default UserProfileDropdown;