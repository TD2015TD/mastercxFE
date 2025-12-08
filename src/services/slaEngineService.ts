import api from './api';

export interface SlaEngineSettings {
  id?: number;
  business_hours_enabled: boolean;
  business_hours_start: string;
  business_hours_end: string;
  timezone: string;
  working_days: string[];
  escalation_enabled: boolean;
  default_escalation_threshold: number;
  notify_agent: boolean;
  notify_supervisor: boolean;
  notify_manager: boolean;
  pause_on_hold: boolean;
  pause_on_pending: boolean;
  pause_on_awaiting_customer: boolean;
  auto_escalate_on_breach: boolean;
  escalation_delay_minutes: number;
  updated_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SlaEngineResponse {
  success: boolean;
  data?: SlaEngineSettings;
  message?: string;
}

export interface BusinessHoursTestResponse {
  success: boolean;
  data?: {
    datetime: string;
    is_within_business_hours: boolean;
    day_of_week: string;
    time: string;
    settings: {
      business_hours_start: string;
      business_hours_end: string;
      working_days: string[];
    };
  };
  message?: string;
}

/**
 * Get SLA engine settings
 */
export const getSlaEngineSettings = async (): Promise<SlaEngineResponse> => {
  try {
    const response = await api.get('/sla-engine/settings');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to fetch SLA engine settings'
    };
  }
};

/**
 * Update SLA engine settings
 */
export const updateSlaEngineSettings = async (data: Partial<SlaEngineSettings>): Promise<SlaEngineResponse> => {
  try {
    const response = await api.put('/sla-engine/settings', data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const errors = err.response?.data?.errors;
    return {
      success: false,
      message: err.response?.data?.message || (errors ? Object.values(errors).flat().join(', ') : 'Failed to update SLA engine settings')
    };
  }
};

/**
 * Reset SLA engine settings to defaults
 */
export const resetSlaEngineSettings = async (): Promise<SlaEngineResponse> => {
  try {
    const response = await api.post('/sla-engine/reset-defaults');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to reset SLA engine settings'
    };
  }
};

/**
 * Test if a given datetime is within business hours
 */
export const testBusinessHours = async (datetime?: string): Promise<BusinessHoursTestResponse> => {
  try {
    const response = await api.post('/sla-engine/test-business-hours', { datetime });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to test business hours'
    };
  }
};
