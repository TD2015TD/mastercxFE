import api from './api';

export const languageService = {
  /**
   * Get all available languages
   */
  async getLanguages() {
    const response = await api.get('/languages');
    return response.data;
  },

  /**
   * Get translations for a specific locale
   */
  async getTranslations(locale = 'en') {
    const response = await api.get(`/translations/${locale}`);
    return response.data;
  },

  /**
   * Get all translations for all languages
   */
  async getAllTranslations() {
    const response = await api.get('/translations');
    return response.data;
  }
};

export default languageService;
