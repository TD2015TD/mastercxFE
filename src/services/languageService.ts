import api from './api';

// In-memory cache for translations
const translationCache: Record<string, Record<string, unknown>> = {};
const cacheTimestamp: Record<string, number> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const languageService = {
  /**
   * Get current language from localStorage
   */
  getCurrentLanguage() {
    return localStorage.getItem('preferred-language') || 'en';
  },

  /**
   * Set current language in localStorage
   */
  setCurrentLanguage(locale: string) {
    localStorage.setItem('preferred-language', locale);
  },

  /**
   * Get all available languages
   */
  async getLanguages() {
    const response = await api.get('/languages');
    return response.data;
  },

  /**
   * Get translations for a specific locale (with caching)
   * If no locale is provided, uses the stored preferred language
   */
  async getTranslations(locale?: string) {
    // Use stored language if no locale specified
    const targetLocale = locale || this.getCurrentLanguage();
    const now = Date.now();
    
    // Check if we have valid cached data
    if (
      translationCache[targetLocale] && 
      cacheTimestamp[targetLocale] && 
      (now - cacheTimestamp[targetLocale]) < CACHE_DURATION
    ) {
      console.log(`[LanguageService] Using cached translations for ${targetLocale}`);
      return translationCache[targetLocale];
    }

    // Fetch fresh data
    console.log(`[LanguageService] Fetching translations for ${targetLocale}`);
    const response = await api.get(`/translations/${targetLocale}`);
    
    // Extract translations from response (API returns {success, locale, translations})
    const translations = response.data.translations || response.data;
    
    // Update cache
    translationCache[targetLocale] = translations;
    cacheTimestamp[targetLocale] = now;
    
    return translations;
  },

  /**
   * Get all translations for all languages
   */
  async getAllTranslations() {
    const response = await api.get('/translations');
    return response.data;
  },

  /**
   * Clear translation cache (useful after language updates)
   */
  clearCache(locale?: string) {
    if (locale) {
      delete translationCache[locale];
      delete cacheTimestamp[locale];
      console.log(`[LanguageService] Cleared cache for ${locale}`);
    } else {
      Object.keys(translationCache).forEach(key => delete translationCache[key]);
      Object.keys(cacheTimestamp).forEach(key => delete cacheTimestamp[key]);
      console.log('[LanguageService] Cleared all translation caches');
    }
  },

  /**
   * Preload translations for a locale (useful for app initialization)
   * If no locale is provided, uses the stored preferred language
   */
  async preloadTranslations(locale?: string) {
    await this.getTranslations(locale);
  }
};

export default languageService;
