import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const KnowledgeBasePortal = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    {
      label: 'Total Articles',
      value: '1,248',
      subtext: '142 this month',
      icon: 'FileText',
      color: 'text-blue-600'
    },
    {
      label: 'Categories',
      value: '24',
      subtext: '8 departments',
      icon: 'Folder',
      color: 'text-green-600'
    },
    {
      label: 'Recent Views',
      value: '3,456',
      subtext: 'This week',
      icon: 'Eye',
      color: 'text-purple-600'
    },
    {
      label: 'My Favorites',
      value: '18',
      subtext: 'Saved articles',
      icon: 'Star',
      color: 'text-yellow-600'
    }
  ];

  const tabs = [
    { id: 'browse', label: 'Browse Articles', icon: 'List' },
    { id: 'search', label: 'Search', icon: 'Search' },
    { id: 'favorites', label: 'Favorites', icon: 'Star' },
    { id: 'recent', label: 'Recently Viewed', icon: 'Clock' },
    { id: 'categories', label: 'Categories', icon: 'Folder' }
  ];

  const mockCategories = [
    { name: 'Customs Declaration', count: 186, icon: 'FileText' },
    { name: 'Tax & Duties', count: 142, icon: 'DollarSign' },
    { name: 'Import/Export', count: 224, icon: 'Package' },
    { name: 'Technical Support', count: 98, icon: 'Wrench' },
    { name: 'General Inquiry', count: 312, icon: 'HelpCircle' },
    { name: 'Compliance', count: 156, icon: 'Shield' }
  ];

  const mockArticles = [
    { id: 1, title: 'How to Submit Customs Declaration', category: 'Customs Declaration', views: 1234, updated: '2 days ago' },
    { id: 2, title: 'GST Calculation Guidelines', category: 'Tax & Duties', views: 892, updated: '1 week ago' },
    { id: 3, title: 'Import License Requirements', category: 'Import/Export', views: 756, updated: '3 days ago' },
    { id: 4, title: 'Export Documentation Checklist', category: 'Import/Export', views: 645, updated: '5 days ago' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'browse':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Popular Articles</h3>
              <div className="space-y-3">
                {mockArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Icon name="FileText" size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.category} • {article.views} views</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{article.updated}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Search Knowledge Base</h3>
            <p className="text-muted-foreground mb-6">
              Search through all articles using keywords, categories, or tags.
            </p>
            <div className="max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
          </div>
        );
      
      case 'favorites':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Star" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Favorite Articles</h3>
            <p className="text-muted-foreground mb-6">
              Quick access to your saved and bookmarked articles.
            </p>
          </div>
        );
      
      case 'recent':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Clock" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Recently Viewed</h3>
            <p className="text-muted-foreground mb-6">
              Articles you've recently accessed for quick reference.
            </p>
          </div>
        );
      
      case 'categories':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCategories.map((category, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg cursor-pointer transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name={category.icon} size={24} className="text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{category.count} articles</span>
                </div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Knowledge Base Portal - JKDM CRM</title>
        <meta name="description" content="Search and browse the knowledge base for information and solutions" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="BookOpen" size={32} className="mr-3 text-primary" />
                  Knowledge Base Portal
                </h1>
                <p className="text-muted-foreground mt-2">
                  Search and browse the knowledge base for information and solutions
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="RefreshCw" iconPosition="left">
                  Refresh
                </Button>
                <Button variant="outline" iconName="Plus" iconPosition="left">
                  Request Article
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
              {activeTab === 'browse' && 'Browse through popular and recent articles across all categories.'}
              {activeTab === 'search' && 'Search for specific articles using keywords, categories, or tags.'}
              {activeTab === 'favorites' && 'Access your bookmarked articles for quick reference.'}
              {activeTab === 'recent' && 'View articles you have recently accessed.'}
              {activeTab === 'categories' && 'Browse articles organized by department and category.'}
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
                Search KB
              </Button>
              <Button variant="outline" className="justify-start" iconName="Folder" iconPosition="left">
                Browse Categories
              </Button>
              <Button variant="outline" className="justify-start" iconName="Star" iconPosition="left">
                View Favorites
              </Button>
              <Button variant="outline" className="justify-start" iconName="Plus" iconPosition="left">
                Request Article
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default KnowledgeBasePortal;
