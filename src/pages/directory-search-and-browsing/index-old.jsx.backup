import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import DirectoryTreeView from './components/DirectoryTreeView';
import SearchFiltersPanel from './components/SearchFiltersPanel';
import ArticleResultsGrid from './components/ArticleResultsGrid';
import SavedSearchesPanel from './components/SavedSearchesPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DirectorySearchAndBrowsing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams?.get('dept') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('cat') || 'all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('published');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Mock user data
  const currentUser = {
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@jkdm.gov.my',
    role: 'agent',
    department: 'Customer Service',
    avatar: null
  };

  // Mock department and category data
  const departmentStructure = [
    {
      id: 'customs',
      name: 'Customs & Excise',
      icon: 'Shield',
      categories: [
        {
          id: 'import-export',
          name: 'Import & Export',
          subcategories: [
            { id: 'declarations', name: 'Customs Declarations' },
            { id: 'permits', name: 'Import/Export Permits' },
            { id: 'prohibited-items', name: 'Prohibited Items' },
            { id: 'duty-calculation', name: 'Duty Calculation' }
          ]
        },
        {
          id: 'gst-sst',
          name: 'GST & SST',
          subcategories: [
            { id: 'gst-registration', name: 'GST Registration' },
            { id: 'tax-rates', name: 'Tax Rates & Classifications' },
            { id: 'refunds', name: 'Tax Refunds' },
            { id: 'compliance', name: 'Compliance Requirements' }
          ]
        },
        {
          id: 'enforcement',
          name: 'Enforcement',
          subcategories: [
            { id: 'investigations', name: 'Investigations' },
            { id: 'penalties', name: 'Penalties & Fines' },
            { id: 'appeals', name: 'Appeals Process' },
            { id: 'seizures', name: 'Seizures & Forfeitures' }
          ]
        }
      ]
    },
    {
      id: 'trade',
      name: 'Trade Facilitation',
      icon: 'Truck',
      categories: [
        {
          id: 'licensing',
          name: 'Licensing & Permits',
          subcategories: [
            { id: 'trader-license', name: 'Trader Licensing' },
            { id: 'warehouse-license', name: 'Warehouse Licensing' },
            { id: 'temporary-permits', name: 'Temporary Permits' },
            { id: 'renewals', name: 'License Renewals' }
          ]
        },
        {
          id: 'procedures',
          name: 'Trade Procedures',
          subcategories: [
            { id: 'clearance', name: 'Clearance Procedures' },
            { id: 'documentation', name: 'Required Documentation' },
            { id: 'electronic-systems', name: 'Electronic Trading Systems' },
            { id: 'transit', name: 'Transit Procedures' }
          ]
        }
      ]
    },
    {
      id: 'enforcement-intelligence',
      name: 'Enforcement & Intelligence',
      icon: 'Eye',
      categories: [
        {
          id: 'border-control',
          name: 'Border Control',
          subcategories: [
            { id: 'passenger-screening', name: 'Passenger Screening' },
            { id: 'cargo-inspection', name: 'Cargo Inspection' },
            { id: 'risk-assessment', name: 'Risk Assessment' },
            { id: 'security-protocols', name: 'Security Protocols' }
          ]
        },
        {
          id: 'intelligence',
          name: 'Intelligence Operations',
          subcategories: [
            { id: 'threat-analysis', name: 'Threat Analysis' },
            { id: 'information-sharing', name: 'Information Sharing' },
            { id: 'joint-operations', name: 'Joint Operations' }
          ]
        }
      ]
    }
  ];

  // Mock articles data
  const mockArticles = [
    {
      id: 'kb-001',
      title: 'How to Submit Customs Declaration Forms Online',
      summary: 'Step-by-step guide for submitting customs declaration forms through the electronic system.',
      content: 'Complete guide with screenshots...',
      department: 'customs',
      category: 'import-export',
      subcategory: 'declarations',
      tags: ['customs', 'declaration', 'online-system', 'step-by-step'],
      status: 'published',
      viewCount: 2450,
      helpfulUp: 189,
      helpfulDown: 12,
      lastUpdated: '2024-10-25T14:30:00Z',
      author: 'Siti Aminah',
      version: 'v2.1',
      attachments: ['customs-declaration-guide.pdf', 'system-screenshots.zip']
    },
    {
      id: 'kb-002',
      title: 'GST Rate Classifications for Electronic Goods',
      summary: 'Comprehensive list of GST rates applicable to various electronic goods and components.',
      content: 'Detailed breakdown of GST classifications...',
      department: 'customs',
      category: 'gst-sst',
      subcategory: 'tax-rates',
      tags: ['gst', 'electronics', 'tax-rates', 'classification'],
      status: 'published',
      viewCount: 1834,
      helpfulUp: 156,
      helpfulDown: 8,
      lastUpdated: '2024-10-28T09:15:00Z',
      author: 'Ahmad Fariz',
      version: 'v1.3',
      attachments: ['gst-electronics-rates.pdf']
    },
    {
      id: 'kb-003',
      title: 'Import Permit Application Process',
      summary: 'Complete process for applying for import permits including required documents and timelines.',
      content: 'Detailed application process...',
      department: 'customs',
      category: 'import-export',
      subcategory: 'permits',
      tags: ['import', 'permits', 'application', 'documentation'],
      status: 'published',
      viewCount: 3021,
      helpfulUp: 278,
      helpfulDown: 15,
      lastUpdated: '2024-10-20T11:45:00Z',
      author: 'Nurul Huda',
      version: 'v1.8',
      attachments: ['permit-application-form.pdf', 'required-documents-checklist.pdf']
    },
    {
      id: 'kb-004',
      title: 'Trader License Renewal Procedures',
      summary: 'Annual license renewal process for registered traders including deadlines and fees.',
      content: 'License renewal information...',
      department: 'trade',
      category: 'licensing',
      subcategory: 'renewals',
      tags: ['license', 'renewal', 'trader', 'fees'],
      status: 'published',
      viewCount: 1567,
      helpfulUp: 142,
      helpfulDown: 6,
      lastUpdated: '2024-10-22T16:20:00Z',
      author: 'Mohammad Hafiz',
      version: 'v1.5',
      attachments: ['renewal-form.pdf']
    },
    {
      id: 'kb-005',
      title: 'Border Security Risk Assessment Guidelines',
      summary: 'Internal guidelines for conducting risk assessments at border checkpoints.',
      content: 'Risk assessment protocols...',
      department: 'enforcement-intelligence',
      category: 'border-control',
      subcategory: 'risk-assessment',
      tags: ['border-security', 'risk-assessment', 'protocols', 'guidelines'],
      status: 'published',
      viewCount: 892,
      helpfulUp: 78,
      helpfulDown: 3,
      lastUpdated: '2024-10-15T13:10:00Z',
      author: 'Inspector Razak',
      version: 'v3.2',
      attachments: ['risk-assessment-checklist.pdf', 'security-protocols.pdf']
    },
    {
      id: 'kb-006',
      title: 'Electronic Trading System User Manual',
      summary: 'Comprehensive user manual for the new electronic trading system interface.',
      content: 'System user manual...',
      department: 'trade',
      category: 'procedures',
      subcategory: 'electronic-systems',
      tags: ['electronic-system', 'user-manual', 'trading', 'interface'],
      status: 'published',
      viewCount: 2156,
      helpfulUp: 198,
      helpfulDown: 14,
      lastUpdated: '2024-10-24T10:30:00Z',
      author: 'IT Support Team',
      version: 'v4.1',
      attachments: ['user-manual.pdf', 'system-tutorial-video.mp4']
    }
  ];

  // Mock saved searches
  const mockSavedSearches = [
    {
      id: 'save-1',
      name: 'GST Electronics Queries',
      query: 'GST electronic goods',
      filters: {
        department: 'customs',
        category: 'gst-sst',
        tags: ['gst', 'electronics']
      },
      lastUsed: '2024-10-28T08:30:00Z'
    },
    {
      id: 'save-2', 
      name: 'Import Documentation',
      query: 'import documents permits',
      filters: {
        department: 'customs',
        category: 'import-export',
        tags: ['import', 'documents']
      },
      lastUsed: '2024-10-27T14:15:00Z'
    }
  ];

  // Available tags for filtering
  const availableTags = [
    'customs', 'gst', 'import', 'export', 'permits', 'declaration', 
    'tax-rates', 'electronics', 'documentation', 'licensing', 'renewal',
    'border-security', 'risk-assessment', 'electronic-system', 'compliance'
  ];

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params?.set('q', searchQuery);
    if (selectedDepartment !== 'all') params?.set('dept', selectedDepartment);
    if (selectedCategory !== 'all') params?.set('cat', selectedCategory);
    if (selectedTags?.length > 0) params?.set('tags', selectedTags?.join(','));
    setSearchParams(params);
  }, [searchQuery, selectedDepartment, selectedCategory, selectedTags, setSearchParams]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleDepartmentSelect = (departmentId) => {
    setSelectedDepartment(departmentId);
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev?.includes(tag) 
        ? prev?.filter(t => t !== tag)
        : [...prev, tag];
      return newTags;
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setSelectedStatus(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
    }
    setCurrentPage(1);
  };

  const handleArticleClick = (article) => {
    navigate(`/knowledge-base-portal?article=${article?.id}`);
  };

  const handleSavedSearchSelect = (savedSearch) => {
    setSearchQuery(savedSearch?.query);
    setSelectedDepartment(savedSearch?.filters?.department || 'all');
    setSelectedCategory(savedSearch?.filters?.category || 'all');
    setSelectedTags(savedSearch?.filters?.tags || []);
  };

  const handleSaveSearch = () => {
    // In real implementation, this would save to backend
    console.log('Saving search:', {
      query: searchQuery,
      department: selectedDepartment,
      category: selectedCategory,
      tags: selectedTags
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('all');
    setSelectedCategory('all');
    setSelectedTags([]);
    setSelectedStatus('published');
    setDateFilter('all');
    setSortBy('relevance');
    setCurrentPage(1);
  };

  // Filter articles based on current selections
  const filteredArticles = mockArticles?.filter(article => {
    if (selectedDepartment !== 'all' && article?.department !== selectedDepartment) return false;
    if (selectedCategory !== 'all' && article?.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && article?.status !== selectedStatus) return false;
    if (selectedTags?.length > 0 && !selectedTags?.some(tag => article?.tags?.includes(tag))) return false;
    if (searchQuery && !article?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) &&
        !article?.summary?.toLowerCase()?.includes(searchQuery?.toLowerCase()) &&
        !article?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))) return false;
    
    return true;
  });

  // Sort articles
  const sortedArticles = [...filteredArticles]?.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b?.lastUpdated) - new Date(a?.lastUpdated);
      case 'popularity':
        return b?.viewCount - a?.viewCount;
      case 'helpful':
        return (b?.helpfulUp - b?.helpfulDown) - (a?.helpfulUp - a?.helpfulDown);
      case 'alphabetical':
        return a?.title?.localeCompare(b?.title);
      default: // relevance
        return b?.viewCount - a?.viewCount;
    }
  });

  const handleMenuToggle = () => {
    console.log('Menu toggled');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} onMenuToggle={handleMenuToggle} />
      <main className="container mx-auto px-6 py-8">
        <BreadcrumbNavigation />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Directory Search & Browsing</h1>
            <p className="text-muted-foreground mt-2">
              Explore knowledge base articles by department, category, and tags
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              iconName={viewMode === 'grid' ? 'List' : 'Grid3X3'}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            
            <Button
              variant="outline"
              iconName="BookmarkPlus"
              onClick={handleSaveSearch}
              disabled={!searchQuery && selectedDepartment === 'all'}
            >
              Save Search
            </Button>
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search articles, categories, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e?.target?.value)}
              className="pl-12 pr-4 py-3 text-lg"
            />
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {sortedArticles?.length} articles found
            {searchQuery && ` for "${searchQuery}"`}
            {(selectedDepartment !== 'all' || selectedCategory !== 'all' || selectedTags?.length > 0) && 
              ' with current filters'
            }
          </div>
          
          <button
            onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
            className="lg:hidden flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Icon name={isFiltersCollapsed ? 'ChevronDown' : 'ChevronUp'} size={16} />
            <span>{isFiltersCollapsed ? 'Show Filters' : 'Hide Filters'}</span>
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Directory Tree and Filters */}
          <div className={`lg:col-span-1 space-y-6 ${isFiltersCollapsed ? 'hidden lg:block' : ''}`}>
            {/* Saved Searches */}
            <SavedSearchesPanel 
              savedSearches={mockSavedSearches}
              onSearchSelect={handleSavedSearchSelect}
            />
            
            {/* Directory Tree */}
            <DirectoryTreeView
              departmentStructure={departmentStructure}
              selectedDepartment={selectedDepartment}
              selectedCategory={selectedCategory}
              onDepartmentSelect={handleDepartmentSelect}
              onCategorySelect={handleCategorySelect}
            />
            
            {/* Search Filters */}
            <SearchFiltersPanel
              selectedStatus={selectedStatus}
              selectedTags={selectedTags}
              dateFilter={dateFilter}
              sortBy={sortBy}
              availableTags={availableTags}
              onFilterChange={handleFilterChange}
              onTagToggle={handleTagToggle}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content - Results */}
          <div className="lg:col-span-3">
            <ArticleResultsGrid
              articles={sortedArticles}
              viewMode={viewMode}
              onArticleClick={handleArticleClick}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DirectorySearchAndBrowsing;