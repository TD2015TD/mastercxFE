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
  status: 'active' | 'inactive' | 'suspended';
  availability: 'available' | 'busy' | 'away' | 'offline';
  skills?: string[];
  languages?: string[];
  max_concurrent_tickets?: number;
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

export interface AgentShift {
  date: string;
  type: string;
  start: string;
  end: string;
  duration_hours: number;
  break_minutes: number;
  is_off_day: boolean;
  is_active: boolean;
}

export interface AgentPerformance {
  date: string;
  tickets: {
    resolved: number;
    assigned: number;
    pending: number;
    reopened: number;
    daily_target: number;
    achievement_rate: string;
  };
  response_times: {
    first_response: string;
    resolution: string;
    average_response: string;
    handle_time: string;
  };
  quality: {
    sla_compliance: string;
    customer_satisfaction: number;
    satisfaction_responses: number;
    first_contact_resolution: string;
  };
  productivity: {
    total_interactions: number;
  };
}

export interface AgentCallStatistics {
  date: string;
  call_volume: {
    total: number;
    answered: number;
    missed: number;
    transferred: number;
    outbound: number;
  };
  duration: {
    total_talk_time: number;
    avg_call_duration: number;
    longest_call: number;
    shortest_call: number;
  };
  after_call_work: {
    total_acw_time: number;
    avg_acw_time: number;
  };
  availability: {
    available_time: number;
    busy_time: number;
    away_time: number;
    dnd_time: number;
    logged_in_time: number;
  };
  performance: {
    answer_rate: string;
    occupancy_rate: string;
    utilization_rate: string;
  };
}

export interface CreatePerformanceData {
  metric_date?: string;
  tickets_resolved?: number;
  tickets_assigned?: number;
  tickets_pending?: number;
  tickets_reopened?: number;
  daily_target?: number;
  avg_first_response_time?: number;
  avg_resolution_time?: number;
  avg_response_time?: number;
  avg_handle_time?: number;
  sla_compliance_rate?: number;
  customer_satisfaction_score?: number;
  customer_satisfaction_count?: number;
  first_contact_resolution_rate?: number;
}

export interface CreateCallStatisticsData {
  statistic_date?: string;
  total_calls?: number;
  answered_calls?: number;
  missed_calls?: number;
  transferred_calls?: number;
  outbound_calls?: number;
  total_talk_time?: number;
  avg_call_duration?: number;
  longest_call_duration?: number;
  shortest_call_duration?: number;
  total_acw_time?: number;
  avg_acw_time?: number;
  available_time?: number;
  busy_time?: number;
  away_time?: number;
  dnd_time?: number;
  logged_in_time?: number;
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

  // Get agent metrics (today's performance)
  getMetrics: async (id: number) => {
    const response = await api.get(`/agents/${id}/metrics`);
    return response.data;
  },

  // Mitel Integration
  getMitelState: async (id: number) => {
    const response = await api.get(`/agents/${id}/mitel/state`);
    return response.data;
  },

  updateMitelState: async (id: number, state: string, reason?: string) => {
    const response = await api.put(`/agents/${id}/mitel/state`, { state, reason });
    return response.data;
  },

  getMitelStatistics: async (id: number, date?: string) => {
    const response = await api.get(`/agents/${id}/mitel/statistics`, { 
      params: { date } 
    });
    return response.data;
  },

  // Shift Management
  getShifts: async (id: number, params?: { start_date?: string; end_date?: string; date?: string }) => {
    const response = await api.get(`/agents/${id}/shifts`, { params });
    return response.data;
  },

  createOrUpdateShift: async (id: number, data: {
    shift_date: string;
    shift_start?: string;
    shift_end?: string;
    shift_type?: string;
    break_duration?: number;
    is_off_day?: boolean;
    notes?: string;
  }) => {
    const response = await api.post(`/agents/${id}/shifts`, data);
    return response.data;
  },

  // Performance Metrics
  getPerformance: async (id: number, params?: { start_date?: string; end_date?: string; date?: string }) => {
    const response = await api.get(`/agents/${id}/performance`, { params });
    return response.data;
  },

  createOrUpdatePerformance: async (id: number, data: CreatePerformanceData) => {
    const response = await api.post(`/agents/${id}/performance`, data);
    return response.data;
  },

  // Call Statistics
  getCallStatistics: async (id: number, params?: { start_date?: string; end_date?: string; date?: string }) => {
    const response = await api.get(`/agents/${id}/call-statistics`, { params });
    return response.data;
  },

  createOrUpdateCallStatistics: async (id: number, data: CreateCallStatisticsData) => {
    const response = await api.post(`/agents/${id}/call-statistics`, data);
    return response.data;
  },

  // Get current agent (from JWT token)
  getCurrentAgent: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

