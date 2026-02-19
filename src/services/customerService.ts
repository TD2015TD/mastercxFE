import api from './api';

export interface Customer {
  id: number;
  name: string;
  email: string;
  id_type: 'MyKad' | 'MyTentera' | 'MyPolis' | 'MyPR' | 'Passport';
  id_no: string;
  formatted_id?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  customer_type: 'individual' | 'business';
  business_registration_no?: string;
  preferred_language: 'en' | 'ms' | 'zh' | 'ta';
  status: 'active' | 'inactive' | 'blocked';
  total_tickets: number;
  resolved_tickets: number;
  resolution_rate?: number;
  open_tickets_count?: number;
  satisfaction_rating?: string;
  last_contact_at?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerStatistics {
  total_tickets: number;
  resolved_tickets: number;
  open_tickets: number;
  resolution_rate: number;
  satisfaction_rating?: string;
  last_contact_at?: string;
}

export interface CustomerNote {
  id: number;
  customer_id: number;
  created_by: number;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export const customerService = {
  // Get all customers
  getCustomers: async (params?: {
    customer_type?: string;
    status?: string;
    id_type?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
    with_tickets?: boolean;
  }) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  // Get single customer
  getCustomer: async (id: number) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Create customer
  createCustomer: async (data: Partial<Customer>) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: number, data: Partial<Customer>) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: number) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Search customer
  searchCustomer: async (params: { email?: string; id_no?: string }) => {
    const response = await api.post('/customers/search', params);
    return response.data;
  },

  // Get customer statistics
  getStatistics: async (id: number) => {
    const response = await api.get(`/customers/${id}/statistics`);
    return response.data;
  },

  // Get customer notes
  getNotes: async (customerId: number) => {
    const response = await api.get(`/customers/${customerId}/notes`);
    return response.data;
  },

  // Create customer note
  createNote: async (customerId: number, data: { content: string; is_pinned?: boolean }) => {
    const response = await api.post(`/customers/${customerId}/notes`, data);
    return response.data;
  },

  // Update customer note
  updateNote: async (customerId: number, noteId: number, data: { content?: string; is_pinned?: boolean }) => {
    const response = await api.put(`/customers/${customerId}/notes/${noteId}`, data);
    return response.data;
  },

  // Delete customer note
  deleteNote: async (customerId: number, noteId: number) => {
    const response = await api.delete(`/customers/${customerId}/notes/${noteId}`);
    return response.data;
  },
};
