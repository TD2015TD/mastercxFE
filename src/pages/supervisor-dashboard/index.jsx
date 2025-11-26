import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import DepartmentMetrics from './components/DepartmentMetrics';
import AgentPerformancePanel from './components/AgentPerformancePanel';
import SLAComplianceCenter from './components/SLAComplianceCenter';
import WorkloadManagement from './components/WorkloadManagement';
import RealtimeNotifications from './components/RealtimeNotifications';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeView, setActiveView] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  const mockUser = {
    name: "Supervisor Ahmad Zaki",
    email: "ahmad.zaki@jkdm.gov.my",
    role: "supervisor",
    department: "Customer Service Operations",
    avatar: "https://images.unsplash.com/photo-1585066047759-3438c34cf676",
    avatarAlt: "Professional headshot of Malaysian supervisor with beard in dark suit"
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const viewTabs = [
  {
    id: 'overview',
    label: currentLanguage === 'ms' ? 'Gambaran Keseluruhan' : 'Overview',
    icon: 'LayoutDashboard'
  },
  {
    id: 'performance',
    label: currentLanguage === 'ms' ? 'Prestasi Ejen' : 'Agent Performance',
    icon: 'Users'
  },
  {
    id: 'sla',
    label: currentLanguage === 'ms' ? 'Pematuhan SLA' : 'SLA Compliance',
    icon: 'Clock'
  },
  {
    id: 'workload',
    label: currentLanguage === 'ms' ? 'Pengurusan Beban Kerja' : 'Workload Management',
    icon: 'BarChart3'
  }];


  const formatLastUpdated = (date) => {
    return date?.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
  };

  const handleNavigateToReports = () => {
    navigate('/analytics-and-reporting');
  };

  const handleNavigateToTickets = () => {
    navigate('/ticket-management');
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'performance':
        return <AgentPerformancePanel />;
      case 'sla':
        return <SLAComplianceCenter />;
      case 'workload':
        return <WorkloadManagement />;
      default:
        return (
          <div className="space-y-6">
            <DepartmentMetrics />
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <AgentPerformancePanel />
                <SLAComplianceCenter />
              </div>
              
              <div className="space-y-6">
                <RealtimeNotifications />
                <QuickActions />
              </div>
            </div>
          </div>);

    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} onMenuToggle={handleMenuToggle} />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <BreadcrumbNavigation />
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {currentLanguage === 'ms' ? 'Papan Pemuka Penyelia' : 'Supervisor Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {currentLanguage === 'ms' ? 'Pantau prestasi pasukan, pematuhan SLA, dan pengurusan beban kerja' : 'Monitor team performance, SLA compliance, and workload management'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {currentLanguage === 'ms' ? 'Dikemas kini terakhir' : 'Last updated'}: {formatLastUpdated(lastUpdated)}
              </div>
              
              <button
                onClick={() => setLastUpdated(new Date())}
                className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
                title={currentLanguage === 'ms' ? 'Muat semula data' : 'Refresh data'}>

                <Icon name="RefreshCw" size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 overflow-x-auto">
              {viewTabs?.map((tab) =>
              <button
                key={tab?.id}
                onClick={() => handleViewChange(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeView === tab?.id ?
                'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'}`
                }>

                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {renderActiveView()}
        </div>

        {/* Quick Navigation Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={handleNavigateToTickets}
              className="p-6 bg-card border border-border rounded-lg hover:shadow-sm transition-all duration-200 text-left group">

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                  <Icon name="Ticket" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                    {currentLanguage === 'ms' ? 'Pengurusan Tiket' : 'Ticket Management'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'ms' ? 'Urus tiket dan tugasan' : 'Manage tickets and assignments'}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleNavigateToReports}
              className="p-6 bg-card border border-border rounded-lg hover:shadow-sm transition-all duration-200 text-left group">

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors duration-200">
                  <Icon name="BarChart3" size={24} className="text-secondary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-secondary transition-colors duration-200">
                    {currentLanguage === 'ms' ? 'Analitik & Laporan' : 'Analytics & Reports'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'ms' ? 'Lihat laporan terperinci' : 'View detailed reports'}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/knowledge-base-portal')}
              className="p-6 bg-card border border-border rounded-lg hover:shadow-sm transition-all duration-200 text-left group">

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
                  <Icon name="BookOpen" size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-accent transition-colors duration-200">
                    {currentLanguage === 'ms' ? 'Pangkalan Pengetahuan' : 'Knowledge Base'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'ms' ? 'Akses artikel dan dokumentasi' : 'Access articles and documentation'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>);

};

export default SupervisorDashboard;