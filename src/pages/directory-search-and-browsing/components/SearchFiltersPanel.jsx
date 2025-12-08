import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const SearchFiltersPanel = ({
  selectedStatus,
  selectedTags,
  dateFilter,
  sortBy,
  availableTags = [],
  onFilterChange,
  onTagToggle,
  onClearFilters
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
    { value: 'draft', label: 'Draft' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Last Updated' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'helpful', label: 'Most Helpful' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  const hasActiveFilters = selectedStatus !== 'published' || 
                          selectedTags?.length > 0 || 
                          dateFilter !== 'all' || 
                          sortBy !== 'relevance';

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
        <Select
          value={selectedStatus}
          onChange={(value) => onFilterChange?.('status', value)}
          options={statusOptions}
          className="w-full"
        />
      </div>

      {/* Date Filter */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Updated Date</label>
        <Select
          value={dateFilter}
          onChange={(value) => onFilterChange?.('date', value)}
          options={dateOptions}
          className="w-full"
        />
      </div>

      {/* Sort By */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
        <Select
          value={sortBy}
          onChange={(value) => onFilterChange?.('sort', value)}
          options={sortOptions}
          className="w-full"
        />
      </div>

      {/* Tags Filter */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Tags 
          {selectedTags?.length > 0 && (
            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              {selectedTags?.length} selected
            </span>
          )}
        </label>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableTags?.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle?.(tag)}
              className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors duration-200 ${
                selectedTags?.includes(tag)
                  ? 'bg-primary/20 text-primary border border-primary/30' :'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Icon 
                  name={selectedTags?.includes(tag) ? 'CheckSquare' : 'Square'} 
                  size={14} 
                />
                <span>{tag}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-1">
            {selectedStatus !== 'published' && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                Status: {statusOptions?.find(opt => opt?.value === selectedStatus)?.label}
                <button
                  onClick={() => onFilterChange?.('status', 'published')}
                  className="ml-1 hover:text-primary/70"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
            
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                Date: {dateOptions?.find(opt => opt?.value === dateFilter)?.label}
                <button
                  onClick={() => onFilterChange?.('date', 'all')}
                  className="ml-1 hover:text-primary/70"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
            
            {selectedTags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary rounded text-xs"
              >
                {tag}
                <button
                  onClick={() => onTagToggle?.(tag)}
                  className="ml-1 hover:text-primary/70"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFiltersPanel;