import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ArticleResultsGrid = ({ 
  articles = [], 
  viewMode = 'grid', 
  onArticleClick, 
  currentPage = 1, 
  onPageChange,
  itemsPerPage = 12 
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = articles?.slice(startIndex, endIndex);
  const totalPages = Math.ceil(articles?.length / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHelpfulPercentage = (article) => {
    const total = article?.helpfulUp + article?.helpfulDown;
    if (total === 0) return 0;
    return Math.round((article?.helpfulUp / total) * 100);
  };

  const getDepartmentIcon = (departmentId) => {
    const iconMap = {
      'customs': 'Shield',
      'trade': 'Truck',
      'enforcement-intelligence': 'Eye'
    };
    return iconMap?.[departmentId] || 'FileText';
  };

  const getDepartmentName = (departmentId) => {
    const nameMap = {
      'customs': 'Customs & Excise',
      'trade': 'Trade Facilitation',
      'enforcement-intelligence': 'Enforcement & Intelligence'
    };
    return nameMap?.[departmentId] || 'General';
  };

  if (articles?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Articles Found</h3>
        <p className="text-muted-foreground mb-4">
          No articles match your current search and filter criteria.
        </p>
        <div className="text-sm text-muted-foreground">
          Try:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Adjusting your search terms</li>
            <li>Removing some filters</li>
            <li>Selecting a different department or category</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedArticles?.map((article) => (
            <div
              key={article?.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
              onClick={() => onArticleClick?.(article)}
            >
              {/* Article Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon 
                      name={getDepartmentIcon(article?.department)} 
                      size={16} 
                      className="text-primary" 
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getDepartmentName(article?.department)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="Eye" size={12} />
                  <span>{article?.viewCount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Title and Summary */}
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                {article?.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {article?.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {article?.tags?.slice(0, 3)?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {article?.tags?.length > 3 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                    +{article?.tags?.length - 3}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Icon name="ThumbsUp" size={12} />
                    <span>{getHelpfulPercentage(article)}%</span>
                  </div>
                  {article?.attachments?.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Icon name="Paperclip" size={12} />
                      <span>{article?.attachments?.length}</span>
                    </div>
                  )}
                </div>
                <span>{formatDate(article?.lastUpdated)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedArticles?.map((article) => (
            <div
              key={article?.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              onClick={() => onArticleClick?.(article)}
            >
              <div className="flex items-start space-x-4">
                {/* Department Icon */}
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon 
                    name={getDepartmentIcon(article?.department)} 
                    size={20} 
                    className="text-primary" 
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                        {article?.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <span>{getDepartmentName(article?.department)}</span>
                        <span>•</span>
                        <span>Version {article?.version}</span>
                        <span>•</span>
                        <span>by {article?.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="Eye" size={12} />
                        <span>{article?.viewCount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="ThumbsUp" size={12} />
                        <span>{getHelpfulPercentage(article)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {article?.summary}
                  </p>

                  {/* Tags and Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article?.tags?.slice(0, 4)?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {article?.tags?.length > 4 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                          +{article?.tags?.length - 4}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {article?.attachments?.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Icon name="Paperclip" size={12} />
                          <span>{article?.attachments?.length} files</span>
                        </div>
                      )}
                      <span>Updated {formatDate(article?.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card border border-border rounded-lg px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, articles?.length)} of {articles?.length} articles
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon name="ChevronLeft" size={16} />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                ?.filter(page => {
                  const distance = Math.abs(page - currentPage);
                  return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                })
                ?.map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array?.[index - 1] !== page - 1 && (
                      <span className="text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={page === currentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleResultsGrid;