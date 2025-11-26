import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DirectoryBrowser = ({ userRole, onArticleSelect }) => {
  const [expandedNodes, setExpandedNodes] = useState(['root']);
  const [selectedFilters, setSelectedFilters] = useState({
    department: 'all',
    status: 'published',
    updatedDate: 'all',
    tags: []
  });
  const [savedViews, setSavedViews] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Mock directory structure
  const directoryStructure = {
    id: 'root',
    label: 'Knowledge Base',
    type: 'root',
    children: [
      {
        id: 'gst-tax',
        label: 'GST & Tax Procedures',
        type: 'category',
        articleCount: 23,
        children: [
          {
            id: 'calculation-methods',
            label: 'Calculation Methods',
            type: 'subcategory',
            articleCount: 8,
            children: []
          },
          {
            id: 'payment-processing',
            label: 'Payment Processing',
            type: 'subcategory',
            articleCount: 6,
            children: []
          },
          {
            id: 'exemptions',
            label: 'Exemptions',
            type: 'subcategory',
            articleCount: 5,
            children: []
          },
          {
            id: 'refunds',
            label: 'Refunds',
            type: 'subcategory',
            articleCount: 4,
            children: []
          }
        ]
      },
      {
        id: 'customs-import',
        label: 'Customs & Import/Export',
        type: 'category',
        articleCount: 18,
        children: [
          {
            id: 'declaration-forms',
            label: 'Declaration Forms',
            type: 'subcategory',
            articleCount: 7,
            children: []
          },
          {
            id: 'duty-rates',
            label: 'Duty Rates',
            type: 'subcategory',
            articleCount: 5,
            children: []
          },
          {
            id: 'prohibited-items',
            label: 'Prohibited Items',
            type: 'subcategory',
            articleCount: 3,
            children: []
          },
          {
            id: 'clearance-process',
            label: 'Clearance Process',
            type: 'subcategory',
            articleCount: 3,
            children: []
          }
        ]
      },
      {
        id: 'licensing-permits',
        label: 'Licensing & Permits',
        type: 'category',
        articleCount: 15,
        children: [
          {
            id: 'application-process',
            label: 'Application Process',
            type: 'subcategory',
            articleCount: 6,
            children: []
          },
          {
            id: 'renewal-procedures',
            label: 'Renewal Procedures',
            type: 'subcategory',
            articleCount: 4,
            children: []
          },
          {
            id: 'requirements',
            label: 'Requirements',
            type: 'subcategory',
            articleCount: 3,
            children: []
          },
          {
            id: 'fees',
            label: 'Fees',
            type: 'subcategory',
            articleCount: 2,
            children: []
          }
        ]
      },
      {
        id: 'system-technical',
        label: 'System & Technical',
        type: 'category',
        articleCount: 12,
        children: [
          {
            id: 'user-guides',
            label: 'User Guides',
            type: 'subcategory',
            articleCount: 5,
            children: []
          },
          {
            id: 'troubleshooting',
            label: 'Troubleshooting',
            type: 'subcategory',
            articleCount: 4,
            children: []
          },
          {
            id: 'updates',
            label: 'Updates',
            type: 'subcategory',
            articleCount: 2,
            children: []
          },
          {
            id: 'api-docs',
            label: 'API Documentation',
            type: 'subcategory',
            articleCount: 1,
            children: []
          }
        ]
      }
    ]
  };

  // Mock articles for selected node
  const mockArticles = [
    {
      id: 'art-001',
      title: 'GST Calculation Guidelines for Imported Electronics',
      summary: 'Comprehensive guide for calculating GST on imported electronic devices including exemptions and special rates.',
      viewCount: 156,
      helpfulPercentage: 94,
      lastUpdated: '2024-10-28',
      status: 'published'
    },
    {
      id: 'art-002',
      title: 'Standard GST Rate Application Process',
      summary: 'Step-by-step process for applying standard 6% GST rates to various product categories.',
      viewCount: 89,
      helpfulPercentage: 91,
      lastUpdated: '2024-10-25',
      status: 'published'
    },
    {
      id: 'art-003',
      title: 'GST Exemption Verification Procedures',
      summary: 'How to verify and apply GST exemptions for qualified products and services.',
      viewCount: 67,
      helpfulPercentage: 88,
      lastUpdated: '2024-10-22',
      status: 'published'
    }
  ];

  const departments = [
    'Customer Service',
    'Tax Assessment', 
    'Customs Operations',
    'Compliance & Audit',
    'IT Support',
    'Legal Affairs'
  ];

  const availableTags = [
    'gst', 'tax', 'customs', 'import', 'export', 'license', 'permit',
    'calculation', 'exemption', 'refund', 'declaration', 'duty', 'rate'
  ];

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev?.includes(nodeId)
        ? prev?.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setSelectedFilters(prev => ({
      ...prev,
      tags: prev?.tags?.includes(tag)
        ? prev?.tags?.filter(t => t !== tag)
        : [...prev?.tags, tag]
    }));
  };

  const saveCurrentView = () => {
    if (!newViewName?.trim()) return;
    
    const newView = {
      id: Date.now()?.toString(),
      name: newViewName,
      filters: { ...selectedFilters },
      createdAt: new Date()?.toISOString()
    };
    
    setSavedViews(prev => [...prev, newView]);
    setNewViewName('');
    setShowSaveDialog(false);
  };

  const loadSavedView = (view) => {
    setSelectedFilters(view?.filters);
  };

  const deleteSavedView = (viewId) => {
    setSavedViews(prev => prev?.filter(view => view?.id !== viewId));
  };

  const renderTreeNode = (node, level = 0) => {
    const isExpanded = expandedNodes?.includes(node?.id);
    const hasChildren = node?.children && node?.children?.length > 0;
    
    return (
      <div key={node?.id}>
        <div
          className={`flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-muted cursor-pointer ${
            level > 0 ? `ml-${level * 4}` : ''
          }`}
          onClick={() => hasChildren && toggleNode(node?.id)}
        >
          {hasChildren && (
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={14} 
              className="text-muted-foreground"
            />
          )}
          
          <Icon 
            name={
              node?.type === 'root' ? 'Home' :
              node?.type === 'category'? 'Folder' : 'FileText'
            } 
            size={16}
            className={
              node?.type === 'category' ? 'text-blue-500' :
              node?.type === 'subcategory'? 'text-green-500' : 'text-muted-foreground'
            }
          />
          
          <span className="flex-1 text-sm text-foreground font-medium">
            {node?.label}
          </span>
          
          {node?.articleCount && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {node?.articleCount}
            </span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node?.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Panel - Directory Tree */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-lg p-4 h-fit">
          <h3 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="FolderTree" size={18} />
            <span>Directory Structure</span>
          </h3>
          
          <div className="space-y-1">
            {renderTreeNode(directoryStructure)}
          </div>
        </div>
      </div>
      {/* Center Panel - Filters and Results */}
      <div className="lg:col-span-2 space-y-6">
        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Department</label>
              <select
                value={selectedFilters?.department}
                onChange={(e) => handleFilterChange('department', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Departments</option>
                {departments?.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={selectedFilters?.status}
                onChange={(e) => handleFilterChange('status', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags?.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${
                    selectedFilters?.tags?.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Save View */}
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="w-full px-3 py-2 text-sm border border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200"
            >
              Save Current Filter View
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-foreground">Articles</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {mockArticles?.length} articles found in selected category
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {mockArticles?.map(article => (
              <div
                key={article?.id}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-200"
                onClick={() => onArticleSelect(article)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm leading-tight">
                    {article?.title}
                  </h4>
                  
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200 flex-shrink-0 ml-3">
                    PUBLISHED
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {article?.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Icon name="Eye" size={12} />
                      <span>{article?.viewCount}</span>
                    </span>
                    
                    <span className="flex items-center space-x-1">
                      <Icon name="ThumbsUp" size={12} className="text-green-500" />
                      <span>{article?.helpfulPercentage}%</span>
                    </span>
                  </div>
                  
                  <span>Updated {article?.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Panel - Saved Views */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-lg p-4 h-fit">
          <h3 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="Bookmark" size={18} />
            <span>Saved Views</span>
          </h3>
          
          {savedViews?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved views yet. Save your current filter combination to quick access later.
            </p>
          ) : (
            <div className="space-y-2">
              {savedViews?.map(view => (
                <div
                  key={view?.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => loadSavedView(view)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-foreground text-sm">
                        {view?.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(view.createdAt)?.toLocaleDateString()}
                      </div>
                    </button>
                    
                    <button
                      onClick={() => deleteSavedView(view?.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors duration-200"
                    >
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Save View Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-popover border border-border rounded-lg shadow-modal w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Save Filter View</h3>
              
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e?.target?.value)}
                placeholder="Enter view name..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <button
                  onClick={saveCurrentView}
                  disabled={!newViewName?.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectoryBrowser;