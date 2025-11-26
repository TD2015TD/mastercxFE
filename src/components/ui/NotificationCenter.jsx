import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const mockNotifications = [
    {
      id: 1,
      type: 'sla_warning',
      title: 'SLA Breach Warning',
      message: 'Ticket #TK-2024-1028 will breach SLA in 15 minutes',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      priority: 'high',
      actionUrl: '/ticket-management?id=TK-2024-1028'
    },
    {
      id: 2,
      type: 'assignment',
      title: 'New Ticket Assigned',
      message: 'Ticket #TK-2024-1029 has been assigned to you',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      priority: 'medium',
      actionUrl: '/ticket-management?id=TK-2024-1029'
    },
    {
      id: 3,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance window: Tonight 11 PM - 2 AM',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low',
      actionUrl: null
    },
    {
      id: 4,
      type: 'approval',
      title: 'Escalation Approved',
      message: 'Your escalation request for TK-2024-1025 has been approved',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      priority: 'medium',
      actionUrl: '/ticket-management?id=TK-2024-1025'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
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

  const unreadCount = notifications?.filter(n => !n?.isRead)?.length;

  const getNotificationIcon = (type) => {
    const iconMap = {
      'sla_warning': 'AlertTriangle',
      'assignment': 'UserPlus',
      'system': 'Settings',
      'approval': 'CheckCircle',
      'message': 'MessageSquare'
    };
    return iconMap?.[type] || 'Bell';
  };

  const getNotificationColor = (type, priority) => {
    if (type === 'sla_warning' || priority === 'high') {
      return 'text-error';
    }
    if (priority === 'medium') {
      return 'text-warning';
    }
    return 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification) => {
    if (notification?.actionUrl) {
      window.location.href = notification?.actionUrl;
    }
    
    if (!notification?.isRead) {
      markAsRead(notification?.id);
    }
    setIsOpen(false);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev?.map(n => 
        n?.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev?.map(n => ({ ...n, isRead: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Icon name="Bell" size={20} className="text-muted-foreground" />
        {unreadCount > 0 && (
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
            {notifications?.length === 0 ? (
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
                      !notification?.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 mt-0.5 ${getNotificationColor(notification?.type, notification?.priority)}`}>
                      <Icon name={getNotificationIcon(notification?.type)} size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium ${
                          !notification?.isRead ? 'text-popover-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification?.title}
                        </p>
                        {!notification?.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification?.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification?.timestamp)}
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