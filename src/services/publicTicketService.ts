import publicApi from './publicApi';

export interface PublicTicketSubmission {
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_company?: string;
  customer_id_number?: string;
  attachments?: File[];
}

export interface PublicTicketTrack {
  ticket_number: string;
  email: string;
}

export interface TicketCommunication {
  id: number;
  type: 'system' | 'agent';
  message: string;
  author: string;
  timestamp: string;
}

export interface TrackedTicket {
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assigned_department: string;
  last_updated: string;
  submitted_at: string;
  estimated_resolution: string;
  sla_due_at: string | null;
  sla_remaining_minutes: number | null;
  sla_breached: boolean;
  communications: TicketCommunication[];
}

export const publicTicketService = {
  /**
   * Submit a new ticket (public - no authentication required)
   */
  async submitTicket(data: PublicTicketSubmission) {
    const formData = new FormData();
    
    formData.append('category', data.category);
    if (data.subcategory) formData.append('subcategory', data.subcategory);
    formData.append('priority', data.priority);
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('customer_name', data.customer_name);
    formData.append('customer_email', data.customer_email);
    if (data.customer_phone) formData.append('customer_phone', data.customer_phone);
    if (data.customer_company) formData.append('customer_company', data.customer_company);
    if (data.customer_id_number) formData.append('customer_id_number', data.customer_id_number);
    
    // Attach files if provided
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments[]', file);
      });
    }
    
    const response = await publicApi.post('/public/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Track ticket status by ticket number (requires email verification)
   */
  async trackTicket(data: PublicTicketTrack) {
    const response = await publicApi.post('/public/tickets/track', data);
    return response.data;
  },

  /**
   * View ticket details (requires email verification)
   */
  async viewTicket(ticketNumber: string, email: string) {
    const response = await publicApi.get(`/public/tickets/${ticketNumber}`, {
      params: { email },
    });
    return response.data;
  },

  /**
   * Upload attachment to existing ticket
   */
  async uploadAttachment(ticketNumber: string, email: string, file: File) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);
    
    const response = await publicApi.post(`/public/tickets/${ticketNumber}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default publicTicketService;
