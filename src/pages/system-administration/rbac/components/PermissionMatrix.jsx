import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';

const PermissionMatrix = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');

  const roles = [
    { id: 'admin', name: 'Administrator', color: 'red' },
    { id: 'supervisor', name: 'Supervisor', color: 'blue' },
    { id: 'agent', name: 'Agent', color: 'green' },
    { id: 'customer', name: 'Customer', color: 'gray' }
  ];

  const modules = [
    {
      name: 'Ticket Management',
      icon: 'Ticket',
      permissions: [
        { key: 'ticket.view', label: 'View Tickets', admin: true, supervisor: true, agent: true, customer: true },
        { key: 'ticket.create', label: 'Create Tickets', admin: true, supervisor: true, agent: true, customer: true },
        { key: 'ticket.edit', label: 'Edit Tickets', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'ticket.delete', label: 'Delete Tickets', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'ticket.assign', label: 'Assign Tickets', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'ticket.escalate', label: 'Escalate Tickets', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'ticket.close', label: 'Close Tickets', admin: true, supervisor: true, agent: true, customer: false }
      ]
    },
    {
      name: 'Customer Management',
      icon: 'Users',
      permissions: [
        { key: 'customer.view', label: 'View Customers', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'customer.create', label: 'Create Customers', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'customer.edit', label: 'Edit Customers', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'customer.delete', label: 'Delete Customers', admin: true, supervisor: false, agent: false, customer: false },
        { key: 'customer.export', label: 'Export Customer Data', admin: true, supervisor: true, agent: false, customer: false }
      ]
    },
    {
      name: 'Reporting & Analytics',
      icon: 'BarChart',
      permissions: [
        { key: 'report.view', label: 'View Reports', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'report.create', label: 'Create Reports', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'report.export', label: 'Export Reports', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'analytics.view', label: 'View Analytics', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'kpi.view', label: 'View KPIs', admin: true, supervisor: true, agent: true, customer: false }
      ]
    },
    {
      name: 'System Administration',
      icon: 'Settings',
      permissions: [
        { key: 'user.manage', label: 'Manage Users', admin: true, supervisor: false, agent: false, customer: false },
        { key: 'role.manage', label: 'Manage Roles', admin: true, supervisor: false, agent: false, customer: false },
        { key: 'sla.manage', label: 'Manage SLA', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'category.manage', label: 'Manage Categories', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'system.config', label: 'System Configuration', admin: true, supervisor: false, agent: false, customer: false },
        { key: 'audit.view', label: 'View Audit Logs', admin: true, supervisor: true, agent: false, customer: false }
      ]
    },
    {
      name: 'Knowledge Base',
      icon: 'BookOpen',
      permissions: [
        { key: 'kb.view', label: 'View Knowledge Base', admin: true, supervisor: true, agent: true, customer: true },
        { key: 'kb.create', label: 'Create Articles', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'kb.edit', label: 'Edit Articles', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'kb.delete', label: 'Delete Articles', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'kb.approve', label: 'Approve Articles', admin: true, supervisor: true, agent: false, customer: false }
      ]
    },
    {
      name: 'Telephony (Mitel)',
      icon: 'Phone',
      permissions: [
        { key: 'mitel.view', label: 'View Call Data', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'mitel.call', label: 'Make Calls', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'mitel.transfer', label: 'Transfer Calls', admin: true, supervisor: true, agent: true, customer: false },
        { key: 'mitel.recording', label: 'Access Recordings', admin: true, supervisor: true, agent: false, customer: false },
        { key: 'mitel.queue', label: 'Manage Queues', admin: true, supervisor: true, agent: false, customer: false }
      ]
    }
  ];

  const [permissions, setPermissions] = useState(modules);

  const togglePermission = (moduleIndex, permissionIndex) => {
    const updatedPermissions = [...permissions];
    const permission = updatedPermissions[moduleIndex].permissions[permissionIndex];
    permission[selectedRole] = !permission[selectedRole];
    setPermissions(updatedPermissions);
  };

  const toggleAllInModule = (moduleIndex) => {
    const updatedPermissions = [...permissions];
    const module = updatedPermissions[moduleIndex];
    const allEnabled = module.permissions.every(p => p[selectedRole]);
    module.permissions.forEach(p => {
      p[selectedRole] = !allEnabled;
    });
    setPermissions(updatedPermissions);
  };

  const getPermissionCount = (roleId) => {
    let count = 0;
    permissions.forEach(module => {
      module.permissions.forEach(permission => {
        if (permission[roleId]) count++;
      });
    });
    return count;
  };

  const filteredModules = permissions.filter(module =>
    searchQuery === '' ||
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.permissions.some(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Select Role to Configure</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === role.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon name="Shield" size={24} className={selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'} />
                {selectedRole === role.id && (
                  <Icon name="CheckCircle" size={20} className="text-primary" />
                )}
              </div>
              <h4 className="font-semibold text-foreground mb-1">{role.name}</h4>
              <p className="text-sm text-muted-foreground">
                {getPermissionCount(role.id)} permissions
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
            <Button variant="outline" iconName="RotateCcw" iconPosition="left">
              Reset to Default
            </Button>
            <Button variant="default" iconName="Save" iconPosition="left">
              Save Changes
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
                        {roles.filter(r => r.id !== selectedRole).map(role => (
                          <div
                            key={role.id}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              permission[role.id]
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500'
                            }`}
                            title={`${role.name}: ${permission[role.id] ? 'Enabled' : 'Disabled'}`}
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
            <div key={role.id} className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">{role.name}</p>
              <p className="text-2xl font-bold text-foreground">{getPermissionCount(role.id)}</p>
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
