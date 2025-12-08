import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SearchAndFilters = ({ onSearch, onFilterChange, filters = {}, userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'customs-procedures', label: 'Customs Procedures' },
    { value: 'import-export', label: 'Import/Export Guidelines' },
    { value: 'tax-duties', label: 'Tax & Duties' },
    { value: 'documentation', label: 'Documentation Requirements' },
    { value: 'compliance', label: 'Compliance & Regulations' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'faq', label: 'Frequently Asked Questions' },
    { value: 'policies', label: 'Policies & Procedures' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'live', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'customs-operations', label: 'Customs Operations' },
    { value: 'enforcement', label: 'Enforcement Division' },
    { value: 'assessment', label: 'Assessment & Valuation' },
    { value: 'intelligence', label: 'Intelligence & Investigation' },
    { value: 'legal', label: 'Legal Affairs' },
    { value: 'it-support', label: 'IT Support' },
    { value: 'general', label: 'General Information' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      category: '',
      status: '',
      department: '',
      sort: 'relevance'
    });
    onSearch('');
  };

  const activeFiltersCount = Object.values(filters)?.filter(value => 
    value && value !== '' && value !== 'relevance'
  )?.length;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Main Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              placeholder="Search articles, keywords, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            iconName="Search"
            iconPosition="left"
          >
            Search
          </Button>
        </div>
      </form>
      {/* Quick Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Select
              placeholder="Category"
              options={categoryOptions}
              value={filters?.category || ''}
              onChange={(value) => handleFilterChange('category', value)}
              className="w-48"
            />
            
            <Select
              placeholder="Status"
              options={statusOptions}
              value={filters?.status || ''}
              onChange={(value) => handleFilterChange('status', value)}
              className="w-40"
            />
            
            <Select
              placeholder="Sort by"
              options={sortOptions}
              value={filters?.sort || 'relevance'}
              onChange={(value) => handleFilterChange('sort', value)}
              className="w-40"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName={isAdvancedOpen ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {(searchQuery || activeFiltersCount > 0) && (
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconPosition="left"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Department"
              placeholder="Select department"
              options={departmentOptions}
              value={filters?.department || ''}
              onChange={(value) => handleFilterChange('department', value)}
            />

            <Input
              label="Author"
              type="text"
              placeholder="Search by author name"
              value={filters?.author || ''}
              onChange={(e) => handleFilterChange('author', e?.target?.value)}
            />

            <Input
              label="Tags"
              type="text"
              placeholder="Enter tags (comma separated)"
              value={filters?.tags || ''}
              onChange={(e) => handleFilterChange('tags', e?.target?.value)}
            />

            <Input
              label="Date From"
              type="date"
              value={filters?.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />

            <Input
              label="Date To"
              type="date"
              value={filters?.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />

            <div className="flex items-end">
              <Button
                variant="outline"
                size="default"
                iconName="Filter"
                iconPosition="left"
                onClick={() => onFilterChange(filters)}
                fullWidth
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Search Suggestions */}
      {searchQuery && (
        <div className="mt-4 p-3 bg-muted/30 rounded-md">
          <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {['customs declaration', 'import permit', 'duty calculation', 'export procedures', 'tax exemption']?.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setSearchQuery(suggestion);
                  onSearch(suggestion);
                }}
                className="px-3 py-1 bg-background border border-border rounded-full text-sm text-foreground hover:bg-muted transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;