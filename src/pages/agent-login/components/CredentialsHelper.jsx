import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CredentialsHelper = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const translations = {
    en: {
      demoCredentials: 'Demo Credentials',
      testAccounts: 'Test Accounts Available',
      agent: 'Agent Account',
      supervisor: 'Supervisor Account',
      admin: 'Admin Account',
      username: 'Username',
      password: 'Password',
      hideCredentials: 'Hide Credentials',
      showCredentials: 'Show Demo Credentials'
    },
    ms: {
      demoCredentials: 'Kelayakan Demo',
      testAccounts: 'Akaun Ujian Tersedia',
      agent: 'Akaun Ejen',
      supervisor: 'Akaun Penyelia',
      admin: 'Akaun Pentadbir',
      username: 'Nama Pengguna',
      password: 'Kata Laluan',
      hideCredentials: 'Sembunyikan Kelayakan',
      showCredentials: 'Tunjukkan Kelayakan Demo'
    }
  };

  const t = translations?.[currentLanguage];

  const mockCredentials = [
    {
      role: t?.agent,
      username: 'agent001',
      password: 'Agent@123',
      icon: 'User',
      color: 'text-primary'
    },
    {
      role: t?.supervisor,
      username: 'supervisor001',
      password: 'Super@123',
      icon: 'UserCheck',
      color: 'text-accent'
    },
    {
      role: t?.admin,
      username: 'admin001',
      password: 'Admin@123',
      icon: 'Settings',
      color: 'text-secondary'
    }
  ];

  return (
    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">
            {t?.testAccounts}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          iconName={isVisible ? 'EyeOff' : 'Eye'}
          iconPosition="left"
        >
          {isVisible ? t?.hideCredentials : t?.showCredentials}
        </Button>
      </div>
      {isVisible && (
        <div className="space-y-3">
          {mockCredentials?.map((cred, index) => (
            <div
              key={index}
              className="p-3 bg-card rounded-md border border-border"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon name={cred?.icon} size={16} className={cred?.color} />
                <span className="text-sm font-medium text-foreground">
                  {cred?.role}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">{t?.username}:</span>
                  <div className="font-mono bg-muted/50 p-1 rounded mt-1">
                    {cred?.username}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t?.password}:</span>
                  <div className="font-mono bg-muted/50 p-1 rounded mt-1">
                    {cred?.password}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialsHelper;