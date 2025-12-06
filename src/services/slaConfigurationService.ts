import api from './api';

export interface SlaConfiguration {
  id?: number;
  department: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  duration_minutes: number;
  business_hours_only: boolean;
  pause_on_hold: boolean;
  pause_on_pending: boolean;
  escalation_threshold_percent: number | null;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SlaConfigurationsResponse {
  success: boolean;
  data?: SlaConfiguration[];
  message?: string;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface SlaConfigurationResponse {
  success: boolean;
  data?: SlaConfiguration;
  message?: string;
}

export interface GroupedSlaConfigurations {
  [department: string]: SlaConfiguration[];
}

export interface GroupedSlaResponse {
  success: boolean;
  data?: GroupedSlaConfigurations;
  message?: string;
}

/**
 * Get all SLA configurations with optional filters
 */
export const getSlaConfigurations = async (params?: {
  department?: string;
  priority?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}): Promise<SlaConfigurationsResponse> => {
  try {
    const response = await api.get('/sla-configurations', { params });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to fetch SLA configurations'
    };
  }
};

/**
 * Get a single SLA configuration by ID
 */
export const getSlaConfiguration = async (id: number): Promise<SlaConfigurationResponse> => {
  try {
    const response = await api.get(`/sla-configurations/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to fetch SLA configuration'
    };
  }
};

/**
 * Create a new SLA configuration
 */
export const createSlaConfiguration = async (data: Omit<SlaConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<SlaConfigurationResponse> => {
  try {
    const response = await api.post('/sla-configurations', data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const errors = err.response?.data?.errors;
    return {
      success: false,
      message: err.response?.data?.message || (errors ? Object.values(errors).flat().join(', ') : 'Failed to create SLA configuration')
    };
  }
};

/**
 * Update an existing SLA configuration
 */
export const updateSlaConfiguration = async (id: number, data: Partial<SlaConfiguration>): Promise<SlaConfigurationResponse> => {
  try {
    const response = await api.put(`/sla-configurations/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const errors = err.response?.data?.errors;
    return {
      success: false,
      message: err.response?.data?.message || (errors ? Object.values(errors).flat().join(', ') : 'Failed to update SLA configuration')
    };
  }
};

/**
 * Delete an SLA configuration
 */
export const deleteSlaConfiguration = async (id: number): Promise<SlaConfigurationResponse> => {
  try {
    const response = await api.delete(`/sla-configurations/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to delete SLA configuration'
    };
  }
};

/**
 * Get SLA for a specific department and priority
 */
export const getSlaForTicket = async (department: string, priority: string): Promise<SlaConfigurationResponse> => {
  try {
    const response = await api.get('/sla-configurations/get/by-ticket', {
      params: { department, priority }
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to fetch SLA for ticket'
    };
  }
};

/**
 * Get all SLA configurations grouped by department
 */
export const getSlaConfigurationsGrouped = async (): Promise<GroupedSlaResponse> => {
  try {
    const response = await api.get('/sla-configurations/grouped/by-department');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to fetch grouped SLA configurations'
    };
  }
};
