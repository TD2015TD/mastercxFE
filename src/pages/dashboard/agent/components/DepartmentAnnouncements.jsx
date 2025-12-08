import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const DepartmentAnnouncements = ({ announcements }) => {
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const priorityColors = {
    'high': 'border-l-error bg-error/5',
    'medium': 'border-l-warning bg-warning/5',
    'low': 'border-l-primary bg-primary/5',
    'info': 'border-l-accent bg-accent/5'
  };

  const priorityIcons = {
    'high': 'AlertTriangle',
    'medium': 'AlertCircle',
    'low': 'Info',
    'info': 'Bell'
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpanded = (id) => {
    setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
  };

  const markAsRead = (id) => {
    // In real implementation, this would update the backend
    console.log('Marking announcement as read:', id);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Department Announcements</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" iconName="Settings">
              Preferences
            </Button>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
        </div>
      </div>
      {/* Announcements List */}
      <div className="max-h-80 overflow-y-auto">
        {announcements?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No announcements</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {announcements?.map((announcement) => (
              <div
                key={announcement?.id}
                className={`p-4 border-l-4 ${priorityColors?.[announcement?.priority]} transition-colors duration-200`}
              >
                <div className="flex items-start space-x-3">
                  {/* Priority Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <Icon 
                      name={priorityIcons?.[announcement?.priority]} 
                      size={16} 
                      className={`${
                        announcement?.priority === 'high' ? 'text-error' :
                        announcement?.priority === 'medium' ? 'text-warning' :
                        announcement?.priority === 'low'? 'text-primary' : 'text-accent'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground">
                          {announcement?.title}
                          {!announcement?.isRead && (
                            <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block"></span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {announcement?.department}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(announcement?.publishedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {announcement?.isPinned && (
                          <Icon name="Pin" size={14} className="text-warning" />
                        )}
                        <button
                          onClick={() => toggleExpanded(announcement?.id)}
                          className="p-1 hover:bg-muted rounded transition-colors duration-200"
                        >
                          <Icon 
                            name={expandedAnnouncement === announcement?.id ? 'ChevronUp' : 'ChevronDown'} 
                            size={14} 
                            className="text-muted-foreground"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Preview or Full Content */}
                    <div className="text-sm text-foreground">
                      {expandedAnnouncement === announcement?.id ? (
                        <div className="space-y-2">
                          <p>{announcement?.content}</p>
                          
                          {announcement?.attachments && announcement?.attachments?.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Attachments:</h4>
                              <div className="space-y-1">
                                {announcement?.attachments?.map((attachment, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded">
                                    <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                                    <span className="text-xs text-foreground">{attachment?.name}</span>
                                    <Button variant="ghost" size="sm" iconName="Download">
                                      Download
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {announcement?.actionRequired && (
                            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded">
                              <div className="flex items-center space-x-2 mb-2">
                                <Icon name="AlertTriangle" size={14} className="text-warning" />
                                <span className="text-xs font-medium text-warning">Action Required</span>
                              </div>
                              <p className="text-xs text-foreground">{announcement?.actionRequired}</p>
                              <div className="mt-2">
                                <Button variant="outline" size="sm">
                                  Take Action
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="line-clamp-2">{announcement?.preview}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {!announcement?.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(announcement?.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" iconName="Share2">
                          Share
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Icon name="Eye" size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {announcement?.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" iconName="Archive">
            View Archive
          </Button>
          <Button variant="outline" size="sm" iconName="Settings">
            Notification Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnnouncements;