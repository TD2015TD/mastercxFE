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
  id: string | number;
  title: string;
  content: string;
  excerpt?: string;
  summary?: string;
  category: string;
  category_code?: string;
  category_main?: string;
  subcategory_1?: string;
  subcategory_2?: string;
  subcategory_3?: string;
  subcategory_4?: string;
  tags?: string[];
  status: 'draft' | 'in_review' | 'published' | 'archived';
  views?: number;
  view_count?: number;
  helpful_count?: number;
  not_helpful_count?: number;
  helpful_up?: number;
  helpful_down?: number;
  author_id?: number;
  author?: string;
  created_by?: string;
  updated_by?: string;
  submitted_by?: string;
  submitted_at?: string;
  version?: string;
  changes_summary?: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_review_time?: number;
  department_visibility?: string[];
  file_path?: string;
  file_name?: string;
  file_type?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
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
    category_code?: string;
    author_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get('/knowledge-base', { params });
    return response.data;
  },

  getArticle: async (id: string | number) => {
    const response = await api.get(`/knowledge-base/${id}`);
    return response.data;
  },

  createArticle: async (data: Partial<KnowledgeBaseArticle>) => {
    const response = await api.post('/knowledge-base', data);
    return response.data;
  },

  updateArticle: async (id: string | number, data: Partial<KnowledgeBaseArticle>) => {
    const response = await api.put(`/knowledge-base/${id}`, data);
    return response.data;
  },

  deleteArticle: async (id: string | number) => {
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

  // Knowledge Base Articles API (with file support)
  getArticlesWithFiles: async (params?: {
    category_code?: string;
    search?: string;
  }) => {
    const response = await api.get('/knowledge-base-articles', { params });
    return response.data;
  },

  getArticleWithFile: async (id: string | number) => {
    const response = await api.get(`/knowledge-base-articles/${id}`);
    return response.data;
  },

  getArticleStats: async () => {
    const response = await api.get('/knowledge-base-articles/stats');
    return response.data;
  },

  // Create article with file support (uses FormData)
  createArticleWithFile: async (data: {
    title: string;
    category_code: string;
    status?: string;
    content?: string;
    author?: string;
    published_at?: string;
    file?: File;
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category_code', data.category_code);
    if (data.status) formData.append('status', data.status);
    if (data.content) formData.append('content', data.content);
    if (data.author) formData.append('author', data.author);
    if (data.published_at) formData.append('published_at', data.published_at);
    if (data.file) formData.append('file', data.file);

    const response = await api.post('/knowledge-base-articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update article with file support (uses FormData)
  updateArticleWithFile: async (id: string | number, data: {
    title: string;
    category_code: string;
    status?: string;
    content?: string;
    author?: string;
    published_at?: string;
    file?: File | null;
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category_code', data.category_code);
    if (data.status) formData.append('status', data.status);
    if (data.content) formData.append('content', data.content);
    if (data.author) formData.append('author', data.author);
    if (data.published_at) formData.append('published_at', data.published_at);
    // Only append file if it exists and is not null
    if (data.file && data.file instanceof File) {
      formData.append('file', data.file);
    }

    const response = await api.post(`/knowledge-base-articles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get articles pending review
  getPendingReviews: async (params?: {
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get('/knowledge-base', {
      params: { ...params, status: 'in_review' }
    });
    return response.data;
  },

  // Get user's draft articles
  getUserDrafts: async (userId: number, params?: {
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get('/knowledge-base', {
      params: { ...params, author_id: userId, status: 'draft' }
    });
    return response.data;
  },

  // Get published articles
  getPublishedArticles: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get('/knowledge-base', {
      params: { ...params, status: 'published' }
    });
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
    const response = await api.post('/admin/lookups', {
      type: 'knowledge_base_category',
      ...data,
      is_active: true
    });
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<Category>) => {
    const response = await api.put(`/admin/lookups/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/admin/lookups/${id}`);
    return response.data;
  },

  // Helper methods
  getHelpfulPercentage: (article: KnowledgeBaseArticle): number => {
    const upVotes = article.helpful_up || article.helpful_count || 0;
    const downVotes = article.helpful_down || article.not_helpful_count || 0;
    const total = upVotes + downVotes;
    if (total === 0) return 0;
    return Math.round((upVotes / total) * 100);
  },

  getStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      in_review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      published: 'bg-green-100 text-green-700 border-green-200',
      archived: 'bg-red-100 text-red-700 border-red-200',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  },

  getPriorityColor: (priority: string): string => {
    const colorMap: Record<string, string> = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
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
