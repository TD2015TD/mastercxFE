import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../../services/ticketService';
import { contactService } from '../../../services/contactService';
import { getLookupsByType } from '../../../services/lookupService';
import categoryService from '../../../services/categoryService';
import { authService } from '../../../services/authService';
import { exportToCsv } from '../../../utils/exportCsv';
import { getColorClasses } from '../../../utils/colorUtils';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const TicketList = ({ filter = 'all' }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [channelOptions, setChannelOptions] = useState([]);
  const [customerContactsMap, setCustomerContactsMap] = useState({});
  const debounceTimer = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filter, statusFilter, priorityFilter, departmentFilter, categoryFilter, channelFilter, debouncedSearch, dateFrom, dateTo]);

  const loadLookups = async () => {
    try {
      const [statuses, priorities, departments, channels] = await Promise.all([
        getLookupsByType('ticket_status'),
        getLookupsByType('ticket_priority'),
        getLookupsByType('department'),
        getLookupsByType('channel'),
      ]);
      setStatusOptions(statuses);
      setPriorityOptions(priorities);
      setDepartmentOptions(departments);
      setChannelOptions(channels);
    } catch (error) {
      console.error('Error loading lookups:', error);
    }

    try {
      const catResponse = await categoryService.getCategories({ level: 1, is_active: true, roots_only: true, per_page: 100 });
      const cats = catResponse?.data || [];
      setCategoryOptions(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const params = buildQueryParams();
      const response = await ticketService.getTickets(params);

      if (response.success && response.data) {
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

  const buildQueryParams = (overrides = {}) => {
    const params = {};

    // Apply tab-level filter
    if (filter === 'my-tickets' && currentUser?.agent?.id) {
      params.assigned_to = currentUser.agent.id;
    } else if (filter === 'unassigned') {
      params.unassigned = 1;
    } else if (filter === 'escalated') {
      params.sla_breached = true;
    }

    if (statusFilter !== 'all') params.status = statusFilter;
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    if (departmentFilter !== 'all') params.department = departmentFilter;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (channelFilter !== 'all') params.channel = channelFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    return Object.assign(params, overrides);
  };

  useEffect(() => {
    const loadContactsForVisibleCustomers = async () => {
      const customerIds = Array.from(new Set(
        (tickets || [])
          .map((ticket) => ticket?.customer?.id)
          .filter(Boolean)
      ));

      if (customerIds.length === 0) {
        setCustomerContactsMap({});
        return;
      }

      try {
        const contactResults = await Promise.all(
          customerIds.map(async (customerId) => {
            const response = await contactService.getCustomerContacts(customerId, { per_page: 50 });
            return [customerId, response?.data || []];
          })
        );

        const nextMap = {};
        contactResults.forEach(([customerId, contacts]) => {
          nextMap[customerId] = contacts;
        });
        setCustomerContactsMap(nextMap);
      } catch (error) {
        console.error('Error loading contacts for ticket list:', error);
      }
    };

    loadContactsForVisibleCustomers();
  }, [tickets]);

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(p => p.code === priority);
    return getColorClasses(priorityOption?.color);
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.code === status);
    return getColorClasses(statusOption?.color);
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || departmentFilter !== 'all' || categoryFilter !== 'all' || channelFilter !== 'all' || searchTerm || dateFrom || dateTo;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setCategoryFilter('all');
    setChannelFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Build params identical to the list filters, but request all matching records
      const params = buildQueryParams({ per_page: 10000, page: 1 });

      const response = await ticketService.getTickets(params);
      let exportTickets = [];
      if (response && response.data) {
        exportTickets = response.data.data || response.data;
      }

      const rows = [
        ['Ticket ID', 'Case ID', 'Subject', 'Customer', 'Email', 'Priority', 'Status', 'Assigned To', 'Department', 'Category', 'Channel', 'Created At', 'Updated At'],
        ...((Array.isArray(exportTickets) ? exportTickets : []).map(t => [
          t.ticket_number,
          t.case_id || '',
          t.subject,
          t.customer?.name || '',
          t.customer?.email || '',
          t.priority,
          t.status,
          t.assigned_agent?.user?.name || t.assigned_agent?.employee_id || 'Unassigned',
          t.department || '',
          t.category || '',
          t.channel || '',
          t.created_at,
          t.updated_at,
        ]))
      ];

      exportToCsv(rows, 'tickets');
    } catch (error) {
      console.error('Error exporting tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        {/* Search + Clear */}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by Ticket ID, Case ID, subject, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={handleExport}
            disabled={tickets.length === 0}
            className="shrink-0"
          >
            Export
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={clearFilters}
              className="shrink-0 text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Filter selects + Date range */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'all', label: 'All Status' },
              ...statusOptions.map(s => ({ value: s.code, label: s.name }))
            ]}
            className="w-40"
          />
          <Select
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value)}
            options={[
              { value: 'all', label: 'All Priority' },
              ...priorityOptions.map(p => ({ value: p.code, label: p.name }))
            ]}
            className="w-40"
          />
          <Select
            value={departmentFilter}
            onChange={(value) => setDepartmentFilter(value)}
            options={[
              { value: 'all', label: 'All Department' },
              ...departmentOptions.map(d => ({ value: d.code, label: d.name }))
            ]}
            className="w-44"
          />
          <Select
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            options={[
              { value: 'all', label: 'All Category' },
              ...categoryOptions.map(c => ({ value: c.name, label: c.name }))
            ]}
            className="w-44"
          />
          <Select
            value={channelFilter}
            onChange={(value) => setChannelFilter(value)}
            options={[
              { value: 'all', label: 'All Channel' },
              ...channelOptions.map(ch => ({ value: ch.code, label: ch.name }))
            ]}
            className="w-40"
          />

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Icon name="Calendar" size={16} className="text-muted-foreground shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              title="From date"
            />
            <span className="text-muted-foreground text-sm">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              title="To date"
            />
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {tickets.length === 0 ? (
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
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/ticket-management/${ticket.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-foreground">{ticket.ticket_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.case_id ? (
                        <span className="font-mono text-sm text-foreground">{ticket.case_id}</span>
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
                      {ticket.customer?.id && (customerContactsMap[ticket.customer.id]?.length > 0) && (
                        <div className="mt-1">
                          {customerContactsMap[ticket.customer.id].slice(0, 2).map((contact) => (
                            <p key={contact.id} className="text-xs text-muted-foreground truncate">
                              {(contact.contactType?.name_en || contact.contactType?.name_ms || 'Contact')}: {contact.value}
                              {contact.is_primary ? ' (Primary)' : ''}
                            </p>
                          ))}
                          {customerContactsMap[ticket.customer.id].length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{customerContactsMap[ticket.customer.id].length - 2} more
                            </p>
                          )}
                        </div>
                      )}
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
