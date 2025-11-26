import api from './api';

export interface Ticket {
  id: number;
  ticket_number: string;
  customer_id: number;
  assigned_to?: number;
  created_by?: number;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  department: string;
  category: string;
  sub_category?: string;
  subject: string;
  description: string;
  urgency?: 'Low' | 'Medium' | 'High' | 'Critical';
  impact?: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Pending' | 'On Hold' | 'Resolved' | 'Closed' | 'Cancelled';
  resolution_notes?: string;
  sla_duration_minutes?: number;
  sla_due_at?: string;
  sla_breached: boolean;
  sla_remaining_minutes?: number;
  formatted_sla_remaining?: string;
  is_overdue?: boolean;
  first_response_at?: string;
  first_response_time_minutes?: number;
  resolution_time_minutes?: number;
  channel: 'phone' | 'email' | 'chat' | 'web' | 'walk-in';
  source?: string;
  customer_rating?: number;
  customer_feedback?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
  reopened_count: number;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    id_type: string;
    id_no: string;
  };
  assignedAgent?: {
    id: number;
    agent_code: string;
    user_id: number;
    department: string;
    user?: {
      name: string;
      email: string;
    };
  };
  creator?: {
    id: number;
    agent_code: string;
    user?: {
      name: string;
    };
  };
}

export interface TicketStatistics {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  sla_breached: number;
  sla_compliance_rate: number;
  by_priority: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  avg_resolution_time_minutes: number;
}

export const ticketService = {
  // Get all tickets
  getTickets: async (params?: {
    priority?: string;
    status?: string;
    department?: string;
    assigned_to?: number;
    customer_id?: number;
    sla_breached?: boolean;
    category?: string;
    channel?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  // Get single ticket
  getTicket: async (id: number) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Create ticket
  createTicket: async (data: Partial<Ticket>) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id: number, data: Partial<Ticket>) => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id: number) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },

  // Assign ticket to agent
  assignTicket: async (id: number, agentId: number) => {
    const response = await api.put(`/tickets/${id}/assign`, { agent_id: agentId });
    return response.data;
  },

  // Update ticket status
  updateStatus: async (id: number, status: string, notes?: string) => {
    const response = await api.put(`/tickets/${id}/status`, { status, notes });
    return response.data;
  },

  // Resolve ticket
  resolveTicket: async (id: number, resolutionNotes?: string) => {
    const response = await api.post(`/tickets/${id}/resolve`, { resolution_notes: resolutionNotes });
    return response.data;
  },

  // Close ticket
  closeTicket: async (id: number) => {
    const response = await api.post(`/tickets/${id}/close`);
    return response.data;
  },

  // Reopen ticket
  reopenTicket: async (id: number) => {
    const response = await api.post(`/tickets/${id}/reopen`);
    return response.data;
  },

  // Record first response
  recordResponse: async (id: number) => {
    const response = await api.post(`/tickets/${id}/response`);
    return response.data;
  },

  // Get ticket statistics
  getStatistics: async (params?: {
    start_date?: string;
    end_date?: string;
    department?: string;
  }) => {
    const response = await api.get('/tickets/statistics/summary', { params });
    return response.data;
  },
};
