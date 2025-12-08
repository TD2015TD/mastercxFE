import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { notificationService } from '../../../../services/notificationService';
import { languageService } from '../../../../services/languageService';

const RealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const locale = localStorage.getItem('preferred-language') || 'en';
        const translations = await languageService.getTranslations(locale);
        setTranslations(translations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };
    loadTranslations();
  }, []);  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value || key;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ 
        limit: 50 
      });
      
      if (response.success) {
        // Transform API data to component format
        const transformedNotifications = response.data.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: new Date(notification.created_at),
          priority: getPriorityFromLevel(notification.level),
          actionRequired: notification.type === 'sla_alert' || notification.type === 'agent_assistance',
          ticketId: notification.ticket_number,
          agent: 'System Generated', // Could be enhanced with actual agent data
          department: notification.department,
          read: notification.read,
          url: notification.url,
        }));
        
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityFromLevel = (level) => {
    const levelMap = {
      'critical': 'high',
      'warning': 'medium',
      'info': 'low'
    };
    return levelMap?.[level] || 'medium';
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'sla_breach': 'AlertTriangle',
      'sla_warning': 'Clock',
      'agent_assistance': 'UserPlus',
      'system_alert': 'Server',
      'workload_warning': 'TrendingUp'
    };
    return iconMap?.[type] || 'Bell';
  };

  const getNotificationColor = (priority) => {
    const colorMap = {
      'high': 'text-error bg-error/10 border-error/20',
      'medium': 'text-warning bg-warning/10 border-warning/20',
      'low': 'text-accent bg-accent/10 border-accent/20'
    };
    return colorMap?.[priority] || 'text-muted-foreground bg-muted border-border';
  };

  const getPriorityDot = (priority) => {
    const colorMap = {
      'high': 'bg-error',
      'medium': 'bg-warning',
      'low': 'bg-accent'
    };
    return colorMap?.[priority] || 'bg-muted-foreground';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleNotificationAction = (notification) => {
    if (notification?.ticketId) {
      console.log(`Navigating to ticket: ${notification?.ticketId}`);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev?.map(n => 
          n?.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const unreadCount = notifications?.filter(n => !n?.read)?.length;
  const displayNotifications = isExpanded ? notifications : notifications?.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-foreground">Real-time Alerts</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-error text-error-foreground text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
            </button>
            {notifications?.length > 0 && (
              <button
                onClick={clearAll}
                className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
                title="Clear all"
              >
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading && notifications?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Loader" size={32} className="text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayNotifications?.map((notification) => (
              <div
                key={notification?.id}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-sm ${
                  notification?.read ? 'opacity-60' : ''
                } ${getNotificationColor(notification?.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <Icon 
                      name={getNotificationIcon(notification?.type)} 
                      size={16} 
                      className={notification?.priority === 'high' ? 'text-error' : 
                                notification?.priority === 'medium' ? 'text-warning' : 'text-accent'}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{notification?.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification?.message}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{formatTimestamp(notification?.timestamp)}</span>
                          {notification?.agent && (
                            <>
                              <span>•</span>
                              <span>{notification?.agent}</span>
                            </>
                          )}
                          {notification?.department && (
                            <>
                              <span>•</span>
                              <span>{notification?.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <div className={`w-2 h-2 rounded-full ${getPriorityDot(notification?.priority)}`}></div>
                        {!notification?.read && (
                          <button
                            onClick={() => markAsRead(notification?.id)}
                            className="p-1 hover:bg-muted rounded transition-colors duration-200"
                            title="Mark as read"
                          >
                            <Icon name="Check" size={12} className="text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {notification?.actionRequired && (
                      <div className="mt-3 flex items-center space-x-2">
                        <button
                          onClick={() => handleNotificationAction(notification)}
                          className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors duration-200"
                        >
                          Take Action
                        </button>
                        {notification?.ticketId && (
                          <span className="text-xs text-muted-foreground">
                            Ticket: {notification?.ticketId}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {!isExpanded && notifications?.length > 3 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
              >
                View {notifications?.length - 3} more alerts
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeNotifications;