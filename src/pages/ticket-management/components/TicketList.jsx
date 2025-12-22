import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../../services/ticketService';
import { getLookupsByType } from '../../../services/lookupService';
import { getColorClasses } from '../../../utils/colorUtils';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const TicketList = ({ filter = 'all' }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusOptions, setStatusOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);

  useEffect(() => {
    loadLookups();
    loadTickets();
  }, [filter, statusFilter, priorityFilter]);

  const loadLookups = async () => {
    try {
      const [statuses, priorities] = await Promise.all([
        getLookupsByType('ticket_status'),
        getLookupsByType('ticket_priority')
      ]);
      setStatusOptions(statuses);
      setPriorityOptions(priorities);
    } catch (error) {
      console.error('Error loading lookups:', error);
    }
  };

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const response = await ticketService.getTickets({
        filter,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined
      });
      
      if (response.success && response.data) {
        // API returns paginated data: response.data.data contains the tickets array
        const ticketsData = response.data.data || response.data;
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = Array.isArray(tickets) ? tickets.filter(ticket => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      ticket.ticket_number?.toLowerCase().includes(search) ||
      ticket.call_id?.toLowerCase().includes(search) ||
      ticket.subject?.toLowerCase().includes(search) ||
      ticket.customer?.name?.toLowerCase().includes(search)
    );
  }) : [];

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(p => p.code === priority);
    return getColorClasses(priorityOption?.color);
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.code === status);
    return getColorClasses(statusOption?.color);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search tickets by Ticket ID, Case ID, subject, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { value: 'all', label: 'All Status' },
            ...statusOptions.map(status => ({
              value: status.code,
              label: status.name
            }))
          ]}
          className="w-full md:w-48"
        />
        <Select
          value={priorityFilter}
          onChange={(value) => setPriorityFilter(value)}
          options={[
            { value: 'all', label: 'All Priority' },
            ...priorityOptions.map(priority => ({
              value: priority.code,
              label: priority.name
            }))
          ]}
          className="w-full md:w-48"
        />
      </div>

      {/* Ticket List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Case ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/ticket-management/${ticket.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-foreground">{ticket.ticket_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.call_id ? (
                        <span className="font-mono text-sm text-foreground">{ticket.call_id}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground max-w-xs truncate">{ticket.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{ticket.customer?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{ticket.customer?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {ticket.assigned_agent?.user?.name || ticket.assigned_agent?.employee_id || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        iconName="Eye"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ticket-management/${ticket.id}`);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
