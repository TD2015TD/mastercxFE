import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import notificationService from '../../services/notificationService';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications({ limit: 50 });
      if (response?.success) {
        setNotifications(response?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(pollInterval);
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

  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  const getNotificationIcon = (type) => {
    const iconMap = {
      'sla_alert': 'AlertTriangle',
      'agent_assistance': 'UserPlus',
      'system_alert': 'Settings',
      'ticket_assigned': 'UserPlus',
      'ticket_escalated': 'AlertCircle',
      'workload_warning': 'AlertTriangle'
    };
    return iconMap?.[type] || 'Bell';
  };

  const getNotificationColor = (level) => {
    if (level === 'critical') {
      return 'text-error';
    }
    if (level === 'warning') {
      return 'text-warning';
    }
    return 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diff = now - notificationDate;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = async (notification) => {
    // Navigate if URL is provided
    if (notification?.url) {
      navigate(notification?.url);
    } else if (notification?.ticket_id) {
      // Navigate to ticket if ticket_id is present
      navigate(`/ticket-management?id=${notification?.ticket_number || notification?.ticket_id}`);
    }
    
    // Mark as read if unread
    if (!notification?.read) {
      await markAsRead(notification?.id);
    }
    setIsOpen(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev?.map(n => 
          n?.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev?.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {isLoading ? (
          <div className="animate-spin w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full"></div>
        ) : (
          <Icon name="Bell" size={20} className="text-muted-foreground" />
        )}
        {unreadCount > 0 && !isLoading && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-popover-foreground">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            {notifications?.length > 0 && (
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications?.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin mx-auto mb-2 w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications?.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications?.map((notification) => (
                  <button
                    key={notification?.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start space-x-3 px-4 py-3 hover:bg-muted transition-colors duration-200 text-left ${
                      !notification?.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 mt-0.5 ${getNotificationColor(notification?.level)}`}>
                      <Icon name={getNotificationIcon(notification?.type)} size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium ${
                          !notification?.read ? 'text-popover-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification?.title}
                        </p>
                        {!notification?.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification?.message}
                      </p>
                      {notification?.ticket_number && (
                        <p className="text-xs text-primary mt-1">
                          Ticket: {notification?.ticket_number}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification?.created_at || notification?.timestamp)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="border-t border-border px-4 py-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors duration-200 py-1"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;