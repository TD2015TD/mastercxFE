import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import AgentPerformancePanel from './components/AgentPerformancePanel';
import SLAComplianceCenter from './components/SLAComplianceCenter';
import QuickActions from './components/QuickActions';
import { getQueueStats, getSlaStats, getAgentPerformance } from '../../../services/dashboardService';
import { languageService } from '../../../services/languageService';

const SupervisorDashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [widgetErrors, setWidgetErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);

  // Load translations
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
    loadTranslations(savedLanguage);
  }, []);

  const loadTranslations = async (locale) => {
    try {
      const translations = await languageService.getTranslations(locale);
      setTranslations(translations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      setTranslations({});
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value || key;
  };

  // Get user department from session
  useEffect(() => {
    const userSession = localStorage.getItem('user-session');
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        // supervisor may not have an agent record — use department if available, else null (= all departments)
        const dept = userData.agent?.department || userData.department || null;
        setUserDepartment(dept ?? 'all');
      } catch (err) {
        console.error('Error parsing user session:', err);
        setUserDepartment('all');
      }
    } else {
      setUserDepartment('all');
    }
  }, []);

  // Fetch dashboard data — only real DB-backed widgets
  const fetchDashboardData = async () => {
    if (!userDepartment) return;
    try {
      setLoading(true);
      // Pass department only when a real department is selected (not 'all')
      const dept = userDepartment === 'all' ? undefined : userDepartment;
      const [queueRes, slaRes, agentsRes] = await Promise.allSettled([
        getQueueStats(dept),
        getSlaStats(dept),
        getAgentPerformance(dept),
      ]);

      const errors = {};
      if (queueRes.status === 'rejected') errors.queue = queueRes.reason;
      if (slaRes.status === 'rejected') errors.sla = slaRes.reason;
      if (agentsRes.status === 'rejected') errors.agents = agentsRes.reason;
      setWidgetErrors(errors);

      setDashboardData({
        queue: queueRes.status === 'fulfilled' ? queueRes.value.data : { waiting: 0, in_progress: 0, on_hold: 0 },
        sla: slaRes.status === 'fulfilled' ? slaRes.value.data : { total_tickets: 0, sla_breaches_today: 0, compliance_rate: 0, by_priority: {}, warnings_count: 0, on_track: 0 },
        agents: agentsRes.status === 'fulfilled' ? agentsRes.value.data : [],
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [userDepartment]);

  const handleRefresh = () => fetchDashboardData();

  // Stats derived purely from DB data — no Mitel dependency
  const stats = dashboardData ? [
    {
      label: 'Open Tickets',
      value: (dashboardData.queue.waiting || 0) + (dashboardData.queue.in_progress || 0),
      subtext: `${dashboardData.queue.waiting || 0} unassigned · ${dashboardData.queue.in_progress || 0} in progress`,
      icon: 'Ticket',
      color: 'text-blue-600',
      error: widgetErrors.queue,
    },
    {
      label: 'On Hold',
      value: dashboardData.queue.on_hold || 0,
      subtext: 'Awaiting customer response',
      icon: 'PauseCircle',
      color: 'text-yellow-600',
      error: widgetErrors.queue,
    },
  ] : [];

  const tabs = [
    { id: 'overview', label: t('supervisor.dashboard.tabs.overview'), icon: 'LayoutDashboard' },
    { id: 'performance', label: t('supervisor.dashboard.tabs.performance'), icon: 'Users' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <AgentPerformancePanel data={dashboardData?.agents || []} />
                <SLAComplianceCenter data={dashboardData?.sla} />
              </div>
              <div className="space-y-6">
                <QuickActions />
              </div>
            </div>
          </div>
        );
      
      case 'performance':
        return <AgentPerformancePanel data={dashboardData?.agents || []} />;
      
      case 'sla':
        return <SLAComplianceCenter data={dashboardData?.sla} />;
      
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('supervisor.dashboard.title')} - JKDM CRM</title>
        <meta name="description" content={t('supervisor.dashboard.subtitle')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        
        <main className="container mx-auto px-6 py-8 max-w-7xl">

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="LayoutDashboard" size={32} className="mr-3 text-primary" />
                  {t('supervisor.dashboard.title')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('supervisor.dashboard.subtitle')}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  iconName="RefreshCw" 
                  iconPosition="left"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? t('supervisor.dashboard.refreshing') : t('supervisor.dashboard.refresh')}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {loading && !dashboardData ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader" size={32} className="animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">{t('supervisor.dashboard.loading')}</span>
            </div>
          ) : error ? (
            <div className="bg-error/10 border border-error/20 rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <Icon name="AlertTriangle" size={24} className="text-error mr-3" />
                <div>
                  <h3 className="font-semibold text-error">{t('supervisor.dashboard.errorLoading')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-card rounded-lg border p-6 ${stat.error ? 'border-error/40 bg-error/5' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    {stat.error ? (
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-error">Error</p>
                        <p className="text-xs text-error/80">{stat.error?.response?.data?.message || 'Failed to load'}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                        {stat.dataSource && (
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              stat.dataSource === 'mitel_api' 
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {stat.dataSource === 'mitel_api' ? '🟢 Live' : '🟡 Cached'}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.error ? 'bg-error/20 text-error' : `bg-primary/10 ${stat.color}`}`}>
                    <Icon name={stat.error ? 'AlertTriangle' : stat.icon} size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Description */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'overview' && t('supervisor.dashboard.tabDescriptions.overview')}
              {activeTab === 'performance' && t('supervisor.dashboard.tabDescriptions.performance')}
              {activeTab === 'sla' && t('supervisor.dashboard.tabDescriptions.sla')}
            </p>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

            </>
          )}
        </main>
      </div>
    </>
  );
};

export default SupervisorDashboard;
