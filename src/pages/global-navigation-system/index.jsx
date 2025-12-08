import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const GlobalNavigationSystem = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('main');

  const stats = [
    {
      label: 'Active Modules',
      value: '14',
      subtext: 'Available to you',
      icon: 'Grid',
      color: 'text-blue-600'
    },
    {
      label: 'Quick Links',
      value: '8',
      subtext: 'Frequently used',
      icon: 'Link',
      color: 'text-green-600'
    },
    {
      label: 'Recent',
      value: '12',
      subtext: 'Last accessed',
      icon: 'Clock',
      color: 'text-purple-600'
    },
    {
      label: 'Favorites',
      value: '6',
      subtext: 'Pinned modules',
      icon: 'Star',
      color: 'text-yellow-600'
    }
  ];

  const tabs = [
    { id: 'main', label: 'Main Modules', icon: 'Grid' },
    { id: 'admin', label: 'Administration', icon: 'Settings' },
    { id: 'favorites', label: 'Favorites', icon: 'Star' },
    { id: 'recent', label: 'Recent', icon: 'Clock' }
  ];

  const mainModules = [
    { name: 'Agent Dashboard', icon: 'LayoutDashboard', path: '/agent-dashboard', color: 'text-blue-600' },
    { name: 'Supervisor Dashboard', icon: 'Users', path: '/supervisor-dashboard', color: 'text-purple-600' },
    { name: 'Ticket Management', icon: 'Ticket', path: '/ticket-management', color: 'text-green-600' },
    { name: 'Customer 360', icon: 'User', path: '/customer-360-profile', color: 'text-orange-600' },
    { name: 'Analytics', icon: 'BarChart3', path: '/analytics-and-reporting', color: 'text-red-600' },
    { name: 'Knowledge Base', icon: 'BookOpen', path: '/knowledge-base-portal', color: 'text-indigo-600' },
    { name: 'Directory', icon: 'Users', path: '/directory-search-and-browsing', color: 'text-teal-600' },
    { name: 'Self-Service', icon: 'Globe', path: '/citizen-self-service-portal', color: 'text-pink-600' }
  ];

  const adminModules = [
    { name: 'RBAC Management', icon: 'Shield', path: '/system-administration/rbac', color: 'text-red-600' },
    { name: 'SLA Configuration', icon: 'Clock', path: '/system-administration/sla-configuration', color: 'text-orange-600' },
    { name: 'System Settings', icon: 'Settings', path: '/system-administration/settings', color: 'text-gray-600' },
    { name: 'User Management', icon: 'UserCog', path: '/system-administration/users', color: 'text-blue-600' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'main':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainModules.map((module, index) => (
              <button
                key={index}
                onClick={() => navigate(module.path)}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg cursor-pointer transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon name={module.icon} size={24} className={module.color} />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {module.name}
                </h3>
              </button>
            ))}
          </div>
        );
      
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminModules.map((module, index) => (
              <button
                key={index}
                onClick={() => navigate(module.path)}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg cursor-pointer transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon name={module.icon} size={24} className={module.color} />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {module.name}
                </h3>
              </button>
            ))}
          </div>
        );
      
      case 'favorites':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Star" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Favorite Modules</h3>
            <p className="text-muted-foreground mb-6">
              Pin your frequently used modules for quick access.
            </p>
          </div>
        );
      
      case 'recent':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Clock" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Recently Accessed</h3>
            <p className="text-muted-foreground mb-6">
              View modules you've recently accessed.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Navigation - JKDM CRM</title>
        <meta name="description" content="Navigate between CRM modules and features" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="Grid" size={32} className="mr-3 text-primary" />
                  Global Navigation System
                </h1>
                <p className="text-muted-foreground mt-2">
                  Navigate between CRM modules and features
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="Search" iconPosition="left">
                  Search
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
              {activeTab === 'main' && 'Access all main CRM modules including dashboards, ticket management, and customer profiles.'}
              {activeTab === 'admin' && 'Administrative modules for system configuration, user management, and security settings.'}
              {activeTab === 'favorites' && 'Quick access to your pinned and frequently used modules.'}
              {activeTab === 'recent' && 'Modules you have recently accessed for quick navigation.'}
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
              Quick Navigation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="justify-start" 
                iconName="LayoutDashboard" 
                iconPosition="left"
                onClick={() => navigate('/agent-dashboard')}
              >
                My Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                iconName="Ticket" 
                iconPosition="left"
                onClick={() => navigate('/ticket-management')}
              >
                Tickets
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                iconName="User" 
                iconPosition="left"
                onClick={() => navigate('/customer-360-profile')}
              >
                Customers
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                iconName="BookOpen" 
                iconPosition="left"
                onClick={() => navigate('/knowledge-base-portal')}
              >
                Knowledge Base
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default GlobalNavigationSystem;
