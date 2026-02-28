import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { toast } from 'react-toastify';

const KnowledgeBasePortal = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_articles: 0,
    total_categories: 0,
    recently_updated: 0
  });
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch stats from knowledge-base-articles
  const fetchStats = async () => {
    try {
      const [articlesResponse, lookupsResponse] = await Promise.all([
        api.get('/knowledge-base-articles'),
        api.get('/lookups', { params: { type: 'knowledge_base_category' } })
      ]);

      let totalArticles = 0;
      let recentlyUpdated = 0;

      if (articlesResponse.data.success) {
        const articlesData = articlesResponse.data.data.data || articlesResponse.data.data || [];
        totalArticles = articlesData.length;

        // Count articles updated in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        recentlyUpdated = articlesData.filter(article => {
          const updatedDate = new Date(article.updated_at || article.published_at);
          return updatedDate >= sevenDaysAgo;
        }).length;
      }

      const totalCategories = lookupsResponse.data.success
        ? (lookupsResponse.data.data || []).length
        : 0;

      setStats({
        total_articles: totalArticles,
        total_categories: totalCategories,
        recently_updated: recentlyUpdated
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch categories from lookups
  const fetchCategories = async () => {
    try {
      const [articlesResponse, lookupsResponse] = await Promise.all([
        api.get('/knowledge-base-articles'),
        api.get('/lookups', { params: { type: 'knowledge_base_category' } })
      ]);

      if (articlesResponse.data.success && lookupsResponse.data.success) {
        const articlesData = articlesResponse.data.data.data || articlesResponse.data.data || [];
        const lookupCategories = lookupsResponse.data.data || [];

        // Count articles per category from actual articles
        const countMap = {};
        articlesData.forEach(article => {
          const categoryCode = article.category_code;
          if (categoryCode) {
            countMap[categoryCode] = (countMap[categoryCode] || 0) + 1;
          }
        });

        // Map lookups to categories with counts (show all categories)
        const formattedCategories = lookupCategories.map(lookup => ({
          code: lookup.code,
          name: lookup.name,
          count: countMap[lookup.code] || 0,
          icon: getCategoryIcon(lookup.name)
        }));

        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/knowledge-base-articles');
      if (response.data.success) {
        const articlesData = response.data.data.data || response.data.data || [];
        setArticles(articlesData);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent views (using regular articles sorted by updated_at)
  const fetchRecentViews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/knowledge-base-articles');
      if (response.data.success) {
        const articlesData = response.data.data.data || response.data.data || [];
        // Sort by updated_at descending
        const sortedArticles = articlesData.sort((a, b) =>
          new Date(b.updated_at) - new Date(a.updated_at)
        ).slice(0, 10);
        setRecentViews(sortedArticles);
      }
    } catch (error) {
      console.error('Failed to fetch recent views:', error);
      toast.error('Failed to load recent views');
    } finally {
      setLoading(false);
    }
  };

  // Search articles
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.warning('Please enter a search term');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await api.get('/knowledge-base-articles/search', {
        params: { q: searchTerm }
      });
      // Backend returns { success, data: [...ES hits with _id/_source] }
      const hits = response.data.success ? (response.data.data || []) : [];
      const transformed = hits.map(hit => ({
        id: hit._id,
        title: hit._source?.title,
        content: hit._source?.content,
        category_code: hit._source?.category_code,
        author: hit._source?.author,
        published_at: hit._source?.published_at,
        updated_at: hit._source?.published_at
      }));
      setSearchResults(transformed);
    } catch (error) {
      console.error('Failed to search articles:', error);
      toast.error('Failed to search articles');
    } finally {
      setLoading(false);
    }
  };

  // Open article detail modal
  const handleViewArticle = async (article) => {
    // For browse/recent: article already has full fields from REST API
    // For search results: fetch full article by ES _id (which equals DB id)
    if (article.content !== undefined) {
      setSelectedArticle(article);
      return;
    }
    try {
      const response = await api.get(`/knowledge-base-articles/${article.id}`);
      if (response.data.success) {
        setSelectedArticle(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
      toast.error('Failed to load article');
    }
  };

  // Filter by category
  const handleCategoryClick = async (categoryCode) => {
    setLoading(true);
    try {
      const response = await api.get('/knowledge-base-articles', {
        params: { category_code: categoryCode }
      });
      if (response.data.success) {
        const articlesData = response.data.data.data || response.data.data || [];
        setArticles(articlesData);
        setActiveTab('browse');
      }
    } catch (error) {
      console.error('Failed to fetch category articles:', error);
      toast.error('Failed to load category articles');
    } finally {
      setLoading(false);
    }
  };

  // Get category icon based on name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Customs Declaration': 'FileText',
      'Tax & Duties': 'DollarSign',
      'Import/Export': 'Package',
      'Regulations & Policies': 'Shield',
      'FAQs': 'HelpCircle',
      'User Guides': 'BookOpen'
    };
    return iconMap[categoryName] || 'Folder';
  };

  // Get category name from code
  const getCategoryName = (categoryCode) => {
    const category = categories.find(cat => cat.code === categoryCode);
    return category ? category.name : categoryCode;
  };

  // Format relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchArticles();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'recent') {
      fetchRecentViews();
    } else if (activeTab === 'browse') {
      fetchArticles();
    } else if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab]);

  const statsDisplay = [
    {
      label: 'Total Articles',
      value: stats.total_articles.toLocaleString(),
      subtext: 'All articles',
      icon: 'FileText',
      color: 'text-blue-600'
    },
    {
      label: 'Categories',
      value: stats.total_categories.toString(),
      subtext: 'Organized topics',
      icon: 'Folder',
      color: 'text-green-600'
    },
    {
      label: 'Recent Updates',
      value: stats.recently_updated.toLocaleString(),
      subtext: 'Last 7 days',
      icon: 'Clock',
      color: 'text-purple-600'
    }
  ];

  const tabs = [
    { id: 'browse', label: 'Browse Articles', icon: 'List' },
    { id: 'search', label: 'Search', icon: 'Search' },
    { id: 'recent', label: 'Recently Updated', icon: 'Clock' },
    { id: 'categories', label: 'Categories', icon: 'Folder' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'browse':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">All Articles</h3>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No articles found</div>
              ) : (
                <div className="space-y-3">
                  {articles.map((article) => (
                    <div key={article.id} onClick={() => handleViewArticle(article)} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center space-x-3 flex-1">
                        <Icon name="FileText" size={20} className="text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{article.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {getCategoryName(article.category_code)} • By {article.author}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getRelativeTime(article.updated_at || article.published_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Search Knowledge Base</h3>
            <p className="text-muted-foreground mb-6">
              Search through all articles using keywords and content.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  icon="Search"
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {hasSearched && (
              <div className="mt-8">
                {loading ? (
                  <div className="text-muted-foreground py-4">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-muted-foreground py-4">No results found for "{searchTerm}"</div>
                ) : (
                  <>
                    <h4 className="text-left font-semibold mb-4">Search Results ({searchResults.length})</h4>
                    <div className="space-y-3">
                      {searchResults.map((article) => (
                        <div key={article.id} onClick={() => handleViewArticle(article)} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer text-left">
                          <div className="flex items-center space-x-3 flex-1">
                            <Icon name="FileText" size={20} className="text-primary" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{article.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {getCategoryName(article.category_code)} • By {article.author}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {getRelativeTime(article.updated_at || article.published_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'recent':
        return (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recently Updated Articles</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : recentViews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Clock" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p>No recently updated articles found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentViews.map((article) => (
                  <div key={article.id} onClick={() => handleViewArticle(article)} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center space-x-3 flex-1">
                      <Icon name="FileText" size={20} className="text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryName(article.category_code)} • By {article.author}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {getRelativeTime(article.updated_at || article.published_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'categories':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No categories found
              </div>
            ) : (
              categories.map((category, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-border p-6 hover:shadow-lg cursor-pointer transition-shadow"
                  onClick={() => handleCategoryClick(category.code)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name={category.icon} size={24} className="text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{category.count} articles</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchCategories();
    if (activeTab === 'browse') {
      fetchArticles();
    } else if (activeTab === 'recent') {
      fetchRecentViews();
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
                <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsDisplay.map((stat, index) => (
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
              {activeTab === 'browse' && 'Browse through all published articles across all categories.'}
              {activeTab === 'search' && 'Search for specific articles using keywords and content.'}
              {activeTab === 'recent' && 'View articles that have been recently updated.'}
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
              <Button
                variant="outline"
                className="justify-start"
                iconName="Search"
                iconPosition="left"
                onClick={() => setActiveTab('search')}
              >
                Search KB
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                iconName="Folder"
                iconPosition="left"
                onClick={() => setActiveTab('categories')}
              >
                Browse Categories
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                iconName="Clock"
                iconPosition="left"
                onClick={() => setActiveTab('recent')}
              >
                Recent Updates
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedArticle(null)}>
          <div className="bg-card rounded-lg border border-border w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedArticle.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {getCategoryName(selectedArticle.category_code)} • By {selectedArticle.author}
                </p>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-muted-foreground hover:text-foreground ml-4">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {selectedArticle.content || 'No content available.'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KnowledgeBasePortal;
