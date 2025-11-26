import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { languageService } from '../../../services/languageService';


const LanguageToggle = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languages, setLanguages] = useState([
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' }
  ]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await languageService.getLanguages();
      if (response.success && response.languages) {
        setLanguages(response.languages.map(lang => ({
          code: lang.code,
          name: lang.nativeName || lang.name,
          flag: lang.flag
        })));
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
      // Keep default languages if API fails
    }
  };

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('preferred-language', languageCode);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: languageCode } 
    }));
    
    // Reload the page to apply language changes
    window.location?.reload();
  };

  return (
    <div className="flex items-center space-x-2">
      {languages?.map((language) => (
        <Button
          key={language?.code}
          variant={currentLanguage === language?.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange(language?.code)}
          className="flex items-center space-x-2"
        >
          <span>{language?.flag}</span>
          <span className="hidden sm:inline">{language?.name}</span>
          <span className="sm:hidden">{language?.code?.toUpperCase()}</span>
        </Button>
      ))}
    </div>
  );
};

export default LanguageToggle;