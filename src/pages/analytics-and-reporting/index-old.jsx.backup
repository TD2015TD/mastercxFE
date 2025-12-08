import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import MetricsOverview from './components/MetricsOverview';
import TicketVolumeChart from './components/TicketVolumeChart';
import SLAPerformanceChart from './components/SLAPerformanceChart';
import ReportBuilder from './components/ReportBuilder';
import AgentPerformanceTable from './components/AgentPerformanceTable';
import DashboardPersonalization from './components/DashboardPersonalization';

const AnalyticsAndReporting = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last_7_days');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const content = {
    en: {
      title: 'Analytics & Reporting',
      subtitle: 'Comprehensive performance insights and custom report generation',
      tabs: {
        overview: 'Dashboard Overview',
        reports: 'Custom Reports',
        performance: 'Agent Performance',
        personalization: 'Personalization'
      },
      filters: {
        dateRange: 'Date Range',
        department: 'Department',
        export: 'Export Data',
        refresh: 'Refresh Data'
      },
      dateRangeOptions: [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'last_quarter', label: 'Last Quarter' },
        { value: 'this_year', label: 'This Year' }
      ],
      departmentOptions: [
        { value: 'all', label: 'All Departments' },
        { value: 'customs_declaration', label: 'Customs Declaration' },
        { value: 'tax_duties', label: 'Tax & Duties' },
        { value: 'import_export', label: 'Import/Export' },
        { value: 'general_inquiry', label: 'General Inquiry' },
        { value: 'technical_support', label: 'Technical Support' }
      ]
    },
    ms: {
      title: 'Analitik & Pelaporan',
      subtitle: 'Wawasan prestasi menyeluruh dan penjanaan laporan tersuai',
      tabs: {
        overview: 'Gambaran Keseluruhan',
        reports: 'Laporan Tersuai',
        performance: 'Prestasi Ejen',
        personalization: 'Personalisasi'
      },
      filters: {
        dateRange: 'Julat Tarikh',
        department: 'Jabatan',
        export: 'Eksport Data',
        refresh: 'Muat Semula Data'
      },
      dateRangeOptions: [
        { value: 'today', label: 'Hari Ini' },
        { value: 'yesterday', label: 'Semalam' },
        { value: 'last_7_days', label: '7 Hari Lepas' },
        { value: 'last_30_days', label: '30 Hari Lepas' },
        { value: 'this_month', label: 'Bulan Ini' },
        { value: 'last_month', label: 'Bulan Lepas' },
        { value: 'this_quarter', label: 'Suku Tahun Ini' },
        { value: 'last_quarter', label: 'Suku Tahun Lepas' },
        { value: 'this_year', label: 'Tahun Ini' }
      ],
      departmentOptions: [
        { value: 'all', label: 'Semua Jabatan' },
        { value: 'customs_declaration', label: 'Pengisytiharan Kastam' },
        { value: 'tax_duties', label: 'Cukai & Duti' },
        { value: 'import_export', label: 'Import/Eksport' },
        { value: 'general_inquiry', label: 'Pertanyaan Am' },
        { value: 'technical_support', label: 'Sokongan Teknikal' }
      ]
    }
  };

  const t = content?.[currentLanguage];

  const tabs = [
    { id: 'overview', label: t?.tabs?.overview, icon: 'BarChart3' },
    { id: 'reports', label: t?.tabs?.reports, icon: 'FileText' },
    { id: 'performance', label: t?.tabs?.performance, icon: 'Users' },
    { id: 'personalization', label: t?.tabs?.personalization, icon: 'Settings' }
  ];

  const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleExportData = () => {
    // Simulate export functionality
    const exportData = {
      dateRange,
      department: selectedDepartment,
      timestamp: new Date()?.toISOString(),
      format: 'excel'
    };
    
    console.log('Exporting data:', exportData);
    alert('Export started! You will receive a download link shortly.');
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/supervisor-dashboard' },
    { label: t?.title, path: '/analytics-and-reporting', isActive: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{t?.title}</h1>
                <p className="mt-2 text-muted-foreground">{t?.subtitle}</p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-3">
                  <Select
                    options={t?.dateRangeOptions}
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-40"
                  />
                  
                  <Select
                    options={t?.departmentOptions}
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    className="w-48"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    iconName="RefreshCw"
                    iconPosition="left"
                    loading={isLoading}
                    onClick={handleRefreshData}
                    size="sm"
                  >
                    {t?.filters?.refresh}
                  </Button>
                  
                  <Button
                    variant="outline"
                    iconName="Download"
                    iconPosition="left"
                    onClick={handleExportData}
                    size="sm"
                  >
                    {t?.filters?.export}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon name={tab?.icon} size={18} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Overview */}
            <MetricsOverview dateRange={dateRange} />
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <TicketVolumeChart />
              <SLAPerformanceChart />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            <ReportBuilder />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            <AgentPerformanceTable />
          </div>
        )}

        {activeTab === 'personalization' && (
          <div className="space-y-8">
            <DashboardPersonalization />
          </div>
        )}
      </div>
      {/* Quick Actions Floating Button - Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <div className="relative">
          <Button
            variant="default"
            iconName="Plus"
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={() => setActiveTab('reports')}
          />
        </div>
      </div>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <Icon name="RefreshCw" size={20} className="text-primary" />
              </div>
              <span className="text-foreground font-medium">Refreshing data...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsAndReporting;