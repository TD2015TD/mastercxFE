import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ArticleLibrary = ({ userRole, filterBy = 'all', userId = null, onArticleSelect, onNewArticle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock articles data
  const mockArticles = [
    {
      id: 'art-001',
      title: 'GST Calculation Guidelines for Imported Electronics',
      summary: 'Comprehensive guide for calculating GST on imported electronic devices including exemptions and special rates.',
      status: 'published',
      category_main: 'GST & Tax Procedures',
      subcategory_1: 'Calculation Methods',
      department_visibility: ['Customer Service', 'Tax Assessment'],
      created_by: 'ahmad.rahman@jkdm.gov.my',
      updated_by: 'supervisor.ali@jkdm.gov.my',
      created_at: '2024-10-25T08:00:00Z',
      updated_at: '2024-10-28T14:30:00Z',
      view_count: 156,
      helpful_up: 45,
      helpful_down: 3,
      tags: ['gst', 'electronics', 'import', 'calculation']
    },
    {
      id: 'art-002',
      title: 'Customs Declaration Form Submission Process',
      summary: 'Step-by-step instructions for completing and submitting customs declaration forms online.',
      status: 'in_review',
      category_main: 'Customs & Import/Export',
      subcategory_1: 'Declaration Forms',
      department_visibility: ['Customer Service', 'Customs Operations'],
      created_by: 'ahmad.rahman@jkdm.gov.my',
      updated_by: 'ahmad.rahman@jkdm.gov.my',
      created_at: '2024-10-26T10:15:00Z',
      updated_at: '2024-10-27T16:45:00Z',
      view_count: 0,
      helpful_up: 0,
      helpful_down: 0,
      tags: ['customs', 'declaration', 'forms', 'submission']
    },
    {
      id: 'art-003',
      title: 'Duty Exemption Certificate Application',
      summary: 'Requirements and procedures for applying for duty exemption certificates for specific product categories.',
      status: 'draft',
      category_main: 'Licensing & Permits',
      subcategory_1: 'Application Process',
      department_visibility: ['Customer Service'],
      created_by: 'ahmad.rahman@jkdm.gov.my',
      updated_by: 'ahmad.rahman@jkdm.gov.my',
      created_at: '2024-10-28T09:30:00Z',
      updated_at: '2024-10-28T11:20:00Z',
      view_count: 0,
      helpful_up: 0,
      helpful_down: 0,
      tags: ['duty', 'exemption', 'certificate', 'application']
    },
    {
      id: 'art-004',
      title: 'System Troubleshooting: Portal Login Issues',
      summary: 'Common portal login problems and their solutions including browser compatibility and cache issues.',
      status: 'published',
      category_main: 'System & Technical',
      subcategory_1: 'Troubleshooting',
      department_visibility: ['Customer Service', 'IT Support'],
      created_by: 'tech.support@jkdm.gov.my',
      updated_by: 'tech.support@jkdm.gov.my',
      created_at: '2024-10-20T14:00:00Z',
      updated_at: '2024-10-24T09:15:00Z',
      view_count: 89,
      helpful_up: 32,
      helpful_down: 1,
      tags: ['system', 'login', 'troubleshooting', 'portal']
    }
  ];

  const categories = [
    'GST & Tax Procedures',
    'Customs & Import/Export', 
    'Licensing & Permits',
    'System & Technical',
    'Compliance & Regulations',
    'General Information'
  ];

  const getFilteredArticles = () => {
    let filtered = [...mockArticles];

    // Filter by user's drafts if specified
    if (filterBy === 'drafts' && userId) {
      filtered = filtered?.filter(article => 
        article?.created_by === userId && article?.status === 'draft'
      );
    }

    // Text search
    if (searchQuery) {
      filtered = filtered?.filter(article =>
        article?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        article?.summary?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        article?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered?.filter(article => article?.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered?.filter(article => article?.category_main === filterCategory);
    }

    // Sort
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return a?.title?.localeCompare(b?.title);
        case 'title_desc':
          return b?.title?.localeCompare(a?.title);
        case 'created_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'created_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'updated_desc':
          return new Date(b.updated_at) - new Date(a.updated_at);
        case 'updated_asc':
          return new Date(a.updated_at) - new Date(b.updated_at);
        case 'views_desc':
          return b?.view_count - a?.view_count;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'archived':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHelpfulPercentage = (article) => {
    const total = article?.helpful_up + article?.helpful_down;
    if (total === 0) return 0;
    return Math.round((article?.helpful_up / total) * 100);
  };

  const filteredArticles = getFilteredArticles();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {filterBy === 'drafts' ? 'My Drafts' : 'Article Library'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {filteredArticles?.length} article{filteredArticles?.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {(userRole === 'content_creator' || userRole === 'approver') && (
          <button
            onClick={onNewArticle}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-2"
          >
            <Icon name="Plus" size={16} />
            <span>New Article</span>
          </button>
        )}
      </div>
      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                placeholder="Search articles, tags..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="updated_desc">Latest Updated</option>
              <option value="created_desc">Newest First</option>
              <option value="title_asc">Title A-Z</option>
              <option value="views_desc">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                filterCategory === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Categories
            </button>
            
            {categories?.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filterCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredArticles?.map((article) => (
          <div
            key={article?.id}
            className="bg-card border border-border rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => onArticleSelect(article)}
          >
            {/* Article Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                  {article?.title}
                </h3>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(article?.status)} flex-shrink-0 ml-2`}>
                  {article?.status?.replace('_', ' ')?.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {article?.summary}
              </p>
            </div>

            {/* Article Metadata */}
            <div className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{article?.category_main}</span>
                <span>{new Date(article.updated_at)?.toLocaleDateString()}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {article?.tags?.slice(0, 3)?.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {article?.tags?.length > 3 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                    +{article?.tags?.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              {article?.status === 'published' && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Icon name="Eye" size={12} />
                      <span>{article?.view_count}</span>
                    </span>
                    
                    <span className="flex items-center space-x-1">
                      <Icon name="ThumbsUp" size={12} className="text-green-500" />
                      <span>{getHelpfulPercentage(article)}%</span>
                    </span>
                  </div>
                  
                  <span className="text-muted-foreground">
                    v1.0
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredArticles?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {filterBy === 'drafts' ? 'No drafts found' : 'No articles found'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filterBy === 'drafts' ?'Create your first article to get started.' :'Try adjusting your search or filters.'
            }
          </p>
          
          {(userRole === 'content_creator' || userRole === 'approver') && (
            <button
              onClick={onNewArticle}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              Create New Article
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleLibrary;