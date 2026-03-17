import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TicketHeader = ({ ticket, liveTimeRemaining, onStatusChange, onTransfer, onClose }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      'P1': 'bg-red-100 text-red-800 border-red-200',
      'P2': 'bg-orange-100 text-orange-800 border-orange-200',
      'P3': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'P4': 'bg-blue-100 text-blue-800 border-blue-200',
      'P5': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors?.[priority] || colors?.['P3'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'On Hold': 'bg-orange-100 text-orange-800 border-orange-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors?.[status] || colors?.['Open'];
  };

  const getSLAColor = (slaStatus) => {
    const colors = {
      'On Track': 'text-green-600',
      'At Risk': 'text-yellow-600',
      'Breached': 'text-red-600'
    };
    return colors?.[slaStatus] || colors?.['On Track'];
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section - Ticket Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{ticket?.ticket_number}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(ticket?.priority)}`}>
              {ticket?.priority}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket?.status)}`}>
              {ticket?.status}
            </span>
          </div>
          
          <h2 className="text-lg font-medium text-foreground mb-2">{ticket?.subject}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="User" size={16} />
              <span>{ticket?.customer?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Building" size={16} />
              <span>{ticket?.department}</span>
            </div>
            {ticket?.channel && (
              <div className="flex items-center gap-1">
                <Icon name="Radio" size={16} />
                <span className="capitalize">{ticket.channel.replace('-', ' ')}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={16} />
              <span>Created: {new Date(ticket.created_at)?.toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* Right Section - SLA & Actions */}
        <div className="flex flex-col lg:items-end gap-4">
          {/* SLA Status */}
          <div className="bg-muted rounded-lg p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">SLA Status</span>
              <span className={`text-sm font-semibold ${
                ticket?.sla_breached || (liveTimeRemaining && liveTimeRemaining.isOverdue) ? 'text-red-600' : 'text-green-600'
              }`}>
                {ticket?.sla_breached || (liveTimeRemaining && liveTimeRemaining.isOverdue) ? 'Breached' : 'On Track'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={14} className="text-muted-foreground" />
              <span className={`text-sm ${
                liveTimeRemaining && liveTimeRemaining.isOverdue ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {liveTimeRemaining ? liveTimeRemaining.formatted : (ticket?.formatted_sla_remaining || 'N/A')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="ArrowUpDown"
              iconPosition="left"
              onClick={onStatusChange}
            >
              Update Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="ArrowRight"
              iconPosition="left"
              onClick={onTransfer}
            >
              Transfer
            </Button>
            {/* <Button
              variant="default"
              size="sm"
              iconName="Check"
              iconPosition="left"
              onClick={onClose}
            >
              Close Ticket
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketHeader;