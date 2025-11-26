import api from './api';

export interface Agent {
  id: number;
  agent_code: string;
  user_id: number;
  employee_id: string;
  department: string;
  designation: string;
  mitel_agent_id?: string;
  mitel_extension?: string;
  mitel_queue_ids?: string[];
  status: 'active' | 'inactive' | 'on_leave';
  availability: 'available' | 'busy' | 'break' | 'offline';
  skills?: string[];
  languages?: string[];
  tickets_resolved_today: number;
  daily_target: number;
  avg_response_time?: number;
  sla_compliance_rate?: number;
  customer_satisfaction?: number;
  shift_start?: string;
  shift_end?: string;
  working_days?: string[];
  break_duration_minutes?: number;
  total_login_time_minutes?: number;
  last_activity_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface AgentMetrics {
  today: {
    tickets_resolved: number;
    daily_target: number;
    target_percentage: number;
    avg_response_time: number;
    login_time_minutes: number;
  };
  week: {
    tickets_resolved: number;
    sla_compliance_rate: number;
    customer_satisfaction: number;
  };
  month: {
    tickets_resolved: number;
    sla_compliance_rate: number;
    customer_satisfaction: number;
  };
}

export const agentService = {
  // Get all agents
  getAgents: async (params?: {
    department?: string;
    status?: string;
    availability?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
  }) => {
    const response = await api.get('/agents', { params });
    return response.data;
  },

  // Get single agent
  getAgent: async (id: number) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  // Create agent
  createAgent: async (data: Partial<Agent>) => {
    const response = await api.post('/agents', data);
    return response.data;
  },

  // Update agent
  updateAgent: async (id: number, data: Partial<Agent>) => {
    const response = await api.put(`/agents/${id}`, data);
    return response.data;
  },

  // Delete agent
  deleteAgent: async (id: number) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  // Update availability
  updateAvailability: async (id: number, availability: string) => {
    const response = await api.put(`/agents/${id}/availability`, { availability });
    return response.data;
  },

  // Get agent metrics
  getMetrics: async (id: number) => {
    const response = await api.get(`/agents/${id}/metrics`);
    return response.data;
  },

  // Get current agent (from JWT token)
  getCurrentAgent: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
