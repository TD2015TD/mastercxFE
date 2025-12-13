import api from './api';

export interface SystemConfiguration {
  id: number;
  category: string;
  key: string;
  value: string;
  type: 'string' | 'integer' | 'boolean' | 'json' | 'encrypted';
  description: string;
  is_encrypted: boolean;
  is_active: boolean;
  metadata: any;
}

export interface ConfigurationUpdate {
  key: string;
  value: string;
}

export interface BulkUpdatePayload {
  configurations: ConfigurationUpdate[];
}

export interface TestEmailPayload {
  test_email: string;
}

/**
 * Get all system configurations grouped by category
 */
export const getAllConfigurations = async () => {
  const response = await api.get('/system/configurations');
  return response.data;
};

/**
 * Get configurations by category
 */
export const getConfigurationsByCategory = async (category: string) => {
  const response = await api.get(`/system/configurations/category/${category}`);
  return response.data;
};

/**
 * Get a single configuration
 */
export const getConfiguration = async (id: number) => {
  const response = await api.get(`/system/configurations/${id}`);
  return response.data;
};

/**
 * Update a configuration
 */
export const updateConfiguration = async (id: number, value: string, isActive?: boolean) => {
  const response = await api.put(`/system/configurations/${id}`, {
    value,
    is_active: isActive,
  });
  return response.data;
};

/**
 * Bulk update configurations
 */
export const bulkUpdateConfigurations = async (payload: BulkUpdatePayload) => {
  const response = await api.post('/system/configurations/bulk-update', payload);
  return response.data;
};

/**
 * Test mail configuration
 */
export const testMailConfiguration = async (testEmail: string) => {
  const response = await api.post('/system/configurations/test-mail', {
    test_email: testEmail,
  });
  return response.data;
};

/**
 * Test LDAP connection
 */
export const testLdapConnection = async () => {
  const response = await api.post('/system/configurations/test-ldap');
  return response.data;
};

/**
 * Clear configuration cache
 */
export const clearConfigurationCache = async () => {
  const response = await api.post('/system/configurations/clear-cache');
  return response.data;
};

export default {
  getAllConfigurations,
  getConfigurationsByCategory,
  getConfiguration,
  updateConfiguration,
  bulkUpdateConfigurations,
  testMailConfiguration,
  testLdapConnection,
  clearConfigurationCache,
};
