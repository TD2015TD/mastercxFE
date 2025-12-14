import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { customerInteractionService } from '../../../../services/customerInteractionService';
import { authService } from '../../../../services/authService';

const RecentInteractions = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [interactions, setInteractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Fetch recent interactions
  useEffect(() => {
    const fetchRecentInteractions = async () => {
      if (!currentUser?.agent?.id) return;

      try {
        setIsLoading(true);
        const response = await customerInteractionService.getRecentInteractions(
          currentUser.agent.id,
          7 // Last 7 days
        );

        if (response.success) {
          setInteractions(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching recent interactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentInteractions();

    // Refresh interactions every 3 minutes
    const interval = setInterval(fetchRecentInteractions, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser?.agent?.id]);

  const interactionTypes = {
    'call': { icon: 'Phone', color: 'text-primary', bgColor: 'bg-primary/10' },
    'chat': { icon: 'MessageSquare', color: 'text-accent', bgColor: 'bg-accent/10' },
    'email': { icon: 'Mail', color: 'text-warning', bgColor: 'bg-warning/10' },
  };

  const filteredInteractions = filter === 'all'
    ? interactions
    : interactions?.filter(interaction => interaction?.interaction_type === filter);

  const handleInteractionClick = (interaction) => {
    if (interaction?.ticket_id) {
      navigate(`/ticket-management/${interaction.ticket_id}`);
    }
  };

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

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-success bg-success/10';
      case 'neutral': return 'text-muted-foreground bg-muted';
      case 'negative': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSentimentLabel = (sentiment) => {
    if (!sentiment) return null;
    return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
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
        {isLoading && interactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin mx-auto mb-2 w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="text-sm text-muted-foreground">Loading interactions...</p>
          </div>
        ) : filteredInteractions?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="MessageSquare" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No interactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredInteractions?.map((interaction) => {
              const typeConfig = interactionTypes?.[interaction?.interaction_type];

              return (
                <div
                  key={interaction?.id}
                  className="p-4 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleInteractionClick(interaction)}
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
                            {interaction?.customer?.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {interaction?.customer?.email}
                          </p>
                        </div>
                        {interaction?.sentiment && (
                          <div className="flex items-center space-x-2 ml-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(interaction?.sentiment)}`}>
                              {getSentimentLabel(interaction?.sentiment)}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {interaction?.subject}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(interaction?.interaction_at || interaction?.created_at)}
                          </span>
                          {interaction?.ticket?.ticket_number && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-primary">
                                {interaction?.ticket?.ticket_number}
                              </span>
                            </>
                          )}
                        </div>

                        {interaction?.duration_minutes && (
                          <span className="text-xs text-muted-foreground">
                            {interaction?.duration_minutes} min
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-2 mt-2">
                        {interaction?.interaction_type === 'call' && (
                          <Button variant="ghost" size="sm" iconName="Phone">
                            Call Back
                          </Button>
                        )}
                        {interaction?.interaction_type === 'chat' && (
                          <Button variant="ghost" size="sm" iconName="MessageSquare">
                            Continue Chat
                          </Button>
                        )}
                        {interaction?.interaction_type === 'email' && (
                          <Button variant="ghost" size="sm" iconName="Reply">
                            Reply
                          </Button>
                        )}
                        {interaction?.ticket_id && (
                          <Button variant="ghost" size="sm" iconName="Eye">
                            View Ticket
                          </Button>
                        )}
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