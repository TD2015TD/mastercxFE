import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import TelephonyBar from '../../components/TelephonyBar';
import MetricsOverview from './components/MetricsOverview';
import TicketVolumeChart from './components/TicketVolumeChart';
import SLAPerformanceChart from './components/SLAPerformanceChart';
import ReportBuilder from './components/ReportBuilder';
import AgentPerformanceTable from './components/AgentPerformanceTable';
import DashboardPersonalization from './components/DashboardPersonalization';

const AnalyticsAndReporting = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('last_7_days');

  const stats = [
    {
      label: 'Reports Generated',
      value: '142',
      subtext: '+18 this week',
      icon: 'FileText',
      color: 'text-blue-600'
    },
    {
      label: 'Scheduled Reports',
      value: '24',
      subtext: '8 active',
      icon: 'Calendar',
      color: 'text-green-600'
    },
    {
      label: 'Data Freshness',
      value: '2m',
      subtext: 'Last updated',
      icon: 'RefreshCw',
      color: 'text-purple-600'
    },
    {
      label: 'Export Count',
      value: '89',
      subtext: 'This month',
      icon: 'Download',
      color: 'text-orange-600'
    }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'kpi', label: 'KPI Metrics', icon: 'TrendingUp' },
    { id: 'export', label: 'Export Center', icon: 'Download' },
    { id: 'scheduled', label: 'Scheduled Reports', icon: 'Calendar' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <MetricsOverview />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TicketVolumeChart />
              <SLAPerformanceChart />
            </div>
            <AgentPerformanceTable />
          </div>
        );
      
      case 'reports':
        return <ReportBuilder />;
      
      case 'kpi':
        return (
          <div className="space-y-6">
            <MetricsOverview />
            <SLAPerformanceChart />
          </div>
        );
      
      case 'export':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Download" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Export Center</h3>
            <p className="text-muted-foreground mb-6">
              Export reports and data in various formats (CSV, Excel, PDF).
            </p>
            <div className="flex justify-center gap-3">
              <Button iconName="FileSpreadsheet" iconPosition="left">Export CSV</Button>
              <Button variant="outline" iconName="FileText" iconPosition="left">Export PDF</Button>
            </div>
          </div>
        );
      
      case 'scheduled':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Scheduled Reports</h3>
            <p className="text-muted-foreground mb-6">
              Manage automated report generation and distribution schedules.
            </p>
            <Button iconName="Plus" iconPosition="left">Schedule New Report</Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Analytics & Reporting - JKDM CRM</title>
        <meta name="description" content="Comprehensive performance insights and custom report generation" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TelephonyBar />
        
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <BreadcrumbNavigation />

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="BarChart3" size={32} className="mr-3 text-primary" />
                  Analytics & Reporting
                </h1>
                <p className="text-muted-foreground mt-2">
                  Comprehensive performance insights and custom report generation
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-48">
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="this_quarter">This Quarter</option>
                </Select>
                <Button variant="outline" iconName="RefreshCw" iconPosition="left">
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    <Icon name={stat.icon} size={20} />
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
              {activeTab === 'dashboard' && 'Real-time dashboard with key performance indicators, ticket volumes, and SLA compliance metrics.'}
              {activeTab === 'reports' && 'Build and customize reports with flexible filters and data visualization options.'}
              {activeTab === 'kpi' && 'Track key performance indicators and business metrics across all departments.'}
              {activeTab === 'export' && 'Export data and reports in multiple formats for external analysis and sharing.'}
              {activeTab === 'scheduled' && 'Automate report generation and distribution on recurring schedules.'}
            </p>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="Zap" size={20} className="mr-2 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start" iconName="FileText" iconPosition="left">
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start" iconName="Calendar" iconPosition="left">
                Schedule Report
              </Button>
              <Button variant="outline" className="justify-start" iconName="Download" iconPosition="left">
                Export Data
              </Button>
              <Button variant="outline" className="justify-start" iconName="TrendingUp" iconPosition="left">
                View KPIs
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AnalyticsAndReporting;
