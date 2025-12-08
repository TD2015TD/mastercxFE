import api from './api';

export const slaService = {
  /**
   * Get all SLA configurations
   */
  async getSlaConfigurations(params?: { department?: string; priority?: string; is_active?: boolean }) {
    const response = await api.get('/sla-configurations', { params });
    return response.data;
  },

  /**
   * Get SLA configurations grouped by department
   */
  async getSlaGroupedByDepartment() {
    const response = await api.get('/sla-configurations/grouped/by-department');
    return response.data;
  },

  /**
   * Get SLA for specific department and priority
   */
  async getSlaForTicket(department: string, priority: string) {
    const response = await api.get('/sla-configurations/get/by-ticket', {
      params: { department, priority }
    });
    return response.data;
  },

  /**
   * Get SLA breaches and warnings (from dashboard data)
   */
  async getSlaMetrics(department?: string) {
    const response = await api.get('/dashboard/supervisor', {
      params: { department }
    });
    return response.data;
  },

  /**
   * Get SLA breach and warning details
   */
  async getSlaDetails(department: string) {
    const response = await api.get('/dashboard/sla-details', {
      params: { department }
    });
    return response.data;
  },

  /**
   * Create new SLA configuration
   */
  async createSlaConfiguration(data: any) {
    const response = await api.post('/sla-configurations', data);
    return response.data;
  },

  /**
   * Update SLA configuration
   */
  async updateSlaConfiguration(id: number, data: any) {
    const response = await api.put(`/sla-configurations/${id}`, data);
    return response.data;
  },

  /**
   * Delete SLA configuration
   */
  async deleteSlaConfiguration(id: number) {
    const response = await api.delete(`/sla-configurations/${id}`);
    return response.data;
  },
};

export default slaService;
