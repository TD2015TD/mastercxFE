import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import SlaConfigurationTable from './components/SlaConfigurationTable';
import SlaRulesEngine from './components/SlaRulesEngine';
import { useTranslation } from '../../../hooks/useTranslation';
import { exportToCsv } from '../../../utils/exportCsv';

const SlaManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('configurations');
  const [stats, setStats] = useState({
    totalConfigurations: 28,
    activeSlas: 28,
    compliance: 94.2,
    breaches: 12
  });

  const tabs = [
    { 
      id: 'configurations', 
      label: t('sla.configuration.title') || 'SLA Configurations', 
      icon: 'Settings', 
      description: t('sla.configuration.configDesc') || 'Manage SLA rules and thresholds by department and priority' 
    },
    { 
      id: 'engine', 
      label: t('sla.engine.title') || 'SLA Engine', 
      icon: 'Cpu', 
      description: t('sla.engine.desc') || 'Configure SLA calculation rules and escalation thresholds' 
    }
  ];

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total SLA Rules', stats.totalConfigurations],
      ['Active SLAs', stats.activeSlas],
      ['Compliance Rate (%)', stats.compliance],
      ['SLA Breaches', stats.breaches]
    ];
    exportToCsv(rows, 'sla-report');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configurations':
        return <SlaConfigurationTable />;
      case 'engine':
        return <SlaRulesEngine />;
      default:
        return <SlaConfigurationTable />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('sla.management.title') || 'SLA Management'} - JKDM CRM Portal</title>
        <meta name="description" content={t('sla.management.description') || 'Configure and monitor Service Level Agreement (SLA) rules and performance metrics'} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Icon name="Clock" size={32} className="mr-3 text-primary" />
                {t('sla.management.title') || 'SLA Management'}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                {t('sla.management.subtitle') || 'Configure SLA rules, monitor compliance, and manage escalation thresholds'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" iconName="Download" iconPosition="left" onClick={handleExportReport}>
                {t('common.export') || 'Export'} {t('common.report') || 'Report'}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('sla.stats.totalRules') || 'Total SLA Rules'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalConfigurations}</p>
                <p className="text-sm text-success mt-2">
                  <Icon name="CheckCircle" size={14} className="inline mr-1" />
                  {t('sla.stats.allActive') || 'All Active'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="Settings" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('sla.stats.activeSlas') || 'Active SLAs'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.activeSlas}</p>
                <p className="text-sm text-muted-foreground mt-2">{t('sla.stats.tracking') || 'Currently tracking'}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon name="Activity" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('sla.stats.compliance') || 'SLA Compliance'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.compliance}%</p>
                <p className="text-sm text-success mt-2">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  {t('sla.stats.thisMonth') || '+2.1% this month'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Icon name="Target" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('sla.stats.breaches') || 'SLA Breaches'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.breaches}</p>
                <p className="text-sm text-error mt-2">
                  <Icon name="TrendingDown" size={14} className="inline mr-1" />
                  {t('sla.stats.monthPeriod') || 'This month'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Icon name="AlertTriangle" size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card rounded-lg border border-border mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="SLA Management Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 py-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Zap" size={20} className="mr-2 text-primary" />
            {t('sla.quickActions.title') || 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" iconName="Copy" iconPosition="left" fullWidth>
              {t('sla.quickActions.duplicate') || 'Duplicate Configuration'}
            </Button>
            <Button variant="outline" iconName="Download" iconPosition="left" fullWidth onClick={handleExportReport}>
              {t('sla.quickActions.exportReport') || 'Export SLA Report'}
            </Button>
          </div>
        </div>

        {/* Information Notice */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">{t('sla.info.calculationRules') || 'SLA Calculation Rules'}</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                {t('sla.info.description') || 'SLA timers automatically pause when tickets are in "On Hold" or "Pending" status. Business hours configurations respect Malaysian working hours (9 AM - 5 PM, Monday - Friday). Escalation alerts are sent when SLA breach threshold is reached (default 80%).'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlaManagement;
