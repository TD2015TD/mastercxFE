import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { knowledgeBaseService } from '../../../../services/knowledgeBaseService';
import ArticleForm from './ArticleForm';

const ArticleManagement = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [viewingArticle, setViewingArticle] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    per_page: 20
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await knowledgeBaseService.getCategories();
      if (response.success) {
        setCategories(response.data?.data || response.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category_code = filters.category; // Use category_code for file-based articles
      if (filters.page) params.page = filters.page;

      // Use getArticlesWithFiles for file-based articles from database
      const response = await knowledgeBaseService.getArticlesWithFiles(params);
      if (response.success) {
        // Handle Laravel pagination structure
        const paginatedData = response.data;

        if (paginatedData && typeof paginatedData === 'object' && paginatedData.data) {
          // Laravel paginated response
          setArticles(paginatedData.data || []);
          setPagination({
            current_page: paginatedData.current_page,
            last_page: paginatedData.last_page,
            per_page: paginatedData.per_page,
            total: paginatedData.total,
            from: paginatedData.from,
            to: paginatedData.to
          });
        } else if (Array.isArray(paginatedData)) {
          // Direct array response
          setArticles(paginatedData);
          setPagination(null);
        } else {
          setArticles([]);
          setPagination(null);
        }
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (article = null) => {
    setEditingArticle(article);
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingArticle(null);
    setError(null);
  };

  const handleSaveArticle = async (data) => {
    try {
      setIsLoading(true);

      // Determine if this is a file-based article
      // - If creating new article: check if data has file
      // - If editing: check if original article has file_path OR if new file is provided
      const isFileBased = editingArticle
        ? (editingArticle.file_path || data.file)
        : data.file;

      if (isFileBased) {
        // Use file-based endpoint with FormData
        if (editingArticle) {
          await knowledgeBaseService.updateArticleWithFile(editingArticle.id, data);
          setSuccess('Article updated successfully');
        } else {
          await knowledgeBaseService.createArticleWithFile(data);
          setSuccess('Article created successfully');
        }
      } else {
        // Use OpenSearch endpoint for text-only articles
        if (editingArticle) {
          await knowledgeBaseService.updateArticle(editingArticle.id, data);
          setSuccess('Article updated successfully');
        } else {
          await knowledgeBaseService.createArticle(data);
          setSuccess('Article created successfully');
        }
      }

      await fetchArticles();
      setTimeout(() => {
        handleCloseModal();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.response?.data?.message || 'Failed to save article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (article) => {
    if (!window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await knowledgeBaseService.deleteArticle(article.id);
      setSuccess('Article deleted successfully');
      await fetchArticles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-muted text-muted-foreground', icon: 'FileText', label: 'Draft' },
      published: { color: 'bg-success/10 text-success', icon: 'CheckCircle', label: 'Published' },
      archived: { color: 'bg-warning/10 text-warning', icon: 'Archive', label: 'Archived' }
    };

    // Default to 'published' if status is undefined (file-based articles default to published)
    const normalizedStatus = status || 'published';
    const config = statusConfig[normalizedStatus] || statusConfig.published;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getCategoryName = (categoryCode) => {
    const category = categories.find(c => c.code === categoryCode);
    return category?.value || categoryCode;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Knowledge Base Articles</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize your knowledge base content
          </p>
        </div>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => handleOpenModal()}
        >
          Create Article
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg flex items-center">
          <Icon name="AlertCircle" size={20} className="mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg flex items-center">
          <Icon name="CheckCircle" size={20} className="mr-2" />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.value}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              iconName="RefreshCw"
              fullWidth
              onClick={() => {
                setFilters({ status: '', category: '', page: 1, per_page: 20 });
                fetchArticles();
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {isLoading && articles.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading articles...</p>
                  </div>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No articles found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    className="mt-4"
                    onClick={() => handleOpenModal()}
                  >
                    Create First Article
                  </Button>
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{article.title}</span>
                      {article.excerpt && (
                        <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {article.excerpt}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground">{getCategoryName(article.category_code || article.category)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(article.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Eye" size={14} className="mr-1" />
                      {article.views || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{article.author || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">
                      {article.updated_at ? new Date(article.updated_at).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        onClick={() => setViewingArticle(article)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Edit"
                        onClick={() => handleOpenModal(article)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Trash2"
                        className="text-error hover:text-error"
                        onClick={() => handleDelete(article)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total articles)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronLeft"
                disabled={pagination.current_page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronRight"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Article Form Modal */}
      {showModal && (
        <ArticleForm
          article={editingArticle}
          categories={categories}
          onSave={handleSaveArticle}
          onClose={handleCloseModal}
          isLoading={isLoading}
        />
      )}

      {/* View Article Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-foreground">{viewingArticle.title}</h3>
                {getStatusBadge(viewingArticle.status)}
              </div>
              <button
                onClick={() => setViewingArticle(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground">{getCategoryName(viewingArticle.category_code || viewingArticle.category)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Author</p>
                  <p className="text-sm font-medium text-foreground">{viewingArticle.author || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Views</p>
                  <p className="text-sm font-medium text-foreground">{viewingArticle.views || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm font-medium text-foreground">
                    {viewingArticle.updated_at ? new Date(viewingArticle.updated_at).toLocaleString() : '-'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Content</h4>
                <div className="prose prose-sm max-w-none bg-muted/30 rounded-lg p-4">
                  <div dangerouslySetInnerHTML={{ __html: viewingArticle.content }} />
                </div>
              </div>

              {viewingArticle.tags && viewingArticle.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingArticle.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setViewingArticle(null)}>
                Close
              </Button>
              <Button variant="default" onClick={() => {
                setViewingArticle(null);
                handleOpenModal(viewingArticle);
              }}>
                Edit Article
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManagement;
