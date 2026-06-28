import api from './api';

/**
 * Get agent dashboard metrics
 */
export const getAgentDashboard = async (agentId?: number) => {
  const params = agentId ? { agent_id: agentId } : {};
  const response = await api.get('/dashboard/agent', { params });
  return response.data;
};

/**
 * Get supervisor dashboard metrics (legacy - monolithic endpoint)
 * @deprecated Use individual widget endpoints for better error handling
 */
export const getSupervisorDashboard = async (department: string) => {
  const response = await api.get('/dashboard/supervisor', {
    params: { department },
  });
  return response.data;
};

/**
 * Widget-based Dashboard APIs (with isolated error handling)
 */

/**
 * Get queue statistics widget
 */
export const getQueueStats = async (department?: string | null) => {
  const response = await api.get('/dashboard/queue-stats', {
    params: department ? { department } : {},
  });
  return response.data;
};

/**
 * Get team statistics widget (includes Mitel integration)
 */
export const getTeamStats = async (department: string) => {
  const response = await api.get('/dashboard/team-stats', {
    params: { department },
  });
  return response.data;
};

/**
 * Get SLA statistics widget
 */
export const getSlaStats = async (department?: string | null) => {
  const response = await api.get('/dashboard/sla-stats', {
    params: department ? { department } : {},
  });
  return response.data;
};

/**
 * Get agent performance widget
 */
export const getAgentPerformance = async (department?: string | null) => {
  const response = await api.get('/dashboard/agent-performance', {
    params: department ? { department } : {},
  });
  return response.data;
};

/**
 * Get trends widget
 */
export const getTrends = async (department: string) => {
  const response = await api.get('/dashboard/trends', {
    params: { department },
  });
  return response.data;
};

/**
 * Get all supervisor dashboard widgets in parallel
 * This provides better error handling as each widget can fail independently
 */
export const getSupervisorDashboardWidgets = async (department: string) => {
  const results = await Promise.allSettled([
    getQueueStats(department),
    getTeamStats(department),
    getSlaStats(department),
    getAgentPerformance(department),
    getTrends(department),
  ]);

  return {
    queue: results[0].status === 'fulfilled' ? results[0].value.data : null,
    queueError: results[0].status === 'rejected' ? results[0].reason : null,
    
    team: results[1].status === 'fulfilled' ? results[1].value.data : null,
    teamError: results[1].status === 'rejected' ? results[1].reason : null,
    
    sla: results[2].status === 'fulfilled' ? results[2].value.data : null,
    slaError: results[2].status === 'rejected' ? results[2].reason : null,
    
    agents: results[3].status === 'fulfilled' ? results[3].value.data : null,
    agentsError: results[3].status === 'rejected' ? results[3].reason : null,
    
    trends: results[4].status === 'fulfilled' ? results[4].value.data : null,
    trendsError: results[4].status === 'rejected' ? results[4].reason : null,
  };
};

/**
 * Get ticket metrics for dashboard cards
 */
export const getTicketMetrics = async (department?: string | null, agentId?: number | null, dateFrom?: string | null, dateTo?: string | null) => {
  const params: any = {};
  if (department && department !== 'all') params.department = department;
  if (agentId) params.agent_id = agentId;
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const response = await api.get('/dashboard/ticket-metrics', { params });
  return response.data;
};

/**
 * Get tickets closed by day for line chart
 */
export const getTicketsClosedByDay = async (department?: string | null, agentId?: number | null) => {
  const params: any = {};
  if (department && department !== 'all') params.department = department;
  if (agentId) params.agent_id = agentId;

  const response = await api.get('/dashboard/tickets-closed-by-day', { params });
  return response.data;
};

/**
 * Get department performance for bar chart
 */
export const getDepartmentPerformance = async (dateFrom?: string | null, dateTo?: string | null) => {
  const params: any = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const response = await api.get('/dashboard/department-performance', { params });
  return response.data;
};

/**
 * Get LiveChat status for donut chart
 */
export const getLiveChatStatus = async (department?: string | null, agentId?: number | null) => {
  const params: any = {};
  if (department && department !== 'all') params.department = department;
  if (agentId) params.agent_id = agentId;

  const response = await api.get('/dashboard/livechat-status', { params });
  return response.data;
};

/**
 * Get today's ticket count broken down by channel (phone, email, chat, web, walk-in, social_media)
 */
export const getTicketsByChannel = async (department?: string | null, agentId?: number | null) => {
  const params: any = {};
  if (department && department !== 'all') params.department = department;
  if (agentId) params.agent_id = agentId;

  const response = await api.get('/dashboard/tickets-by-channel', { params });
  return response.data;
};

/**
 * Get distinct department values from the agents table
 */
export const getDepartments = async (): Promise<string[]> => {
  const response = await api.get('/dashboard/departments');
  return response.data?.data ?? [];
};

export default {
  getAgentDashboard,
  getSupervisorDashboard,
  getQueueStats,
  getTeamStats,
  getSlaStats,
  getAgentPerformance,
  getTrends,
  getSupervisorDashboardWidgets,
  getTicketMetrics,
  getTicketsClosedByDay,
  getDepartmentPerformance,
  getLiveChatStatus,
  getTicketsByChannel,
};
