import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DirectorySearchAndBrowsing = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    {
      label: 'Total Contacts',
      value: '1,842',
      subtext: '24 departments',
      icon: 'Users',
      color: 'text-blue-600'
    },
    {
      label: 'Departments',
      value: '24',
      subtext: '8 regions',
      icon: 'Building',
      color: 'text-green-600'
    },
    {
      label: 'Active Users',
      value: '1,456',
      subtext: '79% online rate',
      icon: 'UserCheck',
      color: 'text-purple-600'
    },
    {
      label: 'Recent Searches',
      value: '342',
      subtext: 'Today',
      icon: 'Search',
      color: 'text-orange-600'
    }
  ];

  const tabs = [
    { id: 'search', label: 'Search Directory', icon: 'Search' },
    { id: 'browse', label: 'Browse by Department', icon: 'Building' },
    { id: 'favorites', label: 'Favorites', icon: 'Star' },
    { id: 'recent', label: 'Recent Contacts', icon: 'Clock' },
    { id: 'org-chart', label: 'Org Chart', icon: 'Network' }
  ];

  const mockDepartments = [
    { name: 'Customs Declaration', count: 186, icon: 'FileText' },
    { name: 'Tax & Duties', count: 142, icon: 'DollarSign' },
    { name: 'Import/Export', count: 224, icon: 'Package' },
    { name: 'Technical Support', count: 98, icon: 'Wrench' },
    { name: 'General Inquiry', count: 312, icon: 'HelpCircle' },
    { name: 'Compliance', count: 156, icon: 'Shield' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Search Directory</h3>
            <p className="text-muted-foreground mb-6">
              Search for contacts by name, department, role, or email.
            </p>
            <div className="max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search by name, department, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
          </div>
        );
      
      case 'browse':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDepartments.map((dept, index) => (
                <div key={index} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg cursor-pointer transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name={dept.icon} size={24} className="text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{dept.count} contacts</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{dept.name}</h3>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'favorites':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Star" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Favorite Contacts</h3>
            <p className="text-muted-foreground mb-6">
              Quick access to your frequently contacted colleagues.
            </p>
          </div>
        );
      
      case 'recent':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Clock" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Recent Contacts</h3>
            <p className="text-muted-foreground mb-6">
              View contacts you've recently viewed or interacted with.
            </p>
          </div>
        );
      
      case 'org-chart':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Network" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Organization Chart</h3>
            <p className="text-muted-foreground mb-6">
              View the organizational hierarchy and reporting structure.
            </p>
            <Button iconName="Maximize" iconPosition="left">View Full Chart</Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Directory Search - JKDM CRM</title>
        <meta name="description" content="Search and browse organizational directory and contacts" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="Users" size={32} className="mr-3 text-primary" />
                  Directory Search & Browsing
                </h1>
                <p className="text-muted-foreground mt-2">
                  Search and browse organizational directory and contacts
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="RefreshCw" iconPosition="left">
                  Refresh
                </Button>
                <Button variant="outline" iconName="Download" iconPosition="left">
                  Export
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
              {activeTab === 'search' && 'Search for contacts across the organization using various filters.'}
              {activeTab === 'browse' && 'Browse contacts organized by departments and teams.'}
              {activeTab === 'favorites' && 'Access your frequently contacted colleagues for quick communication.'}
              {activeTab === 'recent' && 'View contacts you have recently searched for or interacted with.'}
              {activeTab === 'org-chart' && 'Visualize the organizational structure and reporting relationships.'}
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
              <Button variant="outline" className="justify-start" iconName="Search" iconPosition="left">
                Advanced Search
              </Button>
              <Button variant="outline" className="justify-start" iconName="Building" iconPosition="left">
                Browse Departments
              </Button>
              <Button variant="outline" className="justify-start" iconName="Star" iconPosition="left">
                View Favorites
              </Button>
              <Button variant="outline" className="justify-start" iconName="Network" iconPosition="left">
                View Org Chart
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DirectorySearchAndBrowsing;
