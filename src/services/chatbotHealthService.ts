import api from './api';

export interface ChatbotHealthPeriod {
  from: string;
  to: string;
}

export interface ChatbotStats {
  total_sessions: number;
  today_sessions: number;
  queuing: number;
  active: number;
  closed: number;
  escalated: number;
  escalation_rate: number;
  total_messages: number;
  top_topics: { topic: string; count: number }[];
  daily_trend: { date: string; total: number; escalated: number }[];
  recent_sessions: {
    interaction_id: string;
    customer_name: string;
    topic: string | null;
    status: 'queuing' | 'active' | 'closed';
    agent_name: string | null;
    created_at: string;
    updated_at: string;
    queue_name: string | null;
  }[];
}

export interface LivechatStats {
  total_tickets: number;
  resolved_tickets: number;
  open_tickets: number;
  resolution_rate: number;
  avg_resolution_hrs: number | null;
}

export interface IntegrationStatus {
  database: 'connected' | 'error';
  chat_service: 'connected' | 'unreachable';
}

export interface ChatbotHealthReport {
  period: ChatbotHealthPeriod;
  chatbot: ChatbotStats;
  livechat: LivechatStats;
  integration: IntegrationStatus;
}

export interface ChatbotHealthFilters {
  date_from?: string;
  date_to?: string;
}

export const getChatbotHealthReport = async (filters?: ChatbotHealthFilters): Promise<{ success: boolean; data: ChatbotHealthReport }> => {
  const response = await api.get('/admin/chatbot/health', { params: filters });
  return response.data;
};

export default { getChatbotHealthReport };
