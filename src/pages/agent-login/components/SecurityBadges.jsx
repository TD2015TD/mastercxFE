import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const translations = {
    en: {
      ismsCompliant: 'ISMS Compliant',
      govCertified: 'Government Certified',
      securePortal: 'Secure Portal',
      dataProtection: 'Data Protection Act Compliant',
      iso27001: 'ISO 27001 Certified',
      encryption: '256-bit SSL Encryption'
    },
    ms: {
      ismsCompliant: 'Patuh ISMS',
      govCertified: 'Diperakui Kerajaan',
      securePortal: 'Portal Selamat',
      dataProtection: 'Patuh Akta Perlindungan Data',
      iso27001: 'Diperakui ISO 27001',
      encryption: 'Enkripsi SSL 256-bit'
    }
  };

  const t = translations?.[currentLanguage];

  const securityBadges = [
    {
      icon: 'Shield',
      label: t?.govCertified,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: 'Lock',
      label: t?.ismsCompliant,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: 'Award',
      label: t?.iso27001,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      icon: 'Key',
      label: t?.encryption,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-medium text-foreground mb-3">
          {t?.securePortal}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {securityBadges?.map((badge, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 p-3 rounded-lg ${badge?.bgColor} border border-border/50`}
          >
            <Icon 
              name={badge?.icon} 
              size={16} 
              className={badge?.color}
            />
            <span className="text-xs font-medium text-foreground">
              {badge?.label}
            </span>
          </div>
        ))}
      </div>
      <div className="text-center pt-2">
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Icon name="CheckCircle" size={14} className="text-success" />
          <span>{t?.dataProtection}</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;