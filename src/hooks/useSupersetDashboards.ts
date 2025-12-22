import { useState, useEffect, useCallback } from 'react';
import type { SupersetDashboard } from '../types/superset';
import supersetService from '../services/supersetService';

interface UseSupersetDashboardsOptions {
  search?: string;
  category?: string;
  is_active?: boolean;
  autoLoad?: boolean;
}

interface UseSupersetDashboardsReturn {
  dashboards: SupersetDashboard[];
  loading: boolean;
  error: Error | null;
  categories: string[];
  loadDashboards: () => Promise<void>;
  loadCategories: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing Superset dashboards
 */
export const useSupersetDashboards = (
  options: UseSupersetDashboardsOptions = {}
): UseSupersetDashboardsReturn => {
  const { search, category, is_active, autoLoad = true } = options;

  const [dashboards, setDashboards] = useState<SupersetDashboard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load dashboards from API
   */
  const loadDashboards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search,
        category,
        is_active,
      };

      // Remove undefined values
      Object.keys(params).forEach(
        key => params[key as keyof typeof params] === undefined && delete params[key as keyof typeof params]
      );

      const data = await supersetService.getMyDashboards(params);
      setDashboards(data);
    } catch (err) {
      console.error('Error loading dashboards:', err);
      setError(err as Error);
      setDashboards([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, is_active]);

  /**
   * Load categories from API
   */
  const loadCategories = useCallback(async () => {
    try {
      const data = await supersetService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await Promise.all([loadDashboards(), loadCategories()]);
  }, [loadDashboards, loadCategories]);

  // Auto-load on mount and when dependencies change
  useEffect(() => {
    if (autoLoad) {
      loadDashboards();
    }
  }, [autoLoad, loadDashboards]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    dashboards,
    loading,
    error,
    categories,
    loadDashboards,
    loadCategories,
    refresh,
  };
};

export default useSupersetDashboards;
