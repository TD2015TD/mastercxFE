import api from './api';

export interface SupersetDashboard {
  id: number;
  superset_id: string;
  slug: string;
  title: string;
  description?: string;
  title_en: string;
  title_ms: string;
  description_en?: string;
  description_ms?: string;
  category?: string;
  icon?: string;
  order: number;
  is_active: boolean;
  is_public: boolean;
  ui_config?: Record<string, unknown>;
  default_filters?: Record<string, unknown>;
  rls_config?: Record<string, unknown>;
  dataset_ids?: number[];
  tags?: string[];
  thumbnail_url?: string;
  roles?: Role[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  can_view?: boolean;
  can_export?: boolean;
  can_share?: boolean;
  custom_rls?: Record<string, unknown>;
}

export interface DashboardFormData {
  superset_id: string;
  slug: string;
  title_en: string;
  description_en?: string;
  title_ms: string;
  description_ms?: string;
  category?: string;
  icon?: string;
  order?: number;
  is_active?: boolean;
  is_public?: boolean;
  ui_config?: Record<string, unknown>;
  default_filters?: Record<string, unknown>;
  rls_config?: Record<string, unknown>;
  dataset_ids?: string;
  tags?: string;
  thumbnail_url?: string;
  roles?: Array<{
    role_id: number;
    can_view?: boolean;
    can_export?: boolean;
    can_share?: boolean;
    custom_rls?: Record<string, unknown>;
  }>;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  dashboards?: T;
  categories?: string[];
  error?: string;
  details?: Record<string, string[]>;
}

class SupersetDashboardService {
  /**
   * Get all dashboards with optional filters
   */
  async getDashboards(params?: {
    category?: string;
    is_active?: boolean;
    is_public?: boolean;
    search?: string;
  }): Promise<ApiResponse<SupersetDashboard[]>> {
    try {
      const response = await api.get<ApiResponse<SupersetDashboard[]>>('/superset/dashboard-configs', { params });
      return {
        success: true,
        data: response.data.dashboards || response.data.data || []
      };
    } catch (error: any) {
      console.error('Error fetching dashboards:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboards',
        data: []
      };
    }
  }

  /**
   * Get a specific dashboard by ID or slug
   */
  async getDashboard(identifier: string | number): Promise<ApiResponse<SupersetDashboard>> {
    try {
      const response = await api.get<SupersetDashboard>(`/superset/dashboard-configs/${identifier}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboard'
      };
    }
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(data: DashboardFormData): Promise<ApiResponse<SupersetDashboard>> {
    try {
      const response = await api.post<{ message: string; dashboard: SupersetDashboard }>(
        '/superset/dashboard-configs',
        data
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.dashboard
      };
    } catch (error: any) {
      console.error('Error creating dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create dashboard',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Update an existing dashboard
   */
  async updateDashboard(
    id: number,
    data: Partial<DashboardFormData>
  ): Promise<ApiResponse<SupersetDashboard>> {
    try {
      const response = await api.put<{ message: string; dashboard: SupersetDashboard }>(
        `/superset/dashboard-configs/${id}`,
        data
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.dashboard
      };
    } catch (error: any) {
      console.error('Error updating dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update dashboard',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<{ message: string }>(`/superset/dashboard-configs/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error deleting dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete dashboard'
      };
    }
  }

  /**
   * Assign roles to a dashboard
   */
  async assignRoles(
    id: number,
    roles: Array<{
      role_id: number;
      can_view?: boolean;
      can_export?: boolean;
      can_share?: boolean;
      custom_rls?: Record<string, unknown>;
    }>
  ): Promise<ApiResponse<SupersetDashboard>> {
    try {
      const response = await api.post<{ message: string; dashboard: SupersetDashboard }>(
        `/superset/dashboard-configs/${id}/assign-roles`,
        { roles }
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.dashboard
      };
    } catch (error: any) {
      console.error('Error assigning roles:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign roles',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await api.get<{ categories: string[] }>('/superset/categories');
      return {
        success: true,
        categories: response.data.categories || []
      };
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch categories',
        categories: []
      };
    }
  }

  /**
   * Get dashboards accessible by the authenticated user
   */
  async getMyDashboards(): Promise<ApiResponse<SupersetDashboard[]>> {
    try {
      const response = await api.get<ApiResponse<SupersetDashboard[]>>('/superset/my-dashboards');
      return {
        success: true,
        data: response.data.dashboards || response.data.data || []
      };
    } catch (error: any) {
      console.error('Error fetching my dashboards:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch my dashboards',
        data: []
      };
    }
  }
}

export const supersetDashboardService = new SupersetDashboardService();
export default supersetDashboardService;
