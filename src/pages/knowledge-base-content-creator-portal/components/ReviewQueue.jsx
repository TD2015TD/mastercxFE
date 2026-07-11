import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { knowledgeBaseService } from '../../../services/knowledgeBaseService';
import { usePermission } from '../../../components/Can';

const ReviewQueue = ({ onArticleSelect, onWorkflowAction }) => {
  const { can } = usePermission();
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('submitted_desc');
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending reviews from API
  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await knowledgeBaseService.getPendingReviews({ per_page: 100 });
      if (response.success) {
        setPendingReviews(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending reviews:', err);
      setError('Failed to load pending reviews');
      setPendingReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock articles pending review (fallback for demo)
  const mockPendingReviews = [
    {
      id: 'art-002',
      title: 'Customs Declaration Form Submission Process',
      summary: 'Step-by-step instructions for completing and submitting customs declaration forms online.',
      category_main: 'Customs & Import/Export',
      subcategory_1: 'Declaration Forms',
      department_visibility: ['Customer Service', 'Customs Operations'],
      submitted_by: 'ahmad.rahman@jkdm.gov.my',
      submitted_at: '2024-10-27T16:45:00Z',
      version: 'v1.0',
      changes_summary: 'Initial creation of comprehensive customs declaration guide',
      priority: 'medium',
      estimated_review_time: 30,
      tags: ['customs', 'declaration', 'forms', 'submission']
    },
    {
      id: 'art-005',
      title: 'Updated GST Exemption Categories 2024',
      summary: 'Latest GST exemption categories effective from November 2024 with new medical equipment provisions.',
      category_main: 'GST & Tax Procedures',
      subcategory_1: 'Exemptions',
      department_visibility: ['Tax Assessment', 'Customer Service'],
      submitted_by: 'sarah.ahmad@jkdm.gov.my',
      submitted_at: '2024-10-28T09:15:00Z',
      version: 'v2.1',
      changes_summary: 'Updated exemption list with new medical equipment categories and revised rates',
      priority: 'high',
      estimated_review_time: 45,
      tags: ['gst', 'exemption', 'medical', 'update', '2024']
    },
    {
      id: 'art-006',
      title: 'Import License Renewal Digital Process',
      summary: 'New digital workflow for import license renewals through the updated government portal.',
      category_main: 'Licensing & Permits',
      subcategory_1: 'Renewal Procedures',
      department_visibility: ['Licensing Division'],
      submitted_by: 'raj.kumar@jkdm.gov.my',
      submitted_at: '2024-10-26T14:20:00Z',
      version: 'v1.0',
      changes_summary: 'New article covering digital renewal process introduced in September 2024',
      priority: 'low',
      estimated_review_time: 20,
      tags: ['license', 'renewal', 'digital', 'portal', 'import']
    }
  ];

  const departments = [
    'Customer Service',
    'Tax Assessment',
    'Customs Operations',
    'Licensing Division',
    'Compliance & Audit'
  ];

  const categories = [
    'GST & Tax Procedures',
    'Customs & Import/Export',
    'Licensing & Permits',
    'System & Technical',
    'Compliance & Regulations'
  ];

  const getFilteredArticles = () => {
    // Use real data if available, otherwise use mock data for demo
    const articlesToFilter = pendingReviews.length > 0 ? pendingReviews : mockPendingReviews;
    let filtered = [...articlesToFilter];

    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered?.filter(article => 
        article?.department_visibility?.includes(filterDepartment)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered?.filter(article => 
        article?.category_main === filterCategory
      );
    }

    // Sort
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'submitted_desc':
          return new Date(b.submitted_at) - new Date(a.submitted_at);
        case 'submitted_asc':
          return new Date(a.submitted_at) - new Date(b.submitted_at);
        case 'priority_high':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
        case 'title_asc':
          return a?.title?.localeCompare(b?.title);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-700 border-gray-200';
    return knowledgeBaseService.getPriorityColor(priority);
  };

  const getTimeAgo = (timestamp) => {
    const diff = new Date() - new Date(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Less than an hour ago';
  };

  const handleArticleSelect = (articleId) => {
    setSelectedArticles(prev => 
      prev?.includes(articleId)
        ? prev?.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredArticles?.map(article => article?.id);
    setSelectedArticles(
      selectedArticles?.length === allIds?.length ? [] : allIds
    );
  };

  const handleBulkAction = (action) => {
    selectedArticles?.forEach(articleId => {
      const article = filteredArticles?.find(a => a?.id === articleId);
      if (article) {
        onWorkflowAction(action, article);
      }
    });
    setSelectedArticles([]);
  };

  const filteredArticles = getFilteredArticles();

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading pending reviews...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={20} className="text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchPendingReviews}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Review Queue</h2>
              <p className="text-muted-foreground mt-1">
                {filteredArticles?.length} article{filteredArticles?.length !== 1 ? 's' : ''} pending review
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Est. total review time: {filteredArticles?.reduce((acc, article) => acc + (article?.estimated_review_time || 0), 0)} min
              </span>
            </div>
          </div>
          {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Departments</option>
              {departments?.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories?.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="submitted_desc">Latest Submitted</option>
              <option value="priority_high">High Priority First</option>
              <option value="title_asc">Title A-Z</option>
              <option value="submitted_asc">Oldest First</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-end">
            {selectedArticles?.length > 0 && can('kb.approve') && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Approve ({selectedArticles?.length})
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Review Queue List */}
      <div className="bg-card border border-border rounded-lg">
        {/* List Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedArticles?.length === filteredArticles?.length && filteredArticles?.length > 0}
              onChange={handleSelectAll}
              className="rounded border-border text-primary focus:ring-primary"
            />
            
            <div className="grid grid-cols-12 gap-4 flex-1 items-center text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Article</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Submitted By</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-border">
          {filteredArticles?.map((article) => (
            <div key={article?.id} className="px-6 py-4 hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedArticles?.includes(article?.id)}
                  onChange={() => handleArticleSelect(article?.id)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                
                <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                  {/* Article Info */}
                  <div className="col-span-4">
                    <button
                      onClick={() => onArticleSelect(article)}
                      className="text-left hover:text-primary transition-colors duration-200"
                    >
                      <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-1">
                        {article?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {article?.summary}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {article?.version}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {article?.estimated_review_time} min
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="text-sm text-foreground">
                      {article?.category_main}
                    </span>
                    {article?.subcategory_1 && (
                      <div className="text-xs text-muted-foreground">
                        {article?.subcategory_1}
                      </div>
                    )}
                  </div>

                  {/* Submitted By */}
                  <div className="col-span-2">
                    <span className="text-sm text-foreground">
                      {article?.submitted_by?.split('@')?.[0]?.replace('.', ' ')}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {article?.department_visibility?.[0]}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="col-span-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border capitalize ${getPriorityColor(article?.priority)}`}>
                      {article?.priority}
                    </span>
                  </div>

                  {/* Submitted Time */}
                  <div className="col-span-2">
                    <span className="text-sm text-foreground">
                      {getTimeAgo(article?.submitted_at)}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(article.submitted_at)?.toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      {can('kb.approve') && (
                        <>
                          <button
                            onClick={() => onWorkflowAction('approve', article)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors duration-200"
                            title="Approve & Publish"
                          >
                            <Icon name="CheckCircle" size={16} />
                          </button>
                          <button
                            onClick={() => onWorkflowAction('reject', article)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
                            title="Reject with Comments"
                          >
                            <Icon name="XCircle" size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onArticleSelect(article)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                        title="Review Details"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              {article?.changes_summary && (
                <div className="mt-3 ml-8 p-3 bg-muted rounded-lg">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Changes Summary:</div>
                  <div className="text-sm text-foreground">
                    {article?.changes_summary}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mt-3 ml-8">
                <div className="flex flex-wrap gap-1">
                  {article?.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-background text-muted-foreground text-xs rounded border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles?.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No articles pending review
            </h3>
            <p className="text-muted-foreground">
              All submitted articles have been processed. Great work!
            </p>
          </div>
        )}
        </div>
        </>
      )}
    </div>
  );
};

export default ReviewQueue;