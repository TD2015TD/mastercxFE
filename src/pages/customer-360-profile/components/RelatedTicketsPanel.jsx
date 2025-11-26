import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RelatedTicketsPanel = ({ tickets }) => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const getStatusColor = (status) => {
    const statusColors = {
      'Open': 'bg-error text-error-foreground',
      'In Progress': 'bg-primary text-primary-foreground',
      'On Hold': 'bg-warning text-warning-foreground',
      'Resolved': 'bg-success text-success-foreground',
      'Closed': 'bg-muted text-muted-foreground'
    };
    return statusColors?.[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'P1': 'text-red-600',
      'P2': 'text-orange-600',
      'P3': 'text-yellow-600',
      'P4': 'text-blue-600',
      'P5': 'text-gray-600'
    };
    return priorityColors?.[priority] || 'text-muted-foreground';
  };

  const getSLAStatus = (slaPercentage) => {
    if (slaPercentage >= 90) return { color: 'text-success', icon: 'CheckCircle' };
    if (slaPercentage >= 70) return { color: 'text-warning', icon: 'AlertTriangle' };
    return { color: 'text-error', icon: 'XCircle' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredAndSortedTickets = tickets?.filter(ticket => filterStatus === 'all' || ticket?.status === filterStatus)?.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'oldest':
          return new Date(a.createdDate) - new Date(b.createdDate);
        case 'priority':
          return a?.priority?.localeCompare(b?.priority);
        case 'status':
          return a?.status?.localeCompare(b?.status);
        default:
          return 0;
      }
    });

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket-management?id=${ticketId}`);
  };

  const statusOptions = ['all', 'Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Related Tickets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {tickets?.length} total tickets
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              {statusOptions?.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status}
                </option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              {sortOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Tickets List */}
      <div className="p-6">
        {filteredAndSortedTickets?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Ticket" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTickets?.map((ticket) => {
              const slaStatus = getSLAStatus(ticket?.slaPercentage);
              const daysAgo = calculateDaysAgo(ticket?.createdDate);
              
              return (
                <div
                  key={ticket?.id}
                  onClick={() => handleTicketClick(ticket?.id)}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                >
                  {/* Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          #{ticket?.id}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket?.status)}`}>
                          {ticket?.status}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                          {ticket?.priority}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {ticket?.subject}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Icon 
                        name={slaStatus?.icon} 
                        size={16} 
                        className={slaStatus?.color}
                      />
                      <span className={`text-xs font-medium ${slaStatus?.color}`}>
                        {ticket?.slaPercentage}%
                      </span>
                    </div>
                  </div>
                  {/* Ticket Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={12} />
                      <span>Assigned to: {ticket?.assignedAgent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Building" size={12} />
                      <span>Department: {ticket?.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={12} />
                      <span>Created: {formatDate(ticket?.createdDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={12} />
                      <span>{daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}</span>
                    </div>
                  </div>
                  {/* Category Tags */}
                  {ticket?.categories && ticket?.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {ticket?.categories?.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* View All Button */}
        {tickets?.length > 5 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              iconName="ExternalLink"
              iconPosition="right"
              onClick={() => navigate('/ticket-management')}
            >
              View All Tickets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedTicketsPanel;