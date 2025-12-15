import api from './api';

export interface ArticlePayload {
  title: string;
  content?: string;
  category_code: string;
  author?: string;
  published_at?: string;
  file?: File;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  views?: number;
  helpful_count?: number;
  not_helpful_count?: number;
  author_id?: number;
  author?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  code: string;
  type: string;
  value: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  parent_code?: string;
  created_at?: string;
  updated_at?: string;
}

export const knowledgeBaseService = {
  // OpenSearch Article Management
  getArticles: async (params?: {
    status?: string;
    category?: string;
    author_id?: number;
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get('/knowledge-base', { params });
    return response.data;
  },

  getArticle: async (id: string) => {
    const response = await api.get(`/knowledge-base/${id}`);
    return response.data;
  },

  createArticle: async (data: Partial<KnowledgeBaseArticle>) => {
    const response = await api.post('/knowledge-base', data);
    return response.data;
  },

  updateArticle: async (id: string, data: Partial<KnowledgeBaseArticle>) => {
    const response = await api.put(`/knowledge-base/${id}`, data);
    return response.data;
  },

  deleteArticle: async (id: string) => {
    const response = await api.delete(`/knowledge-base/${id}`);
    return response.data;
  },

  bulkImport: async (articles: Partial<KnowledgeBaseArticle>[]) => {
    const response = await api.post('/knowledge-base/bulk-import', { articles });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/knowledge-base-statistics');
    return response.data;
  },

  // Category Management (using Lookup API)
  getCategories: async () => {
    const response = await api.get('/lookups', {
      params: {
        type: 'knowledge_base_category',
        per_page: 100
      }
    });
    return response.data;
  },

  createCategory: async (data: {
    code: string;
    value: string;
    description?: string;
    display_order?: number;
    parent_code?: string;
  }) => {
    const response = await api.post('/lookups', {
      type: 'knowledge_base_category',
      ...data,
      is_active: true
    });
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<Category>) => {
    const response = await api.put(`/lookups/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/lookups/${id}`);
    return response.data;
  },
};

// Legacy functions for backward compatibility
export const createArticle = async (data: ArticlePayload) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('category_code', data.category_code);
  if (data.content) formData.append('content', data.content);
  if (data.author) formData.append('author', data.author);
  if (data.published_at) formData.append('published_at', data.published_at);
  if (data.file) formData.append('file', data.file);
  return api.post('/knowledge-base-articles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteArticle = async (id: number | string) => {
  return api.delete(`/knowledge-base-articles/${id}`);
};

export const searchArticles = async (query?: string, category_code?: string) => {
  const params: any = {};
  if (query) params.query = query;
  if (category_code) params.category = category_code;
  return api.get('/knowledge-base-articles/search', { params });
};

export const aggregateByCategory = async () => {
  return api.get('/knowledge-base-articles/aggregate/category');
};

export const updateArticle = async (id: number | string, data: ArticlePayload) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('category_code', data.category_code);
  if (data.content) formData.append('content', data.content);
  if (data.author) formData.append('author', data.author);
  if (data.published_at) formData.append('published_at', data.published_at);
  if (data.file) formData.append('file', data.file);
  return api.post(`/knowledge-base-articles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', 'X-HTTP-Method-Override': 'PUT' },
  });
};

export default knowledgeBaseService;
