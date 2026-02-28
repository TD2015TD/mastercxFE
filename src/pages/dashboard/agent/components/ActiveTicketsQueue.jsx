import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { ticketService } from '../../../../services/ticketService';
import { authService } from '../../../../services/authService';
import { getPriorities, getTicketStatuses } from '../../../../services/lookupService';
import { exportToCsv } from '../../../../utils/exportCsv';

const ActiveTicketsQueue = ({ fullView = false }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState('sla_remaining_minutes');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [availablePriorities, setAvailablePriorities] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);

  // Fetch priorities and statuses from Lookup API
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [priorities, statuses] = await Promise.all([
          getPriorities(),
          getTicketStatuses()
        ]);
        setAvailablePriorities(priorities || []);
        setAvailableStatuses(statuses || []);
      } catch (error) {
        console.error('Error fetching lookups:', error);
      }
    };

    fetchLookups();
  }, []);

  // Fetch active tickets for the agent
  useEffect(() => {
    const fetchActiveTickets = async () => {
      // Check if currentUser is set AND statuses are available
      if (!currentUser?.agent?.id || availableStatuses.length === 0) return;

      // Define the status codes that represent 'active' tickets in this queue
      // This array should ideally be configurable or derived from a status property (e.g., is_active)
      const desiredActiveCodes = ['Open', 'In Progress', 'Pending', 'On Hold'];

      // Dynamically filter and map the available statuses to get the active codes
      const activeStatusCodes = availableStatuses
        .filter(status => desiredActiveCodes.includes(status.code))
        .map(status => status.code);
        
      if (activeStatusCodes.length === 0) {
          console.warn('No active status codes found in lookups. Cannot fetch tickets.');
          return;
      }

      try {
        setIsLoading(true);
        const response = await ticketService.getTickets({
          assigned_to: currentUser.agent.id,
          // 👇 FIXED: Using the dynamically generated status codes
          status: activeStatusCodes.join(','),
          per_page: fullView ? 50 : 10,
          sort_by: 'sla_remaining_minutes',
          sort_order: 'asc'
        });

        if (response.success) {
          // Handle paginated response - tickets are in response.data.data
          const ticketsData = response.data?.data || [];
          setTickets(ticketsData);
        }
      } catch (error) {
        console.error('Error fetching active tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveTickets();

    // Refresh tickets every 2 minutes
    const interval = setInterval(fetchActiveTickets, 2 * 60 * 1000);

    return () => clearInterval(interval);
    // 👇 FIXED: Added availableStatuses to the dependency array
  }, [currentUser?.agent?.id, fullView, availableStatuses]);

  // Helper function to get priority color class from hex color
  const getPriorityColorClass = (color) => {
    if (!color) return 'bg-muted text-muted-foreground';
    return `text-white`;
  };

  // Helper function to get priority lookup by code
  const getPriorityLookup = (code) => {
    return availablePriorities.find(p => p.code === code);
  };

  // Helper function to get status lookup by code
  const getStatusLookup = (code) => {
    return availableStatuses.find(s => s.code === code);
  };

  // Helper function to get status color class
  const getStatusColorClass = (color) => {
    if (!color) return 'bg-muted text-muted-foreground border-border';
    return 'border-opacity-20';
  };

  const filteredAndSortedTickets = useMemo(() => {
    // Ensure tickets is always an array
    if (!Array.isArray(tickets)) return [];

    let filtered = tickets;

    if (selectedPriority !== 'all') {
      filtered = tickets.filter(ticket => ticket?.priority === selectedPriority);
    }

    // Create a copy before sorting to avoid mutating the original array
    return [...filtered].sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      // Handle null/undefined values
      if (aValue == null) aValue = 0;
      if (bValue == null) bValue = 0;

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [tickets, selectedPriority, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePriorityFilter = (priority) => {
    setSelectedPriority(priority);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket-management/${ticketId}`);
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await ticketService.updateStatus(ticketId, newStatus);
      if (response.success) {
        // Update local state
        setTickets(prev =>
          prev.map(ticket =>
            ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
          )
        );
        toast.success('Ticket status updated successfully');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleTicketSelect = (ticketId) => {
    setSelectedTickets(prev => 
      prev?.includes(ticketId) 
        ? prev?.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets?.length === filteredAndSortedTickets?.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredAndSortedTickets?.map(t => t?.id));
    }
  };

  const formatSlaTime = (minutes) => {
    if (minutes <= 0) return 'Overdue';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSlaUrgency = (minutes) => {
    if (minutes <= 0) return 'text-error';
    if (minutes <= 30) return 'text-warning';
    return 'text-foreground';
  };

  const handleExport = () => {
    const rows = [
      ['Ticket ID', 'Subject', 'Status', 'Priority', 'SLA Remaining (min)', 'Created At'],
      ...tickets.map(t => [
        t.ticket_number || t.id,
        t.subject || t.title,
        t.status,
        t.priority,
        t.sla_remaining_minutes ?? '',
        t.created_at
      ])
    ];
    exportToCsv(rows, 'active-tickets-queue');
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Active Tickets Queue</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Filter">
              Filter
            </Button>
            <Button variant="outline" size="sm" iconName="Download" onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>

        {/* Priority Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Priority:</span>
          <button
            onClick={() => handlePriorityFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
              selectedPriority === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {availablePriorities.map(priority => (
            <button
              key={priority.id}
              onClick={() => handlePriorityFilter(priority.code)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedPriority === priority.code
                  ? getPriorityColorClass(priority.color)
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              style={selectedPriority === priority.code && priority.color ? { backgroundColor: priority.color } : {}}
            >
              {priority.name}
            </button>
          ))}
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedTickets?.length === filteredAndSortedTickets?.length && filteredAndSortedTickets?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('ticket_number')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Ticket #</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Priority</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Subject</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('sla_remaining_minutes')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>SLA Remaining</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && tickets.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center">
                  <div className="animate-spin mx-auto mb-2 w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-sm text-muted-foreground">Loading tickets...</p>
                </td>
              </tr>
            ) : filteredAndSortedTickets?.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center">
                  <Icon name="Inbox" size={48} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active tickets assigned</p>
                </td>
              </tr>
            ) : (
              filteredAndSortedTickets?.map((ticket) => (
                <tr key={ticket?.id} className="border-b border-border hover:bg-muted/30 transition-colors duration-200">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedTickets?.includes(ticket?.id)}
                      onChange={() => handleTicketSelect(ticket?.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTicketClick(ticket?.id)}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      {ticket?.ticket_number}
                    </button>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const priorityLookup = getPriorityLookup(ticket?.priority);
                      return (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColorClass(priorityLookup?.color)}`}
                          style={priorityLookup?.color ? { backgroundColor: priorityLookup.color } : {}}
                        >
                          {priorityLookup?.name || ticket?.priority}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{ticket?.customer?.name}</div>
                      <div className="text-sm text-muted-foreground">{ticket?.customer?.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-xs truncate text-foreground" title={ticket?.subject}>
                      {ticket?.subject}
                    </div>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const statusLookup = getStatusLookup(ticket?.status);
                      return (
                        <select
                          value={ticket?.status}
                          onChange={(e) => handleStatusUpdate(ticket?.id, e?.target?.value)}
                          className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColorClass(statusLookup?.color)} bg-transparent`}
                          style={statusLookup?.color ? {
                            backgroundColor: `${statusLookup.color}15`,
                            borderColor: `${statusLookup.color}40`,
                            color: statusLookup.color
                          } : {}}
                        >
                          {availableStatuses.map(status => (
                            <option key={status.id} value={status.code}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getSlaUrgency(ticket?.sla_remaining_minutes || 0)}`}>
                      {ticket?.formatted_sla_remaining || formatSlaTime(ticket?.sla_remaining_minutes || 0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        onClick={() => handleTicketClick(ticket?.id)}
                      >
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="MessageSquare"
                      >
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Bulk Actions */}
      {selectedTickets?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedTickets?.length} ticket(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Bulk Assign
              </Button>
              <Button variant="outline" size="sm">
                Update Status
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTicketsQueue;