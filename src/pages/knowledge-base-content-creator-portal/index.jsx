import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';

const KnowledgeBaseContentCreatorPortal = () => {
  const [activeTab, setActiveTab] = useState('my-articles');

  const stats = [
    {
      label: 'Articles Written',
      value: '42',
      subtext: '8 this month',
      icon: 'FileText',
      color: 'text-blue-600'
    },
    {
      label: 'Pending Approval',
      value: '5',
      subtext: 'Awaiting review',
      icon: 'Clock',
      color: 'text-yellow-600'
    },
    {
      label: 'Published',
      value: '34',
      subtext: '89% approval rate',
      icon: 'CheckCircle',
      color: 'text-green-600'
    },
    {
      label: 'Total Views',
      value: '12.4K',
      subtext: '+2.3K this week',
      icon: 'Eye',
      color: 'text-purple-600'
    }
  ];

  const tabs = [
    { id: 'my-articles', label: 'My Articles', icon: 'FileText', count: 42 },
    { id: 'drafts', label: 'Drafts', icon: 'Edit', count: 3 },
    { id: 'pending', label: 'Pending Approval', icon: 'Clock', count: 5 },
    { id: 'published', label: 'Published', icon: 'CheckCircle', count: 34 },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-articles':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">My Articles</h3>
            <p className="text-muted-foreground mb-6">
              View and manage all your knowledge base articles.
            </p>
            <Button iconName="Plus" iconPosition="left">Create New Article</Button>
          </div>
        );
      
      case 'drafts':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Edit" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Draft Articles</h3>
            <p className="text-muted-foreground mb-6">
              Continue working on your draft articles before submission.
            </p>
          </div>
        );
      
      case 'pending':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Clock" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Pending Approval</h3>
            <p className="text-muted-foreground mb-6">
              Articles submitted for review and approval by reviewers.
            </p>
          </div>
        );
      
      case 'published':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Published Articles</h3>
            <p className="text-muted-foreground mb-6">
              View your published articles and their performance metrics.
            </p>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Article Analytics</h3>
            <p className="text-muted-foreground mb-6">
              Track views, ratings, and feedback for your articles.
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
        <title>Content Creator Portal - JKDM CRM</title>
        <meta name="description" content="Create and manage knowledge base articles" />
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
                  <Icon name="Edit" size={32} className="mr-3 text-primary" />
                  Content Creator Portal
                </h1>
                <p className="text-muted-foreground mt-2">
                  Create and manage knowledge base articles
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="RefreshCw" iconPosition="left">
                  Refresh
                </Button>
                <Button variant="default" iconName="Plus" iconPosition="left">
                  Create Article
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
                    {tab.count !== undefined && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Description */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'my-articles' && 'View and manage all your created articles across all statuses.'}
              {activeTab === 'drafts' && 'Work on your draft articles before submitting for review.'}
              {activeTab === 'pending' && 'Articles awaiting approval from reviewers and managers.'}
              {activeTab === 'published' && 'Your approved and published articles visible to all users.'}
              {activeTab === 'analytics' && 'Track performance metrics, views, and user feedback for your articles.'}
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
              <Button variant="outline" className="justify-start" iconName="Plus" iconPosition="left">
                Create Article
              </Button>
              <Button variant="outline" className="justify-start" iconName="BarChart3" iconPosition="left">
                View Analytics
              </Button>
              <Button variant="outline" className="justify-start" iconName="CheckCircle" iconPosition="left">
                Approve Articles
              </Button>
              <Button variant="outline" className="justify-start" iconName="Settings" iconPosition="left">
                Manage Categories
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default KnowledgeBaseContentCreatorPortal;
