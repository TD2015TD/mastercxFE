import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import api from '../../../services/api';

const InteractionTimeline = ({ customerId }) => {
  const [interactions, setInteractions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (customerId) {
      loadInteractions();
    }
  }, [customerId]);

  const loadInteractions = async () => {
    try {
      setIsLoading(true);

      const [interactionsRes, ticketsRes] = await Promise.allSettled([
        api.get('/customer-interactions', { params: { customer_id: customerId, per_page: 50 } }),
        api.get('/tickets', { params: { customer_id: customerId, per_page: 100 } }),
      ]);

      const rawInteractions = interactionsRes.status === 'fulfilled'
        ? (interactionsRes.value.data?.data || [])
        : [];

      // Transform tickets into interaction-like objects
      const ticketItems = ticketsRes.status === 'fulfilled'
        ? (ticketsRes.value.data?.data?.data || ticketsRes.value.data?.data || []).map(t => ({
            id: `ticket-${t.id}`,
            interaction_type: 'ticket',
            channel: t.channel || 'web',
            subject: `[${t.ticket_number}] ${t.subject}`,
            description: `Status: ${t.status}`,
            interaction_at: t.created_at,
            agent: t.agent || null,
            _isTicket: true,
            _ticketId: t.id,
            _ticketNumber: t.ticket_number,
            _ticketStatus: t.status,
          }))
        : [];

      const merged = [...rawInteractions, ...ticketItems].sort(
        (a, b) => new Date(b.interaction_at) - new Date(a.interaction_at)
      );

      setInteractions(merged);
    } catch (error) {
      console.error('Error loading interactions:', error);
      setInteractions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(id)) {
      newExpanded?.delete(id);
    } else {
      newExpanded?.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getChannelIcon = (channel, isTicket) => {
    if (isTicket) return 'Ticket';
    const iconMap = {
      'phone': 'Phone',
      'email': 'Mail',
      'chat': 'MessageSquare',
      'social_media': 'Share2',
      'walk-in': 'User',
      'web': 'Globe'
    };
    return iconMap[channel] || 'MessageCircle';
  };

  const getChannelColor = (channel) => {
    const colorMap = {
      'phone': 'text-blue-600',
      'email': 'text-green-600',
      'chat': 'text-purple-600',
      'social_media': 'text-pink-600',
      'walk-in': 'text-orange-600',
      'web': 'text-indigo-600'
    };
    return colorMap[channel] || 'text-muted-foreground';
  };

  const getTypeColor = (type) => {
    const colorMap = {
      'call': 'bg-blue-100 text-blue-700',
      'email': 'bg-green-100 text-green-700',
      'chat': 'bg-purple-100 text-purple-700',
      'sms': 'bg-yellow-100 text-yellow-700',
      'meeting': 'bg-orange-100 text-orange-700',
      'note': 'bg-gray-100 text-gray-700',
      'ticket': 'bg-indigo-100 text-indigo-700',
    };
    return colorMap[type] || 'bg-muted text-muted-foreground';
  };

  const getTicketStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    const s = status.toLowerCase();
    if (s === 'open' || s === 'new') return 'bg-blue-100 text-blue-700';
    if (s === 'in progress' || s === 'in_progress') return 'bg-yellow-100 text-yellow-700';
    if (s === 'resolved' || s === 'closed') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getSentimentIcon = (sentiment) => {
    const iconMap = {
      'positive': 'ThumbsUp',
      'neutral': 'Minus',
      'negative': 'ThumbsDown'
    };
    return iconMap[sentiment] || null;
  };

  const getSentimentColor = (sentiment) => {
    const colorMap = {
      'positive': 'text-green-600',
      'neutral': 'text-gray-600',
      'negative': 'text-red-600'
    };
    return colorMap[sentiment] || 'text-muted-foreground';
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const filteredInteractions = interactions.filter(interaction => {
    const matchesType = filterType === 'all'
      || (filterType === 'ticket' && interaction._isTicket)
      || (!interaction._isTicket && interaction.channel === filterType);
    const matchesSearch = searchTerm === '' ||
      interaction.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const channelTypes = ['all', 'phone', 'email', 'chat', 'social_media', 'walk-in', 'web', 'ticket'];

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icon name="MessageCircle" size={20} />
              Interaction Timeline
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search interactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground text-sm w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              {channelTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Channels' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading interactions...</p>
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No interactions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInteractions.map((interaction, index) => {
              const { date, time } = formatDateTime(interaction.interaction_at);
              const isExpanded = expandedItems.has(interaction.id);
              
              return (
                <div key={interaction.id} className="relative">
                  {/* Timeline Line */}
                  {index < filteredInteractions.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-border"></div>
                  )}
                  <div className="flex gap-4">
                    {/* Timeline Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center ${interaction._isTicket ? 'text-indigo-600' : getChannelColor(interaction.channel)}`}>
                      <Icon name={getChannelIcon(interaction.channel, interaction._isTicket)} size={20} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/30 border border-border rounded-lg p-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground mb-1">
                              {interaction.subject}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon name="User" size={12} />
                                {interaction.agent?.name || 'Unknown Agent'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={12} />
                                {date} at {time}
                              </span>
                              {interaction.duration_minutes > 0 && (
                                <span className="flex items-center gap-1">
                                  <Icon name="Timer" size={12} />
                                  {interaction.duration_minutes} min
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {interaction._isTicket ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTicketStatusColor(interaction._ticketStatus)}`}>
                                {interaction._ticketStatus}
                              </span>
                            ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(interaction.interaction_type)}`}>
                              {interaction.interaction_type}
                            </span>
                            )}
                            {interaction.sentiment && (
                              <span className={`flex items-center ${getSentimentColor(interaction.sentiment)}`}>
                                <Icon name={getSentimentIcon(interaction.sentiment)} size={14} />
                              </span>
                            )}
                            <button
                              onClick={() => toggleExpanded(interaction.id)}
                              className="p-1 rounded hover:bg-muted transition-colors duration-200"
                            >
                              <Icon 
                                name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
                                size={16} 
                                className="text-muted-foreground"
                              />
                            </button>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {interaction.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {interaction.description.length > 150 && !isExpanded
                              ? `${interaction.description.substring(0, 150)}...`
                              : interaction.description
                            }
                          </p>
                        )}
                        
                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-border pt-3 mt-3 space-y-3">
                            {interaction.notes && (
                              <div>
                                <h4 className="text-xs font-medium text-foreground mb-2">Notes</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {interaction.notes}
                                </p>
                              </div>
                            )}
                            
                            {interaction.ticket && (
                              <div>
                                <h4 className="text-xs font-medium text-foreground mb-2">Related Ticket</h4>
                                <div className="flex items-center gap-2 p-2 bg-background border border-border rounded">
                                  <Icon name="Ticket" size={14} className="text-primary" />
                                  <span className="text-sm text-foreground">
                                    {interaction.ticket.ticket_number}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    - {interaction.ticket.subject}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-foreground mb-2">Additional Information</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {Object.entries(interaction.metadata).map(([key, value]) => (
                                    <div key={key} className="flex gap-2">
                                      <span className="font-medium">{key}:</span>
                                      <span>{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
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
    </div>
  );
};

export default InteractionTimeline;