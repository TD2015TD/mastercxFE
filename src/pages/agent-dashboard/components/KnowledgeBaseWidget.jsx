import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const KnowledgeBaseWidget = ({ onArticleSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const recentArticles = [
    {
      id: 1,
      title: 'Customs Declaration Process for Import Goods',
      category: 'Import Procedures',
      views: 1250,
      lastUpdated: '2024-10-25',
      relevanceScore: 95,
      snippet: 'Step-by-step guide for completing customs declarations for imported goods including required documentation and fees.'
    },
    {
      id: 2,
      title: 'GST Calculation for Imported Items',
      category: 'Tax & Duties',
      views: 890,
      lastUpdated: '2024-10-24',
      relevanceScore: 88,
      snippet: 'Comprehensive guide on calculating Goods and Services Tax (GST) for various categories of imported items.'
    },
    {
      id: 3,
      title: 'Prohibited and Restricted Items List',
      category: 'Regulations',
      views: 2100,
      lastUpdated: '2024-10-23',
      relevanceScore: 92,
      snippet: 'Updated list of prohibited and restricted items for import and export with penalty information.'
    },
    {
      id: 4,
      title: 'Online Payment Portal Troubleshooting',
      category: 'Technical Support',
      views: 456,
      lastUpdated: '2024-10-22',
      relevanceScore: 85,
      snippet: 'Common issues and solutions for the JKDM online payment portal including browser compatibility.'
    }
  ];

  const suggestedArticles = [
    {
      id: 5,
      title: 'Duty Exemption Application Process',
      category: 'Exemptions',
      views: 678,
      lastUpdated: '2024-10-21',
      relevanceScore: 90,
      snippet: 'How to apply for duty exemptions for specific categories of goods and required supporting documents.'
    },
    {
      id: 6,
      title: 'Temporary Import Permit Guidelines',
      category: 'Permits',
      views: 534,
      lastUpdated: '2024-10-20',
      relevanceScore: 87,
      snippet: 'Guidelines for obtaining temporary import permits for exhibition goods and samples.'
    }
  ];

  const handleSearch = async (query) => {
    if (!query?.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API search delay
    setTimeout(() => {
      const filtered = [...recentArticles, ...suggestedArticles]?.filter(article =>
        article?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
        article?.category?.toLowerCase()?.includes(query?.toLowerCase()) ||
        article?.snippet?.toLowerCase()?.includes(query?.toLowerCase())
      );
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const handleSearchChange = (e) => {
    const query = e?.target?.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleArticleClick = (article) => {
    onArticleSelect(article);
  };

  const copyToNote = (article) => {
    const noteText = `**${article?.title}**\n\n${article?.snippet}\n\n*Source: Knowledge Base - ${article?.category}*`;
    navigator.clipboard?.writeText(noteText);
    // Show toast notification in real implementation
  };

  const ArticleCard = ({ article, showCopyButton = true }) => (
    <div className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200">
      <div className="flex items-start justify-between mb-2">
        <button
          onClick={() => handleArticleClick(article)}
          className="text-left flex-1"
        >
          <h4 className="text-sm font-medium text-foreground hover:text-primary line-clamp-2">
            {article?.title}
          </h4>
        </button>
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            iconName="Copy"
            onClick={() => copyToNote(article)}
            className="ml-2 flex-shrink-0"
          />
        )}
      </div>
      
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
          {article?.category}
        </span>
        <span className="text-xs text-muted-foreground">
          {article?.views} views
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {article?.snippet}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Updated: {new Date(article.lastUpdated)?.toLocaleDateString()}
        </span>
        <div className="flex items-center space-x-1">
          <Icon name="TrendingUp" size={12} className="text-success" />
          <span className="text-xs text-success">{article?.relevanceScore}%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
          <Button variant="ghost" size="sm" iconName="ExternalLink">
            Open Full KB
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="search"
            placeholder="Search articles, procedures, regulations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <Icon name="Loader2" size={16} className="text-muted-foreground animate-spin" />
            ) : (
              <Icon name="Search" size={16} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {searchQuery ? (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Search Results ({searchResults?.length})
            </h3>
            {searchResults?.length > 0 ? (
              <div className="space-y-3">
                {searchResults?.map(article => (
                  <ArticleCard key={article?.id} article={article} />
                ))}
              </div>
            ) : !isSearching ? (
              <div className="text-center py-8">
                <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No articles found</p>
                <p className="text-xs text-muted-foreground">Try different keywords</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recent Articles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Recent Articles</h3>
                <Icon name="Clock" size={14} className="text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {recentArticles?.slice(0, 2)?.map(article => (
                  <ArticleCard key={article?.id} article={article} />
                ))}
              </div>
            </div>

            {/* Suggested Articles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Suggested for You</h3>
                <Icon name="Lightbulb" size={14} className="text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {suggestedArticles?.map(article => (
                  <ArticleCard key={article?.id} article={article} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" iconName="Plus">
            New Article
          </Button>
          <Button variant="outline" size="sm" iconName="MessageSquare">
            Ask Expert
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseWidget;