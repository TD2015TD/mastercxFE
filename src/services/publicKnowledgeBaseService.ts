import publicApi from './publicApi';

export interface KBArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface KBCategory {
  id: number;
  name: string;
  description: string;
  article_count: number;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  views: number;
}

export const publicKnowledgeBaseService = {
  /**
   * Search knowledge base articles
   */
  async search(query: string, filters?: { category?: string; tags?: string[] }) {
    const response = await publicApi.get('/public/knowledge-base/search', {
      params: {
        q: query,
        category: filters?.category,
        tags: filters?.tags?.join(','),
      },
    });
    return response.data;
  },

  /**
   * Get article by ID
   */
  async getArticle(id: number) {
    const response = await publicApi.get(`/public/knowledge-base/articles/${id}`);
    return response.data;
  },

  /**
   * Get popular articles
   */
  async getPopular(limit: number = 10) {
    const response = await publicApi.get('/public/knowledge-base/popular', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get all categories
   */
  async getCategories() {
    const response = await publicApi.get('/public/knowledge-base/categories');
    return response.data;
  },

  /**
   * Submit feedback on article
   */
  async submitFeedback(articleId: number, helpful: boolean, comment?: string) {
    const response = await publicApi.post(`/public/knowledge-base/articles/${articleId}/feedback`, {
      helpful,
      comment,
    });
    return response.data;
  },

  /**
   * Get frequently asked questions
   */
  async getFAQs(category?: string) {
    const response = await publicApi.get('/public/knowledge-base/faqs', {
      params: { category },
    });
    return response.data;
  },
};

export default publicKnowledgeBaseService;
