import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';

const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      code: 'admin',
      description: 'Full system access with all permissions',
      userCount: 5,
      permissionCount: 32,
      isSystem: true,
      isActive: true,
      color: 'red',
      createdAt: '2024-01-15',
      updatedAt: '2024-11-20'
    },
    {
      id: 2,
      name: 'Supervisor',
      code: 'supervisor',
      description: 'Team management and oversight capabilities',
      userCount: 12,
      permissionCount: 24,
      isSystem: true,
      isActive: true,
      color: 'blue',
      createdAt: '2024-01-15',
      updatedAt: '2024-11-18'
    },
    {
      id: 3,
      name: 'Agent',
      code: 'agent',
      description: 'Standard agent with ticket and customer management',
      userCount: 215,
      permissionCount: 16,
      isSystem: true,
      isActive: true,
      color: 'green',
      createdAt: '2024-01-15',
      updatedAt: '2024-11-15'
    },
    {
      id: 4,
      name: 'Customer',
      code: 'customer',
      description: 'Limited access for citizen portal users',
      userCount: 15420,
      permissionCount: 4,
      isSystem: true,
      isActive: true,
      color: 'gray',
      createdAt: '2024-01-15',
      updatedAt: '2024-11-22'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: 'blue',
    isActive: true
  });

  const roleColors = [
    { value: 'red', label: 'Red', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'green', label: 'Green', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' }
  ];

  const handleCreateRole = () => {
    setSelectedRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      color: 'blue',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description,
      color: role.color,
      isActive: role.isActive
    });
    setIsModalOpen(true);
  };

  const handleSaveRole = () => {
    // TODO: API call to save role
    console.log('Saving role:', formData);
    setIsModalOpen(false);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      // TODO: API call to delete role
      console.log('Deleting role:', roleId);
    }
  };

  const getRoleColorClass = (color) => {
    const roleColor = roleColors.find(c => c.value === color);
    return roleColor?.class || roleColors[0].class;
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <Input
              icon="Search"
              placeholder="Search roles by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" iconName="Filter" iconPosition="left">
              Filter
            </Button>
            <Button variant="default" iconName="Plus" iconPosition="left" onClick={handleCreateRole}>
              Create Role
            </Button>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-card rounded-lg border border-border hover:border-primary/50 transition-all duration-200">
            <div className="p-6">
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${getRoleColorClass(role.color)} flex items-center justify-center`}>
                    <Icon name="Shield" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{role.code}</span>
                  </div>
                </div>
                {role.isSystem && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    <Icon name="Lock" size={12} className="mr-1" />
                    System
                  </span>
                )}
              </div>

              {/* Role Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {role.description}
              </p>

              {/* Role Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Users</p>
                  <p className="text-xl font-bold text-foreground">{role.userCount.toLocaleString()}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Permissions</p>
                  <p className="text-xl font-bold text-foreground">{role.permissionCount}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                {role.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <Icon name="CheckCircle" size={12} className="mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                    <Icon name="XCircle" size={12} className="mr-1" />
                    Inactive
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Edit"
                  iconPosition="left"
                  onClick={() => handleEditRole(role)}
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Users"
                  iconPosition="left"
                  fullWidth
                >
                  Users
                </Button>
                {!role.isSystem && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Trash2"
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-error hover:text-error hover:border-error"
                  />
                )}
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(role.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRole ? 'Edit Role' : 'Create New Role'}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer Support"
            />
            <Input
              label="Role Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., customer_support"
              disabled={selectedRole?.isSystem}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-[80px] p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              placeholder="Describe the role and its purpose..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role Color
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {roleColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  } ${color.class}`}
                >
                  <Icon name="Shield" size={20} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground">
              Role is active
            </label>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                After creating the role, you'll be able to assign permissions in the Permission Matrix tab.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSaveRole}>
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="Shield" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No roles found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first role to get started'}
          </p>
          {!searchQuery && (
            <Button variant="default" iconName="Plus" iconPosition="left" onClick={handleCreateRole}>
              Create Role
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
