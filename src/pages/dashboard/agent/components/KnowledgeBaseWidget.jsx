import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/AppIcon';
import Input from '../../../../components/ui/Input';
import { knowledgeBaseService } from '../../../../services/knowledgeBaseService';

const KnowledgeBaseWidget = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounce = useRef(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const response = await knowledgeBaseService.getPublishedArticles({ per_page: 6 });
      const data = response?.data?.data || response?.data || [];
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load KB articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchDebounce.current = setTimeout(() => doSearch(query), 400);
  };

  const doSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await knowledgeBaseService.getArticles({ search: query, status: 'published', per_page: 10 });
      const data = response?.data?.data || response?.data || [];
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('KB search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const copyToNote = (article) => {
    const snippet = getSnippet(article);
    const noteText = `**${article.title}**\n\n${snippet}\n\n*Source: Knowledge Base - ${getCategory(article)}*`;
    navigator.clipboard?.writeText(noteText);
  };

  const getCategory = (article) =>
    article.category || article.category_main || article.category_code || '';

  const getSnippet = (article) =>
    article.excerpt || article.summary ||
    (typeof article.content === 'string' ? article.content.substring(0, 120) + '...' : '');

  const getDate = (article) =>
    article.updated_at || article.published_at || '';

  const getViews = (article) =>
    article.view_count || article.views || 0;

  const ArticleCard = ({ article }) => (
    <div className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200">
      <div className="flex items-start justify-between mb-2">
        <button
          onClick={() => navigate('/knowledge-base-portal')}
          className="text-left flex-1"
        >
          <h4 className="text-sm font-medium text-foreground hover:text-primary line-clamp-2">
            {article.title}
          </h4>
        </button>
        <button
          onClick={() => copyToNote(article)}
          className="ml-2 flex-shrink-0 p-1 hover:bg-muted rounded"
          title="Copy to clipboard"
        >
          <Icon name="Copy" size={14} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-2">
        {getCategory(article) && (
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
            {getCategory(article)}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{getViews(article)} views</span>
      </div>

      {getSnippet(article) && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {getSnippet(article)}
        </p>
      )}

      {getDate(article) && (
        <span className="text-xs text-muted-foreground">
          Updated: {new Date(getDate(article)).toLocaleDateString()}
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
          <button
            onClick={() => navigate('/knowledge-base-portal')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ExternalLink" size={14} />
            Open Full KB
          </button>
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
        {isLoading && !searchQuery ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader" size={24} className="animate-spin text-primary" />
          </div>
        ) : searchQuery ? (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map(article => (
                  <ArticleCard key={article.id} article={article} />
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
        ) : articles.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="BookOpen" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No articles available</p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center justify-between">
              Recent Articles
              <Icon name="Clock" size={14} className="text-muted-foreground" />
            </h3>
            <div className="space-y-3">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseWidget;
