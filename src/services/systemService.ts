import api from './api';

export interface SystemHealthMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  uptime: string;
  last_updated: string;
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'warning';
  health: 'healthy' | 'degraded' | 'failed';
  uptime: string;
  port: string;
  last_restart: string;
}

export interface SystemAlert {
  id: number;
  type: 'info' | 'warning' | 'critical';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  acknowledged: boolean;
  module: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user_id: number;
  user_name: string;
  user_role: string;
  action: string;
  category: string;
  details: string;
  ip_address: string;
  severity: 'info' | 'warning' | 'critical';
  module: string;
}

export interface AuditLogFilters {
  search?: string;
  category?: string;
  user_id?: number;
  severity?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string;
  updated_at: string;
}

/**
 * Get system health metrics
 */
export const getSystemHealth = async () => {
  const response = await api.get('/system/health');
  return response.data;
};

/**
 * Get service status
 */
export const getServiceStatus = async () => {
  const response = await api.get('/system/services');
  return response.data;
};

/**
 * Get system alerts
 */
export const getSystemAlerts = async (filters?: { acknowledged?: boolean; severity?: string }) => {
  const response = await api.get('/system/alerts', { params: filters });
  return response.data;
};

/**
 * Acknowledge a system alert
 */
export const acknowledgeAlert = async (alertId: number) => {
  const response = await api.post(`/system/alerts/${alertId}/acknowledge`);
  return response.data;
};

/**
 * Get audit logs with filters
 */
export const getAuditLogs = async (filters?: AuditLogFilters) => {
  const response = await api.get('/system/audit-logs', { params: filters });
  return response.data;
};

/**
 * Export audit logs
 */
export const exportAuditLogs = async (filters?: AuditLogFilters, format: 'csv' | 'pdf' = 'csv') => {
  const response = await api.get('/system/audit-logs/export', {
    params: { ...filters, format },
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `audit-logs-${new Date().toISOString()}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return response.data;
};

/**
 * Get system configurations
 */
export const getSystemConfigs = async (category?: string) => {
  const response = await api.get('/system/config', { params: { category } });
  return response.data;
};

/**
 * Update system configuration
 */
export const updateSystemConfig = async (key: string, value: string) => {
  const response = await api.put(`/system/config/${key}`, { value });
  return response.data;
};

/**
 * Restart a service
 */
export const restartService = async (serviceName: string) => {
  const response = await api.post(`/system/services/${serviceName}/restart`);
  return response.data;
};

/**
 * Create system backup
 */
export const createBackup = async () => {
  const response = await api.post('/system/backup');
  return response.data;
};

/**
 * Get backup history
 */
export const getBackupHistory = async () => {
  const response = await api.get('/system/backup/history');
  return response.data;
};

/**
 * Download backup file
 */
export const downloadBackup = async (backupId: number) => {
  const response = await api.get(`/system/backup/${backupId}/download`, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `backup-${backupId}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return response.data;
};

/**
 * System health check
 */
export const performHealthCheck = async () => {
  const response = await api.post('/system/health-check');
  return response.data;
};

export default {
  getSystemHealth,
  getServiceStatus,
  getSystemAlerts,
  acknowledgeAlert,
  getAuditLogs,
  exportAuditLogs,
  getSystemConfigs,
  updateSystemConfig,
  restartService,
  createBackup,
  getBackupHistory,
  downloadBackup,
  performHealthCheck,
};
