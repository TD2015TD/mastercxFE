import api from './api';

export interface Lookup {
  id: number;
  type: string;
  code: string;
  name_en: string;
  name_ms: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  customer_id: number;
  contact_type_id: number;
  value: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  customer?: {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'blocked';
  };
  contactType?: Lookup;
}

export interface ContactCreateUpdate {
  customer_id?: number;
  contact_type_id: number;
  value: string;
  is_primary?: boolean;
  notes?: string;
}

export interface ContactResponse<T = Contact> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ContactPaginatedResponse {
  data: Contact[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export const contactService = {
  /**
   * Get all contacts with optional filters
   * Can filter by customer_id, contact_type_id, is_primary, or search by value
   */
  getContacts: async (params?: {
    customer_id?: number;
    contact_type_id?: number;
    is_primary?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ContactPaginatedResponse> => {
    const response = await api.get('/contacts', { params });
    return response.data;
  },

  /**
   * Get contacts for a specific customer
   */
  getCustomerContacts: async (customerId: number, params?: {
    contact_type_id?: number;
    is_primary?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<ContactPaginatedResponse> => {
    const response = await api.get(`/customers/${customerId}/contacts`, { params });
    return response.data;
  },

  /**
   * Get a single contact by ID
   */
  getContact: async (id: number): Promise<ContactResponse<Contact>> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  /**
   * Create a new contact
   */
  createContact: async (data: ContactCreateUpdate): Promise<ContactResponse<Contact>> => {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  /**
   * Update an existing contact
   */
  updateContact: async (id: number, data: Partial<ContactCreateUpdate>): Promise<ContactResponse<Contact>> => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a contact
   */
  deleteContact: async (id: number): Promise<ContactResponse> => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  /**
   * Find customer by phone number (for incoming calls)
   * Returns the customer associated with the phone contact
   */
  findByPhone: async (phoneNumber: string): Promise<ContactResponse<{
    contact: Contact;
    customer: {
      id: number;
      name: string;
      email: string;
      status: string;
    };
  }>> => {
    const response = await api.get(`/contacts/find-by-phone/${encodeURIComponent(phoneNumber)}`);
    return response.data;
  },

  /**
   * Search for a contact by partial phone/email match
   * Useful for customer lookup when receiving calls
   */
  searchByValue: async (value: string, contactTypeId?: number): Promise<ContactPaginatedResponse> => {
    const params: any = { search: value };
    if (contactTypeId) {
      params.contact_type_id = contactTypeId;
    }
    return contactService.getContacts(params);
  },

  /**
   * Get primary contacts for a customer (one per type)
   */
  getPrimaryContacts: async (customerId: number): Promise<ContactPaginatedResponse> => {
    return contactService.getCustomerContacts(customerId, {
      is_primary: true
    });
  },
};
