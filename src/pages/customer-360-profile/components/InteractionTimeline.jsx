import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const InteractionTimeline = ({ interactions }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(id)) {
      newExpanded?.delete(id);
    } else {
      newExpanded?.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getChannelIcon = (channel) => {
    const iconMap = {
      'phone': 'Phone',
      'email': 'Mail',
      'chat': 'MessageSquare',
      'social': 'Share2',
      'in-person': 'User',
      'web': 'Globe'
    };
    return iconMap?.[channel] || 'MessageCircle';
  };

  const getChannelColor = (channel) => {
    const colorMap = {
      'phone': 'text-blue-600',
      'email': 'text-green-600',
      'chat': 'text-purple-600',
      'social': 'text-pink-600',
      'in-person': 'text-orange-600',
      'web': 'text-indigo-600'
    };
    return colorMap?.[channel] || 'text-muted-foreground';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'completed': 'bg-success text-success-foreground',
      'pending': 'bg-warning text-warning-foreground',
      'failed': 'bg-error text-error-foreground',
      'in-progress': 'bg-primary text-primary-foreground'
    };
    return statusColors?.[status] || 'bg-muted text-muted-foreground';
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date?.toLocaleDateString('en-MY', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date?.toLocaleTimeString('en-MY', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const filteredInteractions = interactions?.filter(interaction => {
    const matchesType = filterType === 'all' || interaction?.channel === filterType;
    const matchesSearch = searchTerm === '' || 
      interaction?.subject?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      interaction?.summary?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      interaction?.agent?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesType && matchesSearch;
  });

  const channelTypes = ['all', 'phone', 'email', 'chat', 'social', 'in-person', 'web'];

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">Interaction Timeline</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search interactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground text-sm w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              {channelTypes?.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Channels' : type?.charAt(0)?.toUpperCase() + type?.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className="p-6">
        {filteredInteractions?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No interactions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInteractions?.map((interaction, index) => {
              const { date, time } = formatDateTime(interaction?.dateTime);
              const isExpanded = expandedItems?.has(interaction?.id);
              
              return (
                <div key={interaction?.id} className="relative">
                  {/* Timeline Line */}
                  {index < filteredInteractions?.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-border"></div>
                  )}
                  <div className="flex gap-4">
                    {/* Timeline Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center ${getChannelColor(interaction?.channel)}`}>
                      <Icon name={getChannelIcon(interaction?.channel)} size={20} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/30 border border-border rounded-lg p-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground mb-1">
                              {interaction?.subject}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon name="User" size={12} />
                                {interaction?.agent}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Clock" size={12} />
                                {date} at {time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Timer" size={12} />
                                {interaction?.duration}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interaction?.status)}`}>
                              {interaction?.status}
                            </span>
                            <button
                              onClick={() => toggleExpanded(interaction?.id)}
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
                        
                        {/* Summary */}
                        <p className="text-sm text-muted-foreground mb-3">
                          {interaction?.summary}
                        </p>
                        
                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-border pt-3 mt-3 space-y-3">
                            {interaction?.details && (
                              <div>
                                <h4 className="text-xs font-medium text-foreground mb-2">Details</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {interaction?.details}
                                </p>
                              </div>
                            )}
                            
                            {interaction?.attachments && interaction?.attachments?.length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-foreground mb-2">Attachments</h4>
                                <div className="space-y-2">
                                  {interaction?.attachments?.map((attachment, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-background border border-border rounded">
                                      <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                                      <span className="text-sm text-foreground">{attachment?.name}</span>
                                      <span className="text-xs text-muted-foreground">({attachment?.size})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {interaction?.resolution && (
                              <div>
                                <h4 className="text-xs font-medium text-foreground mb-2">Resolution</h4>
                                <p className="text-sm text-muted-foreground">
                                  {interaction?.resolution}
                                </p>
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