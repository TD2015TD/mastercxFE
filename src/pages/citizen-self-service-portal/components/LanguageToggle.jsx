import React from 'react';


const LanguageToggle = ({ currentLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' }
  ];

  return (
    <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-1">
      {languages?.map((language) => (
        <button
          key={language?.code}
          onClick={() => onLanguageChange(language?.code)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentLanguage === language?.code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span>{language?.flag}</span>
          <span className="hidden sm:inline">{language?.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;