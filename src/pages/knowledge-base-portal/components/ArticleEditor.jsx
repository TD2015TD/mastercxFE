import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ArticleEditor = ({ article = null, onSave, onCancel, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    department: '',
    tags: '',
    visibility: 'public',
    attachments: []
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article?.title || '',
        description: article?.description || '',
        content: article?.content || '',
        category: article?.category || '',
        department: article?.department || '',
        tags: article?.tags ? article?.tags?.join(', ') : '',
        visibility: article?.visibility || 'public',
        attachments: article?.attachments || []
      });
    }
  }, [article]);

  const categoryOptions = [
    { value: 'customs-procedures', label: 'Customs Procedures' },
    { value: 'import-export', label: 'Import/Export Guidelines' },
    { value: 'tax-duties', label: 'Tax & Duties' },
    { value: 'documentation', label: 'Documentation Requirements' },
    { value: 'compliance', label: 'Compliance & Regulations' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'faq', label: 'Frequently Asked Questions' },
    { value: 'policies', label: 'Policies & Procedures' }
  ];

  const departmentOptions = [
    { value: 'customs-operations', label: 'Customs Operations' },
    { value: 'enforcement', label: 'Enforcement Division' },
    { value: 'assessment', label: 'Assessment & Valuation' },
    { value: 'intelligence', label: 'Intelligence & Investigation' },
    { value: 'legal', label: 'Legal Affairs' },
    { value: 'it-support', label: 'IT Support' },
    { value: 'general', label: 'General Information' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public - Visible to all users' },
    { value: 'internal', label: 'Internal - Staff only' },
    { value: 'department', label: 'Department - Department members only' },
    { value: 'restricted', label: 'Restricted - Authorized personnel only' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (status = 'draft') => {
    setIsLoading(true);
    
    const articleData = {
      ...formData,
      tags: formData?.tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag),
      status,
      lastModified: new Date()?.toISOString(),
      author: 'Current User'
    };

    try {
      await onSave(articleData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event?.target?.files);
    const newAttachments = files?.map(file => ({
      id: Date.now() + Math.random(),
      name: file?.name,
      size: file?.size,
      type: file?.type,
      url: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev?.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev?.attachments?.filter(att => att?.id !== attachmentId)
    }));
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">
          {article ? 'Edit Article' : 'Create New Article'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          onClick={onCancel}
        />
      </div>
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <Input
              label="Article Title"
              type="text"
              placeholder="Enter a descriptive title for the article"
              value={formData?.title}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              required
            />
          </div>

          <Select
            label="Category"
            placeholder="Select article category"
            options={categoryOptions}
            value={formData?.category}
            onChange={(value) => handleInputChange('category', value)}
            required
          />

          <Select
            label="Department"
            placeholder="Select responsible department"
            options={departmentOptions}
            value={formData?.department}
            onChange={(value) => handleInputChange('department', value)}
            required
          />

          <div className="lg:col-span-2">
            <Input
              label="Description"
              type="text"
              placeholder="Brief description of the article content"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              description="This will be shown in search results and article previews"
            />
          </div>

          <Input
            label="Tags"
            type="text"
            placeholder="Enter tags separated by commas"
            value={formData?.tags}
            onChange={(e) => handleInputChange('tags', e?.target?.value)}
            description="Tags help users find relevant articles"
          />

          <Select
            label="Visibility"
            placeholder="Select visibility level"
            options={visibilityOptions}
            value={formData?.visibility}
            onChange={(value) => handleInputChange('visibility', value)}
            required
          />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Article Content *
          </label>
          <div className="border border-border rounded-lg">
            {/* Toolbar */}
            <div className="flex items-center space-x-2 p-3 border-b border-border bg-muted/30">
              <Button variant="ghost" size="sm" iconName="Bold" />
              <Button variant="ghost" size="sm" iconName="Italic" />
              <Button variant="ghost" size="sm" iconName="Underline" />
              <div className="w-px h-6 bg-border"></div>
              <Button variant="ghost" size="sm" iconName="List" />
              <Button variant="ghost" size="sm" iconName="ListOrdered" />
              <div className="w-px h-6 bg-border"></div>
              <Button variant="ghost" size="sm" iconName="Link" />
              <Button variant="ghost" size="sm" iconName="Image" />
              <Button variant="ghost" size="sm" iconName="Code" />
            </div>
            
            {/* Content Area */}
            <textarea
              className="w-full h-64 p-4 border-0 resize-none focus:outline-none focus:ring-0"
              placeholder="Write your article content here. Use the toolbar above for formatting options."
              value={formData?.content}
              onChange={(e) => handleInputChange('content', e?.target?.value)}
            />
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Attachments
          </label>
          <div className="border border-dashed border-border rounded-lg p-6">
            <div className="text-center">
              <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              />
              <Button
                variant="outline"
                size="sm"
                iconName="Upload"
                iconPosition="left"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Choose Files
              </Button>
            </div>
            
            {formData?.attachments?.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData?.attachments?.map((attachment) => (
                  <div key={attachment?.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      <Icon name="File" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{attachment?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(attachment?.size / 1024)?.toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="X"
                      onClick={() => removeAttachment(attachment?.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            iconName="X"
            iconPosition="left"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            iconName="Save"
            iconPosition="left"
            onClick={() => handleSave('draft')}
            loading={isLoading}
          >
            Save as Draft
          </Button>
          
          {(userRole === 'editor' || userRole === 'admin') && (
            <Button
              variant="default"
              iconName="Send"
              iconPosition="left"
              onClick={() => handleSave('pending')}
              loading={isLoading}
            >
              Submit for Approval
            </Button>
          )}
          
          {userRole === 'approver' && (
            <Button
              variant="success"
              iconName="CheckCircle"
              iconPosition="left"
              onClick={() => handleSave('live')}
              loading={isLoading}
            >
              Publish Article
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;