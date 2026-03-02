import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import TelephonyBar from '../../../components/TelephonyBar';
import DepartmentMetrics from './components/DepartmentMetrics';
import AgentPerformancePanel from './components/AgentPerformancePanel';
import SLAComplianceCenter from './components/SLAComplianceCenter';
import WorkloadManagement from './components/WorkloadManagement';
import RealtimeNotifications from './components/RealtimeNotifications';
import QuickActions from './components/QuickActions';
import { getSupervisorDashboardWidgets } from '../../../services/dashboardService';
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
    console.log('User session:', userSession);
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        console.log('Parsed user data:', userData);
        console.log('User department:', userData.department);
        
        // Use department if available, otherwise use a default
        const dept = userData.agent?.department || userData.department || 'General';
        setUserDepartment(dept);
      } catch (err) {
        console.error('Error parsing user session:', err);
        setError(t('supervisor.dashboard.errorLoading'));
      }
    } else {
      console.error('No user session found');
      setError(t('supervisor.dashboard.noSession'));
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('fetchDashboardData called, userDepartment:', userDepartment);
      if (!userDepartment) {
        console.log('No department, skipping fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Calling getSupervisorDashboardWidgets with department:', userDepartment);
        const widgets = await getSupervisorDashboardWidgets(userDepartment);
        console.log('Dashboard widgets response:', widgets);
        
        // Set widget errors separately
        const errors = {};
        if (widgets.queueError) errors.queue = widgets.queueError;
        if (widgets.teamError) errors.team = widgets.teamError;
        if (widgets.slaError) errors.sla = widgets.slaError;
        if (widgets.agentsError) errors.agents = widgets.agentsError;
        if (widgets.trendsError) errors.trends = widgets.trendsError;
        setWidgetErrors(errors);
        
        // Set successful data
        setDashboardData({
          queue: widgets.queue || { waiting: 0, in_progress: 0, on_hold: 0, total: 0 },
          team: widgets.team || { total_agents: 0, agents_online: 0, agents_available: 0, agents_busy: 0, agents_away: 0, data_source: 'error' },
          sla: widgets.sla || { total_tickets: 0, sla_breaches_today: 0, compliance_rate: 0, by_priority: {}, warnings_count: 0, on_track: 0 },
          agents: widgets.agents || [],
          trends: widgets.trends || { tickets_by_hour: [], tickets_by_priority: {} },
        });
        
        // Clear general error if at least one widget loaded
        if (widgets.queue || widgets.team || widgets.sla || widgets.agents || widgets.trends) {
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.message || t('supervisor.dashboard.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [userDepartment]);

  const handleRefresh = async () => {
    if (!userDepartment) return;
    
    try {
      setLoading(true);
      const widgets = await getSupervisorDashboardWidgets(userDepartment);
      
      // Set widget errors separately
      const errors = {};
      if (widgets.queueError) errors.queue = widgets.queueError;
      if (widgets.teamError) errors.team = widgets.teamError;
      if (widgets.slaError) errors.sla = widgets.slaError;
      if (widgets.agentsError) errors.agents = widgets.agentsError;
      if (widgets.trendsError) errors.trends = widgets.trendsError;
      setWidgetErrors(errors);
      
      // Set successful data
      setDashboardData({
        queue: widgets.queue || { waiting: 0, in_progress: 0, on_hold: 0, total: 0 },
        team: widgets.team || { total_agents: 0, agents_online: 0, agents_available: 0, agents_busy: 0, agents_away: 0, data_source: 'error' },
        sla: widgets.sla || { total_tickets: 0, sla_breaches_today: 0, compliance_rate: 0, by_priority: {}, warnings_count: 0, on_track: 0 },
        agents: widgets.agents || [],
        trends: widgets.trends || { tickets_by_hour: [], tickets_by_priority: {} },
      });
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from dashboard data
  const stats = dashboardData ? [
    {
      label: t('supervisor.dashboard.stats.teamTickets'),
      value: dashboardData.queue.waiting + dashboardData.queue.in_progress,
      subtext: `${dashboardData.queue.waiting} ${t('supervisor.dashboard.stats.unassigned')}`,
      icon: 'Ticket',
      color: 'text-blue-600',
      error: widgetErrors.queue,
      dataSource: null,
    },
    {
      label: t('supervisor.dashboard.stats.avgResponseTime'),
      value: calculateAvgResponseTime(),
      subtext: t('supervisor.dashboard.stats.target'),
      icon: 'Clock',
      color: 'text-green-600',
      error: widgetErrors.agents,
      dataSource: null,
    },
    {
      label: t('supervisor.dashboard.stats.teamSLA'),
      value: `${dashboardData.sla.compliance_rate}%`,
      subtext: getWeekComparison(),
      icon: 'TrendingUp',
      color: 'text-purple-600',
      error: widgetErrors.sla,
      dataSource: null,
    },
    {
      label: t('supervisor.dashboard.stats.agentsOnline'),
      value: `${dashboardData.team.agents_online}/${dashboardData.team.total_agents}`,
      subtext: `${dashboardData.team.agents_away} ${t('supervisor.dashboard.stats.onBreak')}`,
      icon: 'Users',
      color: 'text-orange-600',
      error: widgetErrors.team,
      dataSource: dashboardData.team.data_source,
    }
  ] : [];

  function calculateAvgResponseTime() {
    if (!dashboardData?.agents || dashboardData.agents.length === 0) return '0m';
    const withTimes = dashboardData.agents.filter(a => a.avg_resolution_time > 0);
    if (withTimes.length === 0) return '0m';
    const avgMinutes = withTimes.reduce((sum, agent) => sum + (agent.avg_resolution_time || 0), 0) / withTimes.length;
    return avgMinutes < 60 ? `${Math.round(avgMinutes)}m` : `${Math.round(avgMinutes / 60)}h`;
  }

  function getWeekComparison() {
    return '';
  }

  const tabs = [
    { id: 'overview', label: t('supervisor.dashboard.tabs.overview'), icon: 'LayoutDashboard' },
    { id: 'performance', label: t('supervisor.dashboard.tabs.performance'), icon: 'Users' },
    { id: 'sla', label: t('supervisor.dashboard.tabs.sla'), icon: 'Clock' },
    { id: 'workload', label: t('supervisor.dashboard.tabs.workload'), icon: 'BarChart3' },
    { id: 'monitoring', label: t('supervisor.dashboard.tabs.monitoring'), icon: 'Monitor' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DepartmentMetrics data={dashboardData} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <AgentPerformancePanel data={dashboardData?.agents || []} />
                <SLAComplianceCenter data={dashboardData?.sla} />
              </div>
              <div className="space-y-6">
                <RealtimeNotifications />
                <QuickActions />
              </div>
            </div>
          </div>
        );
      
      case 'performance':
        return <AgentPerformancePanel data={dashboardData?.agents || []} />;
      
      case 'sla':
        return <SLAComplianceCenter data={dashboardData?.sla} />;
      
      case 'workload':
        return <WorkloadManagement data={dashboardData} />;
      
      case 'monitoring':
        return (
          <div className="space-y-6">
            <RealtimeNotifications />
            <AgentPerformancePanel data={dashboardData?.agents || []} />
          </div>
        );
      
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
              {activeTab === 'workload' && t('supervisor.dashboard.tabDescriptions.workload')}
              {activeTab === 'monitoring' && t('supervisor.dashboard.tabDescriptions.monitoring')}
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
