import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auto-refresh
apiClient.interceptors.response.use(
  (response) => {
    // Check if the token was auto-refreshed by the backend middleware
    if (response.headers['x-token-refreshed'] === 'true') {
      const authHeader = response.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const newToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        localStorage.setItem('jwt_token', newToken);
        console.log('Token auto-refreshed successfully (menuService)');

        // Dispatch custom event for other parts of the app
        window.dispatchEvent(new CustomEvent('token-refreshed', {
          detail: { token: newToken }
        }));
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      // Don't redirect on auth endpoints — let errors bubble up to the caller
      if (requestUrl.includes('/auth/')) {
        return Promise.reject(error);
      }

      // Clear tokens and redirect to login
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('mitel_token');
      localStorage.removeItem('user-session');
      window.location.href = '/agent-login';
    }
    return Promise.reject(error);
  }
);

export interface MenuItem {
  id: number;
  label: string;
  path: string;
  icon: string;
  description?: string;
  tooltip?: string;
  order: number;
  metadata?: Record<string, unknown>;
  permissions?: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
  children?: MenuItem[];
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: MenuItem[];
}

class MenuService {
  /**
   * Get menu items for the authenticated user based on their role
   */
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      // No frontend cache — backend caches per role (busted on every RBAC save).
      // A frontend cache caused stale menus across all browsers when admin changed role assignments.
      const response = await apiClient.get<MenuResponse>('/menus');
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      return [];
    }
  }

  /**
   * Get menu items by role slug (for admin purposes)
   */
  async getMenuItemsByRole(roleSlug: string): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get<MenuResponse>(`/menus/role/${roleSlug}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch menu items for role ${roleSlug}:`, error);
      return [];
    }
  }

  /**
   * Get all menu items (admin only)
   */
  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get<MenuResponse>('/menus/all');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch all menu items:', error);
      return [];
    }
  }

  /**
   * Clear menu cache (both frontend and backend)
   */
  async clearCache(): Promise<boolean> {
    try {
      // Clear frontend cache
      localStorage.removeItem('menu_items_cache');
      localStorage.removeItem('menu_items_cache_timestamp');
      
      // Clear backend cache
      await apiClient.post('/menus/clear-cache');
      
      return true;
    } catch (error) {
      console.error('Failed to clear menu cache:', error);
      return false;
    }
  }

  /**
   * Clear only frontend cache
   */
  clearFrontendCache(): void {
    localStorage.removeItem('menu_items_cache');
    localStorage.removeItem('menu_items_cache_timestamp');
  }
}

export const menuService = new MenuService();
export default menuService;
