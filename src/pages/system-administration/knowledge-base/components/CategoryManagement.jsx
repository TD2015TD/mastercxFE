import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { knowledgeBaseService } from '../../../../services/knowledgeBaseService';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    value: '',
    description: '',
    display_order: 0
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await knowledgeBaseService.getCategories();
      if (response.success) {
        setCategories(response.data?.data || response.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        code: category.code,
        value: category.value,
        description: category.description || '',
        display_order: category.display_order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        code: '',
        value: '',
        description: '',
        display_order: 0
      });
    }
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      code: '',
      value: '',
      description: '',
      display_order: 0
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsLoading(true);
      if (editingCategory) {
        await knowledgeBaseService.updateCategory(editingCategory.id, formData);
        setSuccess('Category updated successfully');
      } else {
        await knowledgeBaseService.createCategory(formData);
        setSuccess('Category created successfully');
      }
      await fetchCategories();
      setTimeout(() => {
        handleCloseModal();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${category.value}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await knowledgeBaseService.deleteCategory(category.id);
      setSuccess('Category deleted successfully');
      await fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Article Categories</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage knowledge base article categories
          </p>
        </div>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => handleOpenModal()}
        >
          Add Category
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

      {/* Categories Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {isLoading && categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading categories...</p>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <Icon name="FolderOpen" size={48} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No categories found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    className="mt-4"
                    onClick={() => handleOpenModal()}
                  >
                    Create First Category
                  </Button>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-foreground">{category.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">{category.value}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{category.description || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{category.display_order || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        <Icon name="Check" size={12} className="mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Icon name="X" size={12} className="mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Edit"
                        onClick={() => handleOpenModal(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Trash2"
                        className="text-error hover:text-error"
                        onClick={() => handleDelete(category)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category Code *
                </label>
                <input
                  type="text"
                  required
                  disabled={editingCategory}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., FAQ, GUIDE, TUTORIAL"
                />
                {editingCategory && (
                  <p className="text-xs text-muted-foreground mt-1">Code cannot be changed after creation</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Frequently Asked Questions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Optional description for this category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
