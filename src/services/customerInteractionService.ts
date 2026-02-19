import api from './api';

export interface CustomerInteraction {
  id: number;
  customer_id: number;
  ticket_id?: number;
  agent_id?: number;
  interaction_type: 'call' | 'email' | 'chat' | 'sms' | 'meeting' | 'note';
  interaction_type_id?: number;
  channel: 'phone' | 'email' | 'chat' | 'web' | 'walk-in' | 'social_media';
  phone_number?: string;
  subject: string;
  description?: string;
  duration_minutes?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  notes?: string;
  metadata?: Record<string, unknown>;
  interaction_at: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  interactionTypeLookup?: {
    id: number;
    type: string;
    code: string;
    name_en: string;
    name_ms: string;
    icon?: string;
  };
  ticket?: {
    id: number;
    ticket_number: string;
    subject: string;
  };
  agent?: {
    id: number;
    user?: {
      name: string;
      email: string;
    };
  };
}

export const customerInteractionService = {
  // Get all customer interactions
  getInteractions: async (params?: {
    customer_id?: number;
    interaction_type?: string;
    channel?: string;
    agent_id?: number;
    start_date?: string;
    end_date?: string;
    recent_days?: number;
    per_page?: number;
    page?: number;
  }) => {
    const response = await api.get('/customer-interactions', { params });
    return response.data;
  },

  // Get single interaction
  getInteraction: async (id: number) => {
    const response = await api.get(`/customer-interactions/${id}`);
    return response.data;
  },

  // Create interaction
  createInteraction: async (data: Partial<CustomerInteraction>) => {
    const response = await api.post('/customer-interactions', data);
    return response.data;
  },

  // Update interaction
  updateInteraction: async (id: number, data: Partial<CustomerInteraction>) => {
    const response = await api.put(`/customer-interactions/${id}`, data);
    return response.data;
  },

  // Delete interaction
  deleteInteraction: async (id: number) => {
    const response = await api.delete(`/customer-interactions/${id}`);
    return response.data;
  },

  // Get recent interactions for agent
  getRecentInteractions: async (agentId?: number, days: number = 7) => {
    const params: Record<string, unknown> = {
      recent_days: days,
      per_page: 10,
    };
    if (agentId) {
      params.agent_id = agentId;
    }
    const response = await api.get('/customer-interactions', { params });
    // Handle paginated response from Laravel
    return {
      success: true,
      data: response.data.data || response.data, // Extract data array from pagination
      meta: response.data.meta || null,
    };
  },
};

export default customerInteractionService;
