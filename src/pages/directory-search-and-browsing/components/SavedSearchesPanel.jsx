import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SavedSearchesPanel = ({ savedSearches = [], onSearchSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-MY', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilterSummary = (filters) => {
    const parts = [];
    if (filters?.department && filters?.department !== 'all') {
      parts?.push(filters?.department);
    }
    if (filters?.tags && filters?.tags?.length > 0) {
      parts?.push(`${filters?.tags?.length} tags`);
    }
    return parts?.join(', ') || 'No filters';
  };

  if (savedSearches?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-3">Saved Searches</h3>
        <div className="text-center py-6">
          <Icon name="Bookmark" size={24} className="text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">
            No saved searches yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Save search combinations for quick access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Saved Searches</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs"
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
        </Button>
      </div>

      <div className={`space-y-2 ${!isExpanded && savedSearches?.length > 3 ? 'max-h-48 overflow-hidden' : ''}`}>
        {(isExpanded ? savedSearches : savedSearches?.slice(0, 3))?.map((search) => (
          <button
            key={search?.id}
            onClick={() => onSearchSelect?.(search)}
            className="w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors duration-200 group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Icon name="Search" size={14} className="text-muted-foreground flex-shrink-0" />
                <h4 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors duration-200">
                  {search?.name}
                </h4>
              </div>
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                {formatDate(search?.lastUsed)}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground mb-1 truncate">
              "{search?.query}"
            </div>
            
            <div className="text-xs text-muted-foreground">
              Filters: {getFilterSummary(search?.filters)}
            </div>
          </button>
        ))}
      </div>

      {!isExpanded && savedSearches?.length > 3 && (
        <div className="mt-2 pt-2 border-t border-border">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Show {savedSearches?.length - 3} more saved searches
          </button>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center space-x-1">
            <Icon name="Lightbulb" size={12} />
            <span>Tip: Save frequent searches for quick access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSearchesPanel;