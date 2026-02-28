import api from './api';
import supersetConfigService from './supersetConfigService';
import type {
  SupersetDashboard,
  DashboardListResponse,
  GuestTokenResponse,
  RLSRule
} from '../types/superset';

/**
 * Superset Dashboard Service
 * Handles all API calls related to Superset dashboards
 */
export const supersetService = {
  /**
   * Get user's accessible dashboards based on their role
   */
  async getMyDashboards(params?: {
    search?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<SupersetDashboard[]> {
    try {
      const response = await api.get<DashboardListResponse>(
        '/superset/my-dashboards',
        {
          params,
          headers: {
            'Accept-Language': localStorage.getItem('language') || 'en',
          },
        }
      );
      return response.data.dashboards;
    } catch (error) {
      console.error('Error fetching my dashboards:', error);
      throw error;
    }
  },

  /**
   * Get all dashboards (admin only)
   */
  async getAllDashboards(params?: {
    search?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<SupersetDashboard[]> {
    try {
      const response = await api.get<DashboardListResponse>(
        '/superset/dashboard-configs',
        {
          params,
          headers: {
            'Accept-Language': localStorage.getItem('language') || 'en',
          },
        }
      );
      return response.data.dashboards;
    } catch (error) {
      console.error('Error fetching all dashboards:', error);
      throw error;
    }
  },

  /**
   * Get single dashboard by ID or slug
   */
  async getDashboard(id: number | string): Promise<SupersetDashboard> {
    try {
      const response = await api.get<SupersetDashboard>(
        `/superset/dashboard-configs/${id}`,
        {
          headers: {
            'Accept-Language': localStorage.getItem('language') || 'en',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching dashboard ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generate guest token for dashboard embedding
   */
  async getGuestToken(
    dashboardId: string,
    rls?: RLSRule[]
  ): Promise<string> {
    try {
      const response = await api.post<GuestTokenResponse>(
        '/superset/guest-token',
        {
          dashboard_id: dashboardId,
          rls,
        }
      );
      return response.data.token;
    } catch (error) {
      console.error('Error fetching guest token:', error);
      throw error;
    }
  },

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<{ categories: string[] }>(
        '/superset/categories'
      );
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get Superset domain URL (fetched from backend configuration)
   */
  async getSupersetDomain(): Promise<string> {
    return supersetConfigService.getUrl();
  },

  /**
   * Get Superset domain URL synchronously (uses env fallback if config not yet loaded)
   */
  getSupersetDomainSync(): string {
    return import.meta.env.VITE_SUPERSET_URL || 'http://localhost:8088';
  },
};

export default supersetService;
