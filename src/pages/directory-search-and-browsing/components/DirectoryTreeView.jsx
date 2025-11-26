import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DirectoryTreeView = ({ 
  departmentStructure = [], 
  selectedDepartment, 
  selectedCategory, 
  onDepartmentSelect, 
  onCategorySelect 
}) => {
  const [expandedDepartments, setExpandedDepartments] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleDepartmentExpansion = (departmentId) => {
    setExpandedDepartments(prev => 
      prev?.includes(departmentId)
        ? prev?.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => 
      prev?.includes(categoryId)
        ? prev?.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDepartmentClick = (departmentId) => {
    onDepartmentSelect?.(departmentId);
    if (!expandedDepartments?.includes(departmentId)) {
      toggleDepartmentExpansion(departmentId);
    }
  };

  const handleCategoryClick = (categoryId) => {
    onCategorySelect?.(categoryId);
    if (!expandedCategories?.includes(categoryId)) {
      toggleCategoryExpansion(categoryId);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Browse Directory</h3>
        <button
          onClick={() => {
            onDepartmentSelect?.('all');
            onCategorySelect?.('all');
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear Selection
        </button>
      </div>
      
      <div className="space-y-1">
        {/* All Departments Option */}
        <button
          onClick={() => {
            onDepartmentSelect?.('all');
            onCategorySelect?.('all');
          }}
          className={`w-full text-left flex items-center space-x-2 p-2 rounded-md text-sm transition-colors duration-200 ${
            selectedDepartment === 'all' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Icon name="FolderOpen" size={16} />
          <span>All Departments</span>
        </button>

        {/* Department Tree */}
        {departmentStructure?.map((department) => (
          <div key={department?.id} className="space-y-1">
            {/* Department Level */}
            <div className="flex items-center">
              <button
                onClick={() => toggleDepartmentExpansion(department?.id)}
                className="p-1 hover:bg-muted rounded mr-1"
              >
                <Icon 
                  name={expandedDepartments?.includes(department?.id) ? 'ChevronDown' : 'ChevronRight'} 
                  size={14} 
                />
              </button>
              
              <button
                onClick={() => handleDepartmentClick(department?.id)}
                className={`flex-1 text-left flex items-center space-x-2 p-2 rounded-md text-sm transition-colors duration-200 ${
                  selectedDepartment === department?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={department?.icon || 'Folder'} size={16} />
                <span className="font-medium">{department?.name}</span>
              </button>
            </div>

            {/* Categories Level */}
            {expandedDepartments?.includes(department?.id) && (
              <div className="ml-6 space-y-1">
                {department?.categories?.map((category) => (
                  <div key={category?.id} className="space-y-1">
                    {/* Category Level */}
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCategoryExpansion(category?.id)}
                        className="p-1 hover:bg-muted rounded mr-1"
                      >
                        <Icon 
                          name={expandedCategories?.includes(category?.id) ? 'ChevronDown' : 'ChevronRight'} 
                          size={12} 
                        />
                      </button>
                      
                      <button
                        onClick={() => handleCategoryClick(category?.id)}
                        className={`flex-1 text-left flex items-center space-x-2 p-1.5 rounded-md text-sm transition-colors duration-200 ${
                          selectedCategory === category?.id
                            ? 'bg-primary/20 text-primary font-medium' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon name="FolderMinus" size={14} />
                        <span>{category?.name}</span>
                      </button>
                    </div>

                    {/* Subcategories Level */}
                    {expandedCategories?.includes(category?.id) && (
                      <div className="ml-6 space-y-0.5">
                        {category?.subcategories?.map((subcategory) => (
                          <button
                            key={subcategory?.id}
                            onClick={() => {
                              // Handle subcategory selection if needed
                              console.log('Subcategory selected:', subcategory?.id);
                            }}
                            className="w-full text-left flex items-center space-x-2 p-1.5 rounded-md text-xs transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                          >
                            <Icon name="FileText" size={12} />
                            <span>{subcategory?.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Tree Navigation Tips */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center space-x-1">
            <Icon name="Info" size={12} />
            <span>Click to expand/collapse sections</span>
          </div>
          <div>Select department or category to filter articles</div>
        </div>
      </div>
    </div>
  );
};

export default DirectoryTreeView;