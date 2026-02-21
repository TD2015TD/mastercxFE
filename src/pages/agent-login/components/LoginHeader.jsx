import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import cxLogo from '../../../assets/cxlogo.png';

const LoginHeader = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const translations = {
    en: {
      welcome: 'Welcome to',
      systemName: 'JKDM CRM Portal',
      subtitle: 'Jabatan Kastam Diraja Malaysia',
      description: 'Secure access to customer relationship management system',
      agentPortal: 'Agent Portal'
    },
    ms: {
      welcome: 'Selamat datang ke',
      systemName: 'Portal CRM JKDM',
      subtitle: 'Jabatan Kastam Diraja Malaysia',
      description: 'Akses selamat ke sistem pengurusan hubungan pelanggan',
      agentPortal: 'Portal Ejen'
    }
  };

  const t = translations?.[currentLanguage];

  return (
    <div className="text-center space-y-4 mb-8">
      {/* Logo and System Name */}
      <div className="flex items-center justify-center space-x-4">
        <div className="w-16 h-16 flex items-center justify-center">
          <img src={cxLogo} alt="CRM Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-foreground">
            {t?.systemName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t?.subtitle}
          </p>
        </div>
      </div>
      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          {t?.welcome} {t?.agentPortal}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t?.description}
        </p>
      </div>
      {/* Government Badge */}
      <div className="flex items-center justify-center space-x-2 p-3 bg-muted/50 rounded-lg border border-border">
        <Icon name="Building" size={16} className="text-primary" />
        <span className="text-xs font-medium text-foreground">
          {currentLanguage === 'ms' ? 'Kerajaan Malaysia' : 'Government of Malaysia'}
        </span>
        <Icon name="Verified" size={16} className="text-success" />
      </div>
    </div>
  );
};

export default LoginHeader;