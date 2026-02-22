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
      securePortal: 'Secure Portal',
      https: 'HTTPS Secure Communication',
      rbac: 'Role-Based Access Control (RBAC)',
      auditTrail: 'Activity Logging & Audit Trail',
      encryption: 'Data Encryption in Transit'
    },
    ms: {
      securePortal: 'Portal Selamat',
      https: 'Komunikasi Selamat HTTPS',
      rbac: 'Kawalan Akses Berasaskan Peranan (RBAC)',
      auditTrail: 'Pengelogan Aktiviti & Jejak Audit',
      encryption: 'Penyulitan Data Semasa Penghantaran'
    }
  };

  const t = translations?.[currentLanguage];

  const securityBadges = [
    {
      icon: 'Lock',
      label: t?.https,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: 'ShieldCheck',
      label: t?.rbac,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: 'ClipboardList',
      label: t?.auditTrail,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      icon: 'KeyRound',
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
    </div>
  );
};

export default SecurityBadges;
