import api from './api';

export interface Category {
  id: number;
  name: string;
  name_ms: string;
  code?: string;
  parent_id?: number;
  department: string;
  level: number;
  description?: string;
  description_ms?: string;
  is_active: boolean;
  sort_order: number;
  parent?: Category;
  children?: Category[];
  descendants?: Category[];
  created_at: string;
  updated_at: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

interface CategoryResponse {
  success: boolean;
  data: Category[] | CategoryTreeNode[];
  message?: string;
}

export const categoryService = {
  // Get all categories with filters
  getCategories: async (params?: {
    department?: string;
    level?: number;
    is_active?: boolean;
    roots_only?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  }) => {
    const response = await api.get<{ data: Category[] }>('/categories', { params });
    return response.data;
  },

  // Get category tree structure
  getCategoryTree: async (department?: string) => {
    const response = await api.get<CategoryResponse>('/categories/tree/view', {
      params: { department }
    });
    return response.data;
  },

  // Get categories by department and level
  getCategoriesByDepartmentLevel: async (params: {
    department: string;
    level: number;
    parent_id?: number;
  }) => {
    const response = await api.get<CategoryResponse>('/categories/department-level/filter', {
      params
    });
    return response.data;
  },

  // Get single category
  getCategory: async (id: number) => {
    const response = await api.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  // Create category
  createCategory: async (data: Partial<Category>) => {
    const response = await api.post<CategoryResponse>('/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: number, data: Partial<Category>) => {
    const response = await api.put<CategoryResponse>(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: number) => {
    const response = await api.delete<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  // Helper: Get root categories (Level 1) for a department
  getRootCategories: async (department: string) => {
    const response = await api.get<{ data: Category[] }>('/categories', {
      params: {
        department,
        level: 1,
        is_active: true,
        per_page: 100
      }
    });
    return response.data.data || [];
  },

  // Helper: Get subcategories (Level 2) for a parent category
  getSubcategories: async (department: string, parentId: number) => {
    const response = await api.get<CategoryResponse>('/categories/department-level/filter', {
      params: {
        department,
        level: 2,
        parent_id: parentId
      }
    });
    return response.data.data as Category[] || [];
  }
};

export default categoryService;
