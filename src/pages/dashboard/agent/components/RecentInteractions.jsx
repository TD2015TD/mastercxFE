import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const RecentInteractions = ({ interactions, onInteractionClick }) => {
  const [filter, setFilter] = useState('all');

  const interactionTypes = {
    'call': { icon: 'Phone', color: 'text-primary', bgColor: 'bg-primary/10' },
    'chat': { icon: 'MessageSquare', color: 'text-accent', bgColor: 'bg-accent/10' },
    'email': { icon: 'Mail', color: 'text-warning', bgColor: 'bg-warning/10' },
    'ticket': { icon: 'Ticket', color: 'text-secondary', bgColor: 'bg-secondary/10' },
    'social': { icon: 'Share2', color: 'text-success', bgColor: 'bg-success/10' }
  };

  const filteredInteractions = filter === 'all' 
    ? interactions 
    : interactions?.filter(interaction => interaction?.type === filter);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp)?.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'escalated': return 'text-error bg-error/10';
      case 'in_progress': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'pending': return 'Pending';
      case 'escalated': return 'Escalated';
      case 'in_progress': return 'In Progress';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Interactions</h2>
          <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
              filter === 'all' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          {Object.keys(interactionTypes)?.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                filter === type 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={interactionTypes?.[type]?.icon} size={14} />
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Interactions List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredInteractions?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="MessageSquare" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No interactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredInteractions?.map((interaction) => {
              const typeConfig = interactionTypes?.[interaction?.type];
              
              return (
                <div
                  key={interaction?.id}
                  className="p-4 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                  onClick={() => onInteractionClick(interaction)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Type Icon */}
                    <div className={`p-2 rounded-lg ${typeConfig?.bgColor} flex-shrink-0`}>
                      <Icon name={typeConfig?.icon} size={16} className={typeConfig?.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {interaction?.customerName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {interaction?.customerEmail}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(interaction?.status)}`}>
                            {getStatusLabel(interaction?.status)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {interaction?.subject}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(interaction?.timestamp)}
                          </span>
                          {interaction?.ticketNumber && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-primary">
                                {interaction?.ticketNumber}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {interaction?.priority && (
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            interaction?.priority === 'P1' ? 'bg-error text-error-foreground' :
                            interaction?.priority === 'P2' ? 'bg-warning text-warning-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {interaction?.priority}
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-2 mt-2">
                        {interaction?.type === 'call' && (
                          <Button variant="ghost" size="sm" iconName="Phone">
                            Call Back
                          </Button>
                        )}
                        {interaction?.type === 'chat' && (
                          <Button variant="ghost" size="sm" iconName="MessageSquare">
                            Continue Chat
                          </Button>
                        )}
                        {interaction?.type === 'email' && (
                          <Button variant="ghost" size="sm" iconName="Reply">
                            Reply
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" iconName="Eye">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" fullWidth iconName="History">
          View All Interactions
        </Button>
      </div>
    </div>
  );
};

export default RecentInteractions;