import React, { useState, useMemo } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const ActiveTicketsQueue = ({ tickets, onTicketClick, onStatusUpdate, onPriorityFilter }) => {
  const [sortField, setSortField] = useState('slaRemaining');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState([]);

  const priorityColors = {
    'P1': 'bg-error text-error-foreground',
    'P2': 'bg-warning text-warning-foreground',
    'P3': 'bg-accent text-accent-foreground',
    'P4': 'bg-secondary text-secondary-foreground',
    'P5': 'bg-muted text-muted-foreground'
  };

  const statusColors = {
    'Open': 'bg-error/10 text-error border-error/20',
    'In Progress': 'bg-warning/10 text-warning border-warning/20',
    'On Hold': 'bg-muted text-muted-foreground border-border',
    'Pending': 'bg-accent/10 text-accent border-accent/20'
  };

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets;
    
    if (selectedPriority !== 'all') {
      filtered = tickets?.filter(ticket => ticket?.priority === selectedPriority);
    }

    return filtered?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];
      
      if (sortField === 'slaRemaining') {
        aValue = a?.slaRemaining;
        bValue = b?.slaRemaining;
      }
      
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
    onPriorityFilter(priority);
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
            <Button variant="outline" size="sm" iconName="Download">
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
          {['P1', 'P2', 'P3', 'P4', 'P5']?.map(priority => (
            <button
              key={priority}
              onClick={() => handlePriorityFilter(priority)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedPriority === priority 
                  ? priorityColors?.[priority]
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {priority}
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
                  onClick={() => handleSort('ticketNumber')}
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
                  onClick={() => handleSort('slaRemaining')}
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
            {filteredAndSortedTickets?.map((ticket) => (
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
                    onClick={() => onTicketClick(ticket?.id)}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {ticket?.ticketNumber}
                  </button>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors?.[ticket?.priority]}`}>
                    {ticket?.priority}
                  </span>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium text-foreground">{ticket?.customerName}</div>
                    <div className="text-sm text-muted-foreground">{ticket?.customerEmail}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="max-w-xs truncate text-foreground" title={ticket?.subject}>
                    {ticket?.subject}
                  </div>
                </td>
                <td className="p-4">
                  <select
                    value={ticket?.status}
                    onChange={(e) => onStatusUpdate(ticket?.id, e?.target?.value)}
                    className={`px-2 py-1 rounded text-xs font-medium border ${statusColors?.[ticket?.status]} bg-transparent`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Pending">Pending</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${getSlaUrgency(ticket?.slaRemaining)}`}>
                    {formatSlaTime(ticket?.slaRemaining)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={() => onTicketClick(ticket?.id)}
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
            ))}
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