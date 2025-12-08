import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LanguageToggle from './components/LanguageToggle';
import CitizenAuthModal from './components/CitizenAuthModal';
import ComplaintSubmissionForm from './components/ComplaintSubmissionForm';
import CaseTrackingPanel from './components/CaseTrackingPanel';
import KnowledgeBaseSearch from './components/KnowledgeBaseSearch';
import SuccessModal from './components/SuccessModal';

const CitizenSelfServicePortal = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('submit');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [citizenData, setCitizenData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);

    // Check for existing citizen authentication
    const savedCitizenData = localStorage.getItem('citizen-auth');
    if (savedCitizenData) {
      setCitizenData(JSON.parse(savedCitizenData));
    }
  }, []);

  const content = {
    en: {
      title: 'Citizen Self Service Portal',
      subtitle: 'Submit complaints, track cases, and access government services',
      description: 'Secure portal for Malaysian citizens to interact with Jabatan Kastam Diraja Malaysia (JKDM) services',
      loginRequired: 'Secure Login Required',
      loginDesc: 'Please authenticate to access citizen services',
      loginButton: 'Login with IC & OTP',
      welcomeBack: 'Welcome back',
      logoutButton: 'Logout',
      tabs: {
        submit: 'Submit Complaint',
        track: 'Track Cases',
        knowledge: 'Knowledge Base'
      },
      features: {
        secure: 'Secure Authentication',
        secureDesc: 'OTP verification with IC number',
        tracking: 'Real-time Tracking',
        trackingDesc: 'Monitor complaint status and updates',
        support: '24/7 Support',
        supportDesc: 'Access help articles and FAQs',
        multilingual: 'Multilingual Support',
        multilingualDesc: 'Available in English and Bahasa Malaysia'
      },
      footer: {
        copyright: 'Government of Malaysia',
        department: 'Jabatan Kastam Diraja Malaysia (JKDM)',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        contact: 'Contact Us',
        help: 'Help & Support'
      }
    },
    ms: {
      title: 'Portal Layan Diri Warganegara',
      subtitle: 'Hantar aduan, jejak kes, dan akses perkhidmatan kerajaan',
      description: 'Portal selamat untuk warganegara Malaysia berinteraksi dengan perkhidmatan Jabatan Kastam Diraja Malaysia (JKDM)',
      loginRequired: 'Log Masuk Selamat Diperlukan',
      loginDesc: 'Sila sahkan untuk mengakses perkhidmatan warganegara',
      loginButton: 'Log Masuk dengan IC & OTP',
      welcomeBack: 'Selamat kembali',
      logoutButton: 'Log Keluar',
      tabs: {
        submit: 'Hantar Aduan',
        track: 'Jejak Kes',
        knowledge: 'Pangkalan Pengetahuan'
      },
      features: {
        secure: 'Pengesahan Selamat',
        secureDesc: 'Pengesahan OTP dengan nombor IC',
        tracking: 'Penjejakan Masa Nyata',
        trackingDesc: 'Pantau status dan kemaskini aduan',
        support: 'Sokongan 24/7',
        supportDesc: 'Akses artikel bantuan dan FAQ',
        multilingual: 'Sokongan Berbilang Bahasa',
        multilingualDesc: 'Tersedia dalam Bahasa Inggeris dan Bahasa Malaysia'
      },
      footer: {
        copyright: 'Kerajaan Malaysia',
        department: 'Jabatan Kastam Diraja Malaysia (JKDM)',
        privacy: 'Dasar Privasi',
        terms: 'Terma Perkhidmatan',
        contact: 'Hubungi Kami',
        help: 'Bantuan & Sokongan'
      }
    }
  };

  const t = content?.[currentLanguage];

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
  };

  const handleAuthentication = (userData) => {
    setCitizenData(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('citizen-auth');
    setCitizenData(null);
    setActiveTab('submit');
  };

  const handleComplaintSubmitSuccess = (complaintData) => {
    setSubmittedComplaint(complaintData);
    setIsSuccessModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    setSubmittedComplaint(null);
    setActiveTab('track');
  };

  const features = [
    {
      icon: 'Shield',
      title: t?.features?.secure,
      description: t?.features?.secureDesc
    },
    {
      icon: 'Search',
      title: t?.features?.tracking,
      description: t?.features?.trackingDesc
    },
    {
      icon: 'Clock',
      title: t?.features?.support,
      description: t?.features?.supportDesc
    },
    {
      icon: 'Globe',
      title: t?.features?.multilingual,
      description: t?.features?.multilingualDesc
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t?.title} - JKDM CRM Portal</title>
        <meta name="description" content={t?.description} />
        <meta name="keywords" content="JKDM, customs, citizen portal, complaints, Malaysia" />
      </Helmet>
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{t?.title}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t?.subtitle}</p>
              </div>
            </div>

            {/* Language Toggle and Auth */}
            <div className="flex items-center space-x-4">
              <LanguageToggle 
                currentLanguage={currentLanguage} 
                onLanguageChange={handleLanguageChange} 
              />
              
              {citizenData ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-foreground">{t?.welcomeBack}</p>
                    <p className="text-xs text-muted-foreground">{citizenData?.name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    iconName="LogOut"
                    iconPosition="left"
                  >
                    <span className="hidden sm:inline">{t?.logoutButton}</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  iconName="User"
                  iconPosition="left"
                >
                  <span className="hidden sm:inline">{t?.loginButton}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!citizenData ? (
          /* Unauthenticated View */
          (<div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Shield" size={40} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">{t?.title}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t?.subtitle}</p>
              
              {/* Login Prompt */}
              <div className="bg-card border border-border rounded-lg p-8 mb-12">
                <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t?.loginRequired}</h3>
                <p className="text-muted-foreground mb-6">{t?.loginDesc}</p>
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="lg"
                  iconName="User"
                  iconPosition="left"
                >
                  {t?.loginButton}
                </Button>
              </div>
            </div>
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features?.map((feature, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon name={feature?.icon} size={24} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature?.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature?.description}</p>
                </div>
              ))}
            </div>
          </div>)
        ) : (
          /* Authenticated View */
          (<div>
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-border">
                <nav className="flex space-x-8">
                  {Object.entries(t?.tabs)?.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === key
                          ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            {/* Tab Content */}
            <div>
              {activeTab === 'submit' && (
                <ComplaintSubmissionForm
                  language={currentLanguage}
                  citizenData={citizenData}
                  onSubmitSuccess={handleComplaintSubmitSuccess}
                />
              )}
              
              {activeTab === 'track' && (
                <CaseTrackingPanel
                  language={currentLanguage}
                  citizenData={citizenData}
                />
              )}
              
              {activeTab === 'knowledge' && (
                <KnowledgeBaseSearch
                  language={currentLanguage}
                />
              )}
            </div>
          </div>)
        )}
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={20} color="white" />
                </div>
                <span className="font-semibold text-foreground">{t?.footer?.department}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t?.description}</p>
              <div className="flex items-center space-x-4">
                <LanguageToggle 
                  currentLanguage={currentLanguage} 
                  onLanguageChange={handleLanguageChange} 
                />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-medium text-foreground mb-4">
                {currentLanguage === 'en' ? 'Quick Links' : 'Pautan Pantas'}
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">{t?.footer?.privacy}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">{t?.footer?.terms}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">{t?.footer?.help}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-medium text-foreground mb-4">{t?.footer?.contact}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📞 +60 3-8882 2000</p>
                <p>✉️ info@customs.gov.my</p>
                <p>🕒 {currentLanguage === 'en' ? 'Mon-Fri 8AM-5PM' : 'Isnin-Jumaat 8AM-5PM'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              2025 CX CRM Solution Suite for Gov. of Malaysia. All Right Reserved
            </p>
          </div>
        </div>
      </footer>
      {/* Modals */}
      <CitizenAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleAuthentication}
        language={currentLanguage}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        complaintData={submittedComplaint}
        language={currentLanguage}
      />
    </div>
  );
};

export default CitizenSelfServicePortal;