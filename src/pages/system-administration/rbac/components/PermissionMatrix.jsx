import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import api from '../../../../services/api';

const PermissionMatrix = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const iconMap = {
    'Ticket Management': 'Ticket',
    'Customer Management': 'Users',
    'Reporting & Analytics': 'BarChart',
    'System Administration': 'Settings',
    'Knowledge Base': 'BookOpen',
    'Telephony (Mitel)': 'Phone'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/permissions-matrix');
      
      setRoles(response.data.roles);
      
      // Set first role as default selected
      if (response.data.roles.length > 0 && !selectedRole) {
        setSelectedRole(response.data.roles[0].slug);
      }
      
      // Transform matrix data into modules structure
      const modulesData = response.data.matrix.map(item => ({
        name: item.module,
        icon: iconMap[item.module] || 'Circle',
        permissions: item.permissions.map(perm => ({
          id: perm.id,
          key: perm.slug,
          label: perm.name,
          description: perm.description,
          ...perm.roles // Spread role permissions (admin: true, supervisor: false, etc.)
        }))
      }));
      
      setModules(modulesData);
      setPermissions(modulesData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading permission matrix:', error);
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (moduleIndex, permissionIndex) => {
    const updatedPermissions = [...permissions];
    const permission = updatedPermissions[moduleIndex].permissions[permissionIndex];
    permission[selectedRole] = !permission[selectedRole];
    setPermissions(updatedPermissions);
    setHasChanges(true);
  };

  const toggleAllInModule = (moduleIndex) => {
    const updatedPermissions = [...permissions];
    const module = updatedPermissions[moduleIndex];
    const allEnabled = module.permissions.every(p => p[selectedRole]);
    module.permissions.forEach(p => {
      p[selectedRole] = !allEnabled;
    });
    setPermissions(updatedPermissions);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    try {
      setSaving(true);
      
      // Get the selected role object
      const role = roles.find(r => r.slug === selectedRole);
      if (!role) {
        toast.error('Selected role not found');
        return;
      }

      // Collect all permission IDs that are enabled for the selected role
      const enabledPermissions = [];
      permissions.forEach(module => {
        module.permissions.forEach(permission => {
          if (permission[selectedRole]) {
            enabledPermissions.push(permission.id);
          }
        });
      });

      console.log('Saving permissions for role:', role.name);
      console.log('Enabled permission IDs:', enabledPermissions);

      // Save to API
      const response = await api.post(`/roles/${role.id}/permissions`, {
        permissions: enabledPermissions
      });

      console.log('Save response:', response);

      toast.success(`Permissions updated successfully for ${role.name}`);
      setHasChanges(false);
      
      // Reload to ensure sync with backend
      await loadData();
    } catch (error) {
      console.error('Error saving permissions:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Are you sure you want to reload permissions from the server? Any unsaved changes will be lost.')) {
      await loadData();
      toast.info('Permissions reloaded from server');
    }
  };

  const getPermissionCount = (roleSlug) => {
    let count = 0;
    permissions.forEach(module => {
      module.permissions.forEach(permission => {
        if (permission[roleSlug]) count++;
      });
    });
    return count;
  };

  const filteredModules = permissions.filter(module =>
    searchQuery === '' ||
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.permissions.some(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading permission matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Select Role to Configure</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {roles.map((role) => (
            <button
              key={role.slug}
              onClick={() => setSelectedRole(role.slug)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === role.slug
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon name="Shield" size={24} className={selectedRole === role.slug ? 'text-primary' : 'text-muted-foreground'} />
                {selectedRole === role.slug && (
                  <Icon name="CheckCircle" size={20} className="text-primary" />
                )}
              </div>
              <h4 className="font-semibold text-foreground mb-1">{role.name}</h4>
              <p className="text-sm text-muted-foreground">
                {getPermissionCount(role.slug)} permissions
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <Input
              icon="Search"
              placeholder="Search permissions by module or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                Unsaved changes
              </span>
            )}
            <Button 
              variant="outline" 
              iconName="RotateCcw" 
              iconPosition="left"
              onClick={handleResetToDefault}
              disabled={saving}
            >
              Reset to Default
            </Button>
            <Button 
              variant="default" 
              iconName="Save" 
              iconPosition="left"
              onClick={handleSaveChanges}
              disabled={saving || !hasChanges}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="space-y-4">
        {filteredModules.map((module, moduleIndex) => {
          const modulePermissions = module.permissions.filter(p => p[selectedRole]);
          const allEnabled = module.permissions.every(p => p[selectedRole]);
          
          return (
            <div key={module.name} className="bg-card rounded-lg border border-border overflow-hidden">
              {/* Module Header */}
              <div className="bg-muted/30 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name={module.icon} size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{module.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {modulePermissions.length} of {module.permissions.length} permissions enabled
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAllInModule(moduleIndex)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <Icon 
                      name={allEnabled ? "CheckSquare" : "Square"} 
                      size={16} 
                      className={allEnabled ? 'text-primary' : 'text-muted-foreground'}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {allEnabled ? 'Disable All' : 'Enable All'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Permissions List */}
              <div className="divide-y divide-border">
                {module.permissions.map((permission, permissionIndex) => (
                  <div
                    key={permission.key}
                    className="px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => togglePermission(moduleIndex, permissionIndex)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            permission[selectedRole]
                              ? 'bg-primary border-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {permission[selectedRole] && (
                            <Icon name="Check" size={14} className="text-white" />
                          )}
                        </button>
                        <div>
                          <p className="font-medium text-foreground">{permission.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">{permission.key}</p>
                        </div>
                      </div>
                      
                      {/* Other Roles Quick View */}
                      <div className="flex items-center space-x-2">
                        {roles.filter(r => r.slug !== selectedRole).map(role => (
                          <div
                            key={role.slug}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              permission[role.slug]
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500'
                            }`}
                            title={`${role.name}: ${permission[role.slug] ? 'Enabled' : 'Disabled'}`}
                          >
                            {role.name.substring(0, 3)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Panel */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Permission Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roles.map(role => (
            <div key={role.slug} className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">{role.name}</p>
              <p className="text-2xl font-bold text-foreground">{getPermissionCount(role.slug)}</p>
              <p className="text-xs text-muted-foreground mt-1">permissions enabled</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="AlertTriangle" size={20} className="text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Important</h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Changes to permissions will take effect immediately for all users with this role. 
              Users will need to re-login to see updated permissions reflected in their session.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="Search" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No permissions found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default PermissionMatrix;
