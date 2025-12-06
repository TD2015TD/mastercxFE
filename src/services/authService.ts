import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
  mitel_agent_id?: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// Map role_id to role name
const getRoleFromRoleId = (roleId: number): string => {
  const roleMap: { [key: number]: string } = {
    1: 'super_admin',
    2: 'admin',
    3: 'supervisor',
    4: 'agent',
    5: 'user'
  };
  return roleMap[roleId] || 'agent';
};

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data.data || response.data;
    
    if (data.access_token) {
      localStorage.setItem('jwt_token', data.access_token);
    }
    
    // Map role_id to role name if needed
    if (data.user && data.user.role_id && !data.user.role) {
      data.user.role = getRoleFromRoleId(data.user.role_id);
    }
    
    return data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user-session');
    }
  },

  // Get current user
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    if (response.data.access_token) {
      localStorage.setItem('jwt_token', response.data.access_token);
    }
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwt_token');
  },

  // Get current user from localStorage
  getCurrentUser: (): AuthResponse['user'] | null => {
    try {
      const userData = localStorage.getItem('user-session');
      if (userData) {
        const user = JSON.parse(userData);
        // Map role_id to role name if needed
        if (user.role_id && !user.role) {
          user.role = getRoleFromRoleId(user.role_id);
        }
        return user;
      }
      return null;
    } catch (err) {
      console.error('Error parsing user data from localStorage:', err);
      return null;
    }
  },

  // Set current user to localStorage
  setCurrentUser: (user: AuthResponse['user']) => {
    try {
      localStorage.setItem('user-session', JSON.stringify(user));
    } catch (err) {
      console.error('Error storing user data to localStorage:', err);
    }
  },
};
