import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import UserManagementPanel from './components/UserManagementPanel';
import SystemConfigurationPanel from './components/SystemConfigurationPanel';
import AuditTrailCenter from './components/AuditTrailCenter';
import ComplianceDashboard from './components/ComplianceDashboard';
import SystemHealthMonitor from './components/SystemHealthMonitor';

const SystemAdministration = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'User Management', icon: 'Users', description: 'Manage user accounts and permissions' },
    { id: 'system', label: 'System Config', icon: 'Settings', description: 'Configure system parameters' },
    { id: 'audit', label: 'Audit Trail', icon: 'FileText', description: 'View system activity logs' },
    { id: 'compliance', label: 'Compliance', icon: 'Shield', description: 'Monitor compliance status' },
    { id: 'health', label: 'System Health', icon: 'Activity', description: 'Monitor system performance' }
  ];

  const systemStats = [
    {
      title: "Active Users",
      value: "247",
      change: "+12",
      changeType: "increase",
      icon: "Users",
      color: "text-blue-600"
    },
    {
      title: "System Uptime",
      value: "99.8%",
      change: "+0.2%",
      changeType: "increase",
      icon: "Activity",
      color: "text-success"
    },
    {
      title: "Security Score",
      value: "94/100",
      change: "+2",
      changeType: "increase",
      icon: "Shield",
      color: "text-success"
    },
    {
      title: "Compliance Rate",
      value: "98.5%",
      change: "0%",
      changeType: "stable",
      icon: "CheckCircle",
      color: "text-success"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementPanel />;
      case 'system':
        return <SystemConfigurationPanel />;
      case 'audit':
        return <AuditTrailCenter />;
      case 'compliance':
        return <ComplianceDashboard />;
      case 'health':
        return <SystemHealthMonitor />;
      default:
        return <UserManagementPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>System Administration - JKDM CRM Portal</title>
        <meta name="description" content="Comprehensive system administration interface for JKDM CRM Portal with user management, system configuration, and compliance monitoring." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Comprehensive system configuration and management console
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" iconName="Download" iconPosition="left">
                Export Report
              </Button>
              <Button variant="default" iconName="Settings" iconPosition="left">
                System Settings
              </Button>
            </div>
          </div>
        </div>

        {/* System Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats?.map((stat, index) => (
            <div key={index} className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat?.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat?.value}</p>
                  <div className="flex items-center mt-2">
                    <Icon 
                      name={stat?.changeType === 'increase' ? 'TrendingUp' : 
                            stat?.changeType === 'decrease' ? 'TrendingDown' : 'Minus'} 
                      size={16} 
                      className={`mr-1 ${
                        stat?.changeType === 'increase' ? 'text-success' :
                        stat?.changeType === 'decrease' ? 'text-error' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={`text-sm font-medium ${
                      stat?.changeType === 'increase' ? 'text-success' :
                      stat?.changeType === 'decrease' ? 'text-error' : 'text-muted-foreground'
                    }`}>
                      {stat?.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <Icon name={stat?.icon} size={24} className={stat?.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card rounded-lg border border-border mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Administration Tabs">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={20} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 py-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {tabs?.find(tab => tab?.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" iconName="UserPlus" iconPosition="left" fullWidth>
              Add New User
            </Button>
            <Button variant="outline" iconName="Database" iconPosition="left" fullWidth>
              Create Backup
            </Button>
            <Button variant="outline" iconName="Download" iconPosition="left" fullWidth>
              Export Audit Log
            </Button>
            <Button variant="outline" iconName="RefreshCw" iconPosition="left" fullWidth>
              System Health Check
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>JKDM CRM Portal System Administration</p>
          <p className="mt-1">
            © {new Date()?.getFullYear()} Jabatan Kastam Diraja Malaysia. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemAdministration;