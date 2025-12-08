import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ArticleEditor = ({ article = null, userRole, onSave, onWorkflowAction }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category_main: '',
    subcategory_1: '',
    subcategory_2: '',
    subcategory_3: '',
    subcategory_4: '',
    department_visibility: [],
    tags: [],
    attachments: [],
    status: 'draft'
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Mock data for dropdowns
  const categories = [
    'GST & Tax Procedures',
    'Customs & Import/Export',
    'Licensing & Permits',
    'Compliance & Regulations',
    'System & Technical',
    'General Information'
  ];

  const departments = [
    'Customer Service',
    'Tax Assessment',
    'Customs Operations',
    'Compliance & Audit',
    'IT Support',
    'Legal Affairs'
  ];

  const subcategories = {
    'GST & Tax Procedures': ['Calculation Methods', 'Payment Processing', 'Exemptions', 'Refunds'],
    'Customs & Import/Export': ['Declaration Forms', 'Duty Rates', 'Prohibited Items', 'Clearance Process'],
    'Licensing & Permits': ['Application Process', 'Renewal Procedures', 'Requirements', 'Fees'],
    'Compliance & Regulations': ['Policy Updates', 'Legal Requirements', 'Penalties', 'Appeals'],
    'System & Technical': ['User Guides', 'Troubleshooting', 'Updates', 'API Documentation'],
    'General Information': ['Contact Details', 'Office Hours', 'FAQ', 'News & Announcements']
  };

  useEffect(() => {
    if (article) {
      setFormData({ ...article });
    }
  }, [article]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData?.title || formData?.content) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = () => {
    setLastSaved(new Date());
    // In real implementation, this would save to backend
    console.log('Auto-saved:', formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData?.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev?.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev?.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleDepartmentToggle = (dept) => {
    setFormData(prev => ({
      ...prev,
      department_visibility: prev?.department_visibility?.includes(dept)
        ? prev?.department_visibility?.filter(d => d !== dept)
        : [...prev?.department_visibility, dept]
    }));
  };

  const handleSave = async (status = 'draft') => {
    setIsSaving(true);
    const articleData = {
      ...formData,
      status,
      updated_at: new Date()?.toISOString(),
      updated_by: 'current_user_email'
    };

    try {
      await onSave(articleData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = () => {
    onWorkflowAction('submit_for_review', formData);
  };

  const handlePublish = () => {
    onWorkflowAction('publish', formData);
  };

  const handleReject = () => {
    onWorkflowAction('reject', formData);
  };

  const getAvailableSubcategories = () => {
    return subcategories?.[formData?.category_main] || [];
  };

  const canEdit = () => {
    return userRole === 'content_creator' || userRole === 'approver';
  };

  const canSubmitForReview = () => {
    return userRole === 'content_creator' && formData?.status === 'draft';
  };

  const canPublish = () => {
    return userRole === 'approver' && (formData?.status === 'in_review' || formData?.status === 'draft');
  };

  const canReject = () => {
    return userRole === 'approver' && formData?.status === 'in_review';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Main Editor */}
      <div className="xl:col-span-3">
        <div className="bg-card border border-border rounded-lg">
          {/* Editor Header */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {article ? 'Edit Article' : 'Create New Article'}
                </h2>
                
                {lastSaved && (
                  <span className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Icon name="CheckCircle" size={14} className="text-green-500" />
                    <span>Saved {lastSaved?.toLocaleTimeString()}</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-3 py-1 text-sm rounded-md border transition-colors duration-200 ${
                    isPreviewMode 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {isPreviewMode ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="p-6">
            {!isPreviewMode ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData?.title}
                    onChange={(e) => handleInputChange('title', e?.target?.value)}
                    placeholder="Enter article title..."
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={!canEdit()}
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Summary *
                  </label>
                  <textarea
                    value={formData?.summary}
                    onChange={(e) => handleInputChange('summary', e?.target?.value)}
                    placeholder="Brief summary of the article..."
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    disabled={!canEdit()}
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content *
                  </label>
                  <div className="border border-border rounded-lg bg-background">
                    {/* Formatting Toolbar */}
                    <div className="border-b border-border px-4 py-2 flex items-center space-x-2">
                      {['Bold', 'Italic', 'List', 'Link', 'Image', 'Code']?.map((tool) => (
                        <button
                          key={tool}
                          className="p-2 rounded hover:bg-muted transition-colors duration-200"
                          title={tool}
                        >
                          <Icon name={tool} size={16} />
                        </button>
                      ))}
                    </div>
                    
                    {/* Content Area */}
                    <textarea
                      value={formData?.content}
                      onChange={(e) => handleInputChange('content', e?.target?.value)}
                      placeholder="Write your article content here..."
                      rows={12}
                      className="w-full px-4 py-3 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none resize-none"
                      disabled={!canEdit()}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              (<div className="prose max-w-none">
                <h1 className="text-2xl font-bold text-foreground mb-4">{formData?.title || 'Untitled Article'}</h1>
                <div className="text-muted-foreground mb-6 p-4 bg-muted rounded-lg">
                  {formData?.summary || 'No summary provided.'}
                </div>
                <div className="text-foreground whitespace-pre-wrap">
                  {formData?.content || 'No content provided.'}
                </div>
              </div>)
            )}
          </div>

          {/* Editor Actions */}
          <div className="border-t border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {formData?.status && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    formData?.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    formData?.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                    formData?.status === 'published'? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {formData?.status?.replace('_', ' ')?.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={isSaving || !canEdit()}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                
                {canSubmitForReview() && (
                  <button
                    onClick={handleSubmitForReview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Submit for Review
                  </button>
                )}
                
                {canReject() && (
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Reject
                  </button>
                )}
                
                {canPublish() && (
                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Approve & Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Metadata Sidebar */}
      <div className="xl:col-span-1 space-y-6">
        {/* Category & Classification */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Classification</h3>
          <div className="space-y-4">
            {/* Main Category */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Main Category</label>
              <select
                value={formData?.category_main}
                onChange={(e) => handleInputChange('category_main', e?.target?.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!canEdit()}
              >
                <option value="">Select category...</option>
                {categories?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Subcategories */}
            {formData?.category_main && (
              <>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Subcategory 1</label>
                  <select
                    value={formData?.subcategory_1}
                    onChange={(e) => handleInputChange('subcategory_1', e?.target?.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!canEdit()}
                  >
                    <option value="">Select subcategory...</option>
                    {getAvailableSubcategories()?.map(subcat => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Department Visibility */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Department Visibility</h3>
          <div className="space-y-2">
            {departments?.map(dept => (
              <label key={dept} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData?.department_visibility?.includes(dept)}
                  onChange={() => handleDepartmentToggle(dept)}
                  className="rounded border-border text-primary focus:ring-primary"
                  disabled={!canEdit()}
                />
                <span className="text-sm text-foreground">{dept}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Tags</h3>
          <div className="space-y-2">
            {formData?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData?.tags?.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-muted text-foreground text-xs rounded-full"
                  >
                    <span>{tag}</span>
                    {canEdit() && (
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="hover:text-red-500"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
            
            {canEdit() && (
              <input
                type="text"
                placeholder="Add tag and press Enter..."
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e?.key === 'Enter') {
                    handleTagAdd(e?.target?.value?.trim());
                    e.target.value = '';
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Version Info */}
        {article && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-4">Version Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="text-foreground">v1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">Oct 30, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <span className="text-foreground">A. Rahman</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Review:</span>
                <span className="text-foreground">Oct 29, 2024</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleEditor;