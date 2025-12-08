import api from './api';

export interface MitelAgent {
  id: string;
  name?: string;
  extension?: string;
  state?: string;
  queue_count?: number;
  queues?: string[];
}

export interface MitelAgentsResponse {
  success: boolean;
  data?: MitelAgent[];
  message?: string;
}

/**
 * Get list of Mitel agents
 */
export const getMitelAgents = async (): Promise<MitelAgentsResponse> => {
  const response = await api.get('/mitel/agents');
  return response.data;
};

/**
 * Get specific Mitel agent details
 */
export const getMitelAgent = async (agentId: string) => {
  const response = await api.get(`/mitel/agents/${agentId}`);
  return response.data;
};

/**
 * Get Mitel agent state
 */
export const getMitelAgentState = async (agentId: string) => {
  const response = await api.get(`/mitel/agents/${agentId}/state`);
  return response.data;
};

export default {
  getMitelAgents,
  getMitelAgent,
  getMitelAgentState,
};
