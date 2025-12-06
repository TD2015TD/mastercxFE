import { useState, useEffect } from 'react';
import { languageService } from '../services/languageService';

interface Translations {
  [key: string]: string | Translations;
}

let cachedTranslations: Translations | null = null;
let cachedLocale: string | null = null;

export const useTranslation = () => {
  const [translations, setTranslations] = useState<Translations>(cachedTranslations || {});
  const [locale, setLocale] = useState<string>(cachedLocale || localStorage.getItem('locale') || 'en');
  const [loading, setLoading] = useState(!cachedTranslations);

  useEffect(() => {
    const loadTranslations = async () => {
      // If we have cached translations for this locale, use them
      if (cachedTranslations && cachedLocale === locale) {
        setTranslations(cachedTranslations);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await languageService.getTranslations(locale);
        
        cachedTranslations = data;
        cachedLocale = locale;
        setTranslations(data);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English if translation fails
        if (locale !== 'en') {
          try {
            const fallback = await languageService.getTranslations('en');
            cachedTranslations = fallback;
            cachedLocale = 'en';
            setTranslations(fallback);
          } catch (fallbackError) {
            console.error('Error loading fallback translations:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [locale]);

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: string | Translations = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : defaultValue || key;
  };

  const changeLocale = (newLocale: string) => {
    localStorage.setItem('locale', newLocale);
    setLocale(newLocale);
  };

  return {
    t,
    locale,
    changeLocale,
    loading
  };
};

export default useTranslation;
