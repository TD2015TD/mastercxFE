import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import publicTicketService from '../../../services/publicTicketService';
import type { TrackedTicket } from '../../../services/publicTicketService';

const PublicTicketTrackForm: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TrackedTicket | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTicket(null);
    
    if (!ticketNumber || !email) {
      setError('Please enter both ticket number and email');
      return;
    }
    
    setIsTracking(true);
    
    try {
      const response = await publicTicketService.trackTicket({
        ticket_number: ticketNumber,
        email: email
      });
      
      if (response.success) {
        setTicket(response.data);
      }
    } catch (err: unknown) {
      console.error('Error tracking ticket:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Ticket not found or email does not match');
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Open': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'P1': 'text-red-600',
      'P2': 'text-orange-600',
      'P3': 'text-yellow-600',
      'P4': 'text-blue-600',
    };
    return priorityMap[priority] || 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
        <Icon name="Search" size={20} className="mr-2 text-primary" />
        Track Your Ticket
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleTrack} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Ticket Number"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="e.g., TKT-2024-001234"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={isTracking}
          iconName={isTracking ? undefined : 'Search'}
          iconPosition="left"
          className="w-full md:w-auto"
        >
          {isTracking ? 'Tracking...' : 'Track Status'}
        </Button>
      </form>

      {ticket && (
        <div className="border-t border-border pt-6">
          {/* Ticket Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-foreground">{ticket.subject}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Ticket #{ticket.ticket_number}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Priority</p>
                <p className={`text-lg font-semibold ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Department</p>
                <p className="text-lg font-semibold text-foreground">{ticket.assigned_department}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <p className="text-lg font-semibold text-foreground">{ticket.category}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-foreground mb-2">Description</h5>
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
              {ticket.description}
            </p>
          </div>

          {/* SLA Information */}
          {ticket.sla_due_at && (
            <div className={`mb-6 rounded-lg p-4 ${ticket.sla_breached ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {ticket.sla_breached ? 'SLA Breached' : 'SLA Due'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(ticket.sla_due_at)}
                  </p>
                </div>
                <Icon 
                  name={ticket.sla_breached ? 'AlertTriangle' : 'Clock'} 
                  size={24} 
                  className={ticket.sla_breached ? 'text-red-600' : 'text-blue-600'}
                />
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-foreground mb-4">Activity Timeline</h5>
            <div className="space-y-4">
              {ticket.communications.map((comm) => (
                <div key={comm.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    comm.type === 'agent' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon 
                      name={comm.type === 'agent' ? 'User' : 'Activity'} 
                      size={16} 
                      className={comm.type === 'agent' ? 'text-primary' : 'text-muted-foreground'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{comm.author}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comm.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comm.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Submitted:</span>
              <span className="text-foreground ml-2">{formatDate(ticket.submitted_at)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="text-foreground ml-2">{formatDate(ticket.last_updated)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTicketTrackForm;
