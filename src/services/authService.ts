import api from './api';

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
  mitel_agent_id?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at: string | null;
      created_at: string;
      updated_at: string;
      ignite_id: string;
      role_id: number;
      status: string;
      deleted_at: string | null;
      role: {
        id: number;
        name: string;
        slug: string;
        description: string;
        created_at: string;
        updated_at: string;
      };
      agent: {
        id: number;
        user_id: number;
        agent_code: string;
        employee_id: string;
        department: string;
        designation: string;
        mitel_agent_id: string;
        mitel_extension: string | null;
        mitel_queue_ids: string[];
        status: string;
        availability: string;
        skills: string[];
        languages: string[];
        max_concurrent_tickets: number;
        notes: string | null;
        last_activity_at: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        mitel_state: string;
        mitel_state_reason: string | null;
        mitel_logged_in: boolean;
        mitel_last_state_change: string;
        agent_username: string;
      };
      MitelToken: string;
    };
    MitelToken: string;
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
  login: async (credentials: LoginCredentials): Promise<{ jwtToken: string; user: AuthResponse['data']['user'] }> => {
    try {
      console.log('authService.login - Sending request:', { 
        username: credentials.username,
        email: credentials.email,
        hasPassword: !!credentials.password 
      });
      
      const response = await api.post('/auth/login', credentials);
      console.log('authService.login - Response received:', {
        status: response.status,
        success: response.data?.success,
        hasUser: !!response.data?.data?.user
      });
      
      const data = response.data;

      if (data.success && data.data.user) {
        const jwtToken = data.data.access_token;
        const mitelToken = data.data.MitelToken;
        const user = data.data.user;
        const permissions = data.data.permissions || [];

        console.log('authService.login - Storing tokens, user data, and permissions');
        localStorage.setItem('jwt_token', jwtToken);
        localStorage.setItem('mitel_token', mitelToken);
        localStorage.setItem('user_permissions', JSON.stringify(permissions));
        authService.setCurrentUser(user);

        return { jwtToken, user };
      }

      console.error('authService.login - Login failed: No user data in response');
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('authService.login - Error caught:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Preserve the axios error with response data so the UI can display proper error messages
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear ALL localStorage items on logout
      // This includes: jwt_token, mitel_token, user-session, menu_items_cache,
      // menu_items_cache_timestamp, JsSIP:*, and any other cached data
      localStorage.clear();

      // Also clear sessionStorage if needed
      sessionStorage.clear();
    }
  },

  // Get current user
  me: async (): Promise<{ user: AuthResponse['data']['user']; agent: AuthResponse['data']['user']['agent'] }> => {
    const response = await api.get('/auth/me');
    const data = response.data;

    if (data.success && data.data.user) {
      const user = data.data.user;
      const agent = user.agent;
      const permissions = data.data.permissions || [];

      authService.setCurrentUser(user);
      authService.setPermissions(permissions);
      return { user, agent };
    }

    throw new Error('Failed to fetch user data');
  },

  // Refresh token
  refresh: async (): Promise<{ jwtToken: string; mitelToken: string }> => {
    const response = await api.post('/auth/refresh');
    const data = response.data;

    if (data.success && data.data.MitelToken) {
      const jwtToken = data.data.MitelToken; // Assuming MitelToken is used as JWT token
      const mitelToken = data.data.MitelToken;

      localStorage.setItem('jwt_token', jwtToken);
      localStorage.setItem('mitel_token', mitelToken);

      return { jwtToken, mitelToken };
    }

    throw new Error('Failed to refresh token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwt_token');
  },

  // Get current user from localStorage
  getCurrentUser: (): AuthResponse['data']['user'] | null => {
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
  setCurrentUser: (user: AuthResponse['data']['user']) => {
    try {
      localStorage.setItem('user-session', JSON.stringify(user));
    } catch (err) {
      console.error('Error storing user data to localStorage:', err);
    }
  },

  // Get Mitel token from localStorage
  getMitelToken: (): string | null => {
    return localStorage.getItem('mitel_token');
  },

  // Get user permissions from localStorage
  getPermissions: (): string[] => {
    try {
      const permissionsData = localStorage.getItem('user_permissions');
      if (permissionsData) {
        return JSON.parse(permissionsData);
      }
      return [];
    } catch (err) {
      console.error('Error parsing permissions data from localStorage:', err);
      return [];
    }
  },

  // Set user permissions to localStorage
  setPermissions: (permissions: string[]) => {
    try {
      localStorage.setItem('user_permissions', JSON.stringify(permissions));
    } catch (err) {
      console.error('Error storing permissions data to localStorage:', err);
    }
  },
};
