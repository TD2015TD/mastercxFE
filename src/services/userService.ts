import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
  status: 'active' | 'inactive';
  ignite_id?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  agent?: Record<string, unknown>;
}

export interface UserFilters {
  role_id?: number;
  status?: 'active' | 'inactive';
  search?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role_id: number;
  status?: 'active' | 'inactive';
  ignite_id?: string;
  agent_data?: {
    employee_id?: string;
    department?: string;
    designation?: string;
    mitel_agent_id?: string;
    mitel_extension?: string;
    mitel_queue_ids?: string[];
    skills?: string[];
    languages?: string[];
    max_concurrent_tickets?: number;
  };
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role_id?: number;
  status?: 'active' | 'inactive';
  ignite_id?: string;
  agent_data?: {
    employee_id?: string;
    department?: string;
    designation?: string;
    mitel_agent_id?: string;
    mitel_extension?: string;
    mitel_queue_ids?: string[];
    skills?: string[];
    languages?: string[];
    max_concurrent_tickets?: number;
  };
}

/**
 * Get list of users with filters and pagination
 */
export const getUsers = async (filters?: UserFilters) => {
  const response = await api.get('/users', { params: filters });
  return response.data;
};

/**
 * Get all roles
 */
export const getRoles = async () => {
  const response = await api.get('/roles');
  return response.data;
};

/**
 * Get a single user by ID
 */
export const getUser = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

/**
 * Create a new user
 */
export const createUser = async (payload: CreateUserPayload) => {
  const response = await api.post('/users', payload);
  return response.data;
};

/**
 * Update an existing user
 */
export const updateUser = async (id: number, payload: UpdateUserPayload) => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

/**
 * Delete a user (soft delete)
 */
export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (id: number, status: 'active' | 'inactive') => {
  const response = await api.put(`/users/${id}/status`, { status });
  return response.data;
};

/**
 * Bulk activate users
 */
export const bulkActivateUsers = async (userIds: number[]) => {
  const promises = userIds.map(id => updateUserStatus(id, 'active'));
  return Promise.all(promises);
};

/**
 * Bulk deactivate users
 */
export const bulkDeactivateUsers = async (userIds: number[]) => {
  const promises = userIds.map(id => updateUserStatus(id, 'inactive'));
  return Promise.all(promises);
};

/**
 * Bulk delete users
 */
export const bulkDeleteUsers = async (userIds: number[]) => {
  const promises = userIds.map(id => deleteUser(id));
  return Promise.all(promises);
};

/**
 * Update own profile
 */
export const updateProfile = async (payload: { name?: string; email?: string }) => {
  const response = await api.put('/users/profile', payload);
  return response.data;
};

/**
 * Change own password
 */
export const changePassword = async (payload: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => {
  const response = await api.post('/users/change-password', payload);
  return response.data;
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  updateProfile,
  changePassword,
};
