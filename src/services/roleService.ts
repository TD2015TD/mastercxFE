import api from './api';

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RoleResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Role[];
    total: number;
    per_page: number;
    last_page: number;
  };
  message?: string;
}

/**
 * Get all roles
 */
export const getRoles = async (): Promise<RoleResponse> => {
  const response = await api.get('/roles');
  return response.data;
};

/**
 * Get role by ID
 */
export const getRole = async (id: number): Promise<{ success: boolean; data: Role; message?: string }> => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

/**
 * Create new role
 */
export const createRole = async (payload: {
  name: string;
  slug: string;
  description?: string;
}): Promise<{ success: boolean; data: Role; message?: string }> => {
  const response = await api.post('/roles', payload);
  return response.data;
};

/**
 * Update role
 */
export const updateRole = async (
  id: number,
  payload: Partial<{ name: string; slug: string; description: string }>
): Promise<{ success: boolean; data: Role; message?: string }> => {
  const response = await api.put(`/roles/${id}`, payload);
  return response.data;
};

/**
 * Delete role
 */
export const deleteRole = async (id: number): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export default {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
};
