import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CategoryManagement from './components/CategoryManagement';
import ArticleManagement from './components/ArticleManagement';
import api from '../../../services/api';

const KnowledgeBaseAdmin = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [statistics, setStatistics] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoadingStats(true);

      const response = await api.get('/knowledge-base-articles');

      if (response.data.success) {
        const articlesData =
          response.data.data.data ||
          response.data.data ||
          [];

        setStatistics({
          total_articles: articlesData.length,
          published_articles: articlesData.filter(
            (article) => article.status === 'published'
          ).length,
          draft_articles: articlesData.filter(
            (article) => article.status === 'draft'
          ).length,
        });
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getTotalArticles = () => {
    if (!statistics) return 0;
    return statistics.total_articles || 0;
  };

  const getStatusCount = (statusKey) => {
    if (!statistics) return 0;

    if (statusKey === 'published') {
      return statistics.published_articles || 0;
    }

    if (statusKey === 'draft') {
      return statistics.draft_articles || 0;
    }

    return 0;
  };

  const tabs = [
    {
      id: 'articles',
      label: 'Articles',
      icon: 'FileText',
      description: 'Manage knowledge base articles',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: 'Folder',
      description: 'Manage article categories',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Articles</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {isLoadingStats ? '...' : getTotalArticles()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-2xl font-bold text-success mt-1">
                {isLoadingStats ? '...' : getStatusCount('published')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Draft Articles</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {isLoadingStats ? '...' : getStatusCount('draft')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon name="Edit" size={24} className="text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="Knowledge Base Tabs">
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
                <Icon name={tab.icon} size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-3 bg-muted/30 border-b border-border">
          <p className="text-sm text-muted-foreground">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>

        <div className="p-6">
          {activeTab === 'articles' && <ArticleManagement />}
          {activeTab === 'categories' && <CategoryManagement />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
            fullWidth
            onClick={fetchStatistics}
          >
            Refresh Statistics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseAdmin;