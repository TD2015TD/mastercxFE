import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import api from '../../../services/api';
import CategoryModal from './CategoryModal';
import LookupModal from './LookupModal';
import EmailConfiguration from '../email-configuration/EmailConfiguration';
import AuthenticationConfiguration from '../authentication-configuration/AuthenticationConfiguration';
import LdapConfiguration from '../ldap-configuration/LdapConfiguration';

const SystemConfigurationPanel = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedParent, setSelectedParent] = useState('all');
  const [selectedLookupType, setSelectedLookupType] = useState('all');
  const [lookupTypes, setLookupTypes] = useState([{ value: 'all', label: 'All Types' }]);
  const [departments, setDepartments] = useState([{ value: 'all', label: 'All Departments' }]);
  const [parentCategories, setParentCategories] = useState([{ value: 'all', label: 'All Categories' }]);

  const tabs = [
    { id: 'categories', label: 'Categories & Sub-categories', icon: 'FolderTree' },
    { id: 'lookups', label: 'Lookup Configuration', icon: 'List' },
    { id: 'email', label: 'Email Configuration', icon: 'Mail' },
    { id: 'authentication', label: 'Authentication', icon: 'Shield' },
    { id: 'ldap', label: 'LDAP Configuration', icon: 'Server' }
  ];

  // Load lookup types on mount
  useEffect(() => {
    loadLookupTypes();
    loadAllCategories(); // Load all categories to get distinct departments
  }, []);

  useEffect(() => {
    if (activeTab === 'categories') {
      loadCategories();
    } else if (activeTab === 'lookups') {
      loadLookups();
    }
  }, [activeTab, selectedDepartment, selectedParent, selectedLookupType]);

  const loadAllCategories = async () => {
    try {
      const response = await api.get('/categories');
      const allCategories = response.data.data || [];
      
      // Filter only parent categories (parent_id is null)
      const parentCategories = allCategories.filter(cat => cat.parent_id === null);
      
      // Get distinct departments (case-insensitive) from parent categories only
      const deptMap = new Map();
      parentCategories.forEach(cat => {
        if (cat.department) {
          const lowerDept = cat.department.toLowerCase();
          if (!deptMap.has(lowerDept)) {
            deptMap.set(lowerDept, cat.department); // Store original case
          }
        }
      });
      
      const distinctDepts = Array.from(deptMap.values()).map(dept => ({
        value: dept,
        label: dept
      }));
      
      setDepartments([{ value: 'all', label: 'All Departments' }, ...distinctDepts]);
      
      // Get parent categories (only categories with parent_id = null)
      const distinctParents = parentCategories.map(parent => ({
        value: parent.id,
        label: parent.name
      }));
      
      setParentCategories([{ value: 'all', label: 'All Categories' }, ...distinctParents]);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadLookupTypes = async () => {
    try {
      const response = await api.get('/lookups/types');
      if (response.data.success) {
        const types = response.data.data.map(type => ({
          value: type,
          label: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }));
        setLookupTypes([{ value: 'all', label: 'All Types' }, ...types]);
      }
    } catch (error) {
      console.error('Error loading lookup types:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      let filteredCategories = response.data.data || [];
      
      // Apply case-insensitive department filter on frontend
      if (selectedDepartment !== 'all') {
        const selectedDeptLower = selectedDepartment.toLowerCase();
        filteredCategories = filteredCategories.filter(cat => 
          cat.department && cat.department.toLowerCase() === selectedDeptLower
        );
      }
      
      // Apply parent category filter
      if (selectedParent !== 'all') {
        filteredCategories = filteredCategories.filter(cat => 
          cat.parent_id && cat.parent_id.toString() === selectedParent.toString()
        );
      }
      
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLookupType !== 'all') {
        params.type = selectedLookupType;
      }
      const response = await api.get('/lookups', { params });
      if (selectedLookupType !== 'all') {
        setLookups({ [selectedLookupType]: response.data.data || [] });
      } else {
        setLookups(response.data.data || {});
      }
    } catch (error) {
      console.error('Error loading lookups:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleDeleteLookup = async (id) => {
    if (!confirm('Are you sure you want to delete this lookup?')) return;
    try {
      await api.delete(`/admin/lookups/${id}`);
      loadLookups();
      toast.success('Lookup deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete lookup');
    }
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': 'bg-success/10 text-success',
      'Inactive': 'bg-error/10 text-error',
      true: 'bg-success/10 text-success',
      false: 'bg-error/10 text-error'
    };
    
    const label = typeof status === 'boolean' ? (status ? 'Active' : 'Inactive') : status;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {label}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level - 1] || 'bg-gray-100 text-gray-700'}`}>
        Level {level}
      </span>
    );
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-foreground">Category Management</h4>
          <p className="text-sm text-muted-foreground">Manage ticket categories and sub-categories hierarchy</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            {departments.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            {parentCategories.map(parent => (
              <option key={parent.value} value={parent.value}>{parent.label}</option>
            ))}
          </select>
          <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => setShowCategoryModal(true)}>
            Add Category
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name (EN)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name (MS)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Level</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Parent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm text-foreground font-mono">{category.code}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{category.name}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{category.name_ms || '-'}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{category.department}</td>
                  <td className="py-3 px-4">{getLevelBadge(category.level)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{category.parent?.name || '-'}</td>
                  <td className="py-3 px-4">{getStatusBadge(category.is_active)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Edit" onClick={() => {
                        setEditingItem(category);
                        setShowCategoryModal(true);
                      }}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" iconName="Trash2" onClick={() => handleDeleteCategory(category.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderLookups = () => {
    const lookupEntries = selectedLookupType === 'all' ? Object.entries(lookups) : [[selectedLookupType, lookups[selectedLookupType] || []]];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium text-foreground">Lookup Configuration</h4>
            <p className="text-sm text-muted-foreground">Manage system lookup values and dropdown options</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedLookupType}
              onChange={(e) => setSelectedLookupType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
            >
              {lookupTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => setShowLookupModal(true)}>
              Add Lookup
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading lookups...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {lookupEntries.map(([type, items]) => (
              <div key={type} className="border border-border rounded-lg p-4">
                <h5 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <Icon name="List" size={16} />
                  {lookupTypes.find(t => t.value === type)?.label || type}
                  <span className="text-xs text-muted-foreground">({items?.length || 0} items)</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(items || []).map((lookup) => (
                    <div key={lookup.id} className="border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {lookup.color && (
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lookup.color }}></div>
                            )}
                            <span className="text-sm font-medium text-foreground">{lookup.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{lookup.code}</p>
                        </div>
                        {getStatusBadge(lookup.is_active)}
                      </div>
                      {lookup.description && (
                        <p className="text-xs text-muted-foreground mb-2">{lookup.description}</p>
                      )}
                      <div className="flex items-center space-x-1 mt-2">
                        <Button variant="outline" size="sm" iconName="Edit" onClick={() => {
                          setEditingItem(lookup);
                          setShowLookupModal(true);
                        }}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" iconName="Trash2" onClick={() => handleDeleteLookup(lookup.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
            <p className="text-sm text-muted-foreground">Manage categories and lookups configuration</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'lookups' && renderLookups()}
        {activeTab === 'email' && <EmailConfiguration />}
        {activeTab === 'authentication' && <AuthenticationConfiguration />}
        {activeTab === 'ldap' && <LdapConfiguration />}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingItem}
          categories={categories}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowCategoryModal(false);
            setEditingItem(null);
            loadCategories();
          }}
        />
      )}

      {/* Lookup Modal */}
      {showLookupModal && (
        <LookupModal
          lookup={editingItem}
          lookupTypes={lookupTypes}
          onClose={() => {
            setShowLookupModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowLookupModal(false);
            setEditingItem(null);
            loadLookups();
          }}
        />
      )}
    </div>
  );
};

export default SystemConfigurationPanel;