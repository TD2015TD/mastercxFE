import api from './api';

export interface TicketSequence {
  id: number;
  name: string;
  prefix: string;
  pattern: string;
  current_number: number;
  padding: number;
  reset_daily: boolean;
  reset_monthly: boolean;
  reset_yearly: boolean;
  is_active: boolean;
  description?: string;
  last_reset_date?: string;
  sample_output?: string;
  created_at: string;
  updated_at: string;
}

export interface SequencePreview {
  current_number: number;
  next_number: number;
  sample_output: string;
  pattern: string;
}

export const ticketSequenceService = {
  /**
   * Get all ticket number sequences
   */
  getSequences: async () => {
    const response = await api.get('/ticket-sequences');
    return response.data;
  },

  /**
   * Get a single sequence by ID
   */
  getSequence: async (id: number) => {
    const response = await api.get(`/ticket-sequences/${id}`);
    return response.data;
  },

  /**
   * Get sequence by name (useful for channel-specific sequences)
   * @param name - Sequence name (e.g., 'phone', 'email', 'web')
   */
  getSequenceByName: async (name: string) => {
    const response = await api.get('/ticket-sequences');
    const sequences = response.data.data;
    return sequences.find((seq: TicketSequence) => seq.name === name);
  },

  /**
   * Create a new ticket number sequence
   */
  createSequence: async (data: Partial<TicketSequence>) => {
    const response = await api.post('/ticket-sequences', data);
    return response.data;
  },

  /**
   * Update an existing sequence
   */
  updateSequence: async (id: number, data: Partial<TicketSequence>) => {
    const response = await api.put(`/ticket-sequences/${id}`, data);
    return response.data;
  },

  /**
   * Delete a sequence
   */
  deleteSequence: async (id: number) => {
    const response = await api.delete(`/ticket-sequences/${id}`);
    return response.data;
  },

  /**
   * Reset sequence counter
   */
  resetSequence: async (id: number) => {
    const response = await api.post(`/ticket-sequences/${id}/reset`);
    return response.data;
  },

  /**
   * Preview next ticket number
   */
  previewSequence: async (id: number): Promise<{ success: boolean; data: SequencePreview }> => {
    const response = await api.get(`/ticket-sequences/${id}/preview`);
    return response.data;
  },

  /**
   * Get active sequences grouped by channel
   */
  getChannelSequences: async () => {
    const response = await api.get('/ticket-sequences');
    const sequences = response.data.data;
    
    // Group sequences by common channel names
    return {
      phone: sequences.find((seq: TicketSequence) => seq.name.toLowerCase().includes('phone') && seq.is_active),
      email: sequences.find((seq: TicketSequence) => seq.name.toLowerCase().includes('email') && seq.is_active),
      web: sequences.find((seq: TicketSequence) => seq.name.toLowerCase().includes('web') && seq.is_active),
      chat: sequences.find((seq: TicketSequence) => seq.name.toLowerCase().includes('chat') && seq.is_active),
      walkIn: sequences.find((seq: TicketSequence) => seq.name.toLowerCase().includes('walk') && seq.is_active),
      default: sequences.find((seq: TicketSequence) => seq.name === 'default' && seq.is_active),
    };
  },
};
