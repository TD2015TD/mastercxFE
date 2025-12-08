import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';

const UserRoleAssignment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const roles = [
    { value: 'admin', label: 'Administrator', color: 'red' },
    { value: 'supervisor', label: 'Supervisor', color: 'blue' },
    { value: 'agent', label: 'Agent', color: 'green' },
    { value: 'customer', label: 'Customer', color: 'gray' }
  ];

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Ahmad Abdullah',
      email: 'ahmad.abdullah@jkdm.gov.my',
      role: 'admin',
      department: 'IT Department',
      status: 'active',
      lastLogin: '2024-11-30 09:15:23',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@jkdm.gov.my',
      role: 'supervisor',
      department: 'Customer Service',
      status: 'active',
      lastLogin: '2024-11-30 08:45:12',
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'Muhammad Ali',
      email: 'muhammad.ali@jkdm.gov.my',
      role: 'agent',
      department: 'Customer Service',
      status: 'active',
      lastLogin: '2024-11-30 09:30:45',
      createdAt: '2024-03-10'
    },
    {
      id: 4,
      name: 'Fatimah Zahra',
      email: 'fatimah.zahra@jkdm.gov.my',
      role: 'agent',
      department: 'Customer Service',
      status: 'active',
      lastLogin: '2024-11-29 17:22:10',
      createdAt: '2024-03-12'
    },
    {
      id: 5,
      name: 'Kumar Raj',
      email: 'kumar.raj@jkdm.gov.my',
      role: 'supervisor',
      department: 'Technical Support',
      status: 'active',
      lastLogin: '2024-11-30 07:55:33',
      createdAt: '2024-02-28'
    },
    {
      id: 6,
      name: 'Lee Wei Ming',
      email: 'lee.weiming@jkdm.gov.my',
      role: 'agent',
      department: 'Technical Support',
      status: 'inactive',
      lastLogin: '2024-11-20 14:10:00',
      createdAt: '2024-04-05'
    }
  ]);

  const getRoleColor = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role?.color || 'gray';
  };

  const getRoleLabel = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role?.label || roleValue;
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveRoleChange = () => {
    // TODO: API call to update user role
    console.log('Updating role for user:', selectedUser);
    setIsModalOpen(false);
  };

  const handleBulkRoleChange = () => {
    // TODO: Implement bulk role assignment
    console.log('Bulk role change');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleStats = () => {
    const stats = {};
    roles.forEach(role => {
      stats[role.value] = users.filter(u => u.role === role.value).length;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map(role => (
          <div key={role.value} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{role.label}</p>
                <p className="text-2xl font-bold text-foreground">{roleStats[role.value]}</p>
              </div>
              <Icon name="Shield" size={24} className={`text-${role.color}-600`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              icon="Search"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-foreground">{user.department}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800 dark:bg-${getRoleColor(user.role)}-900/30 dark:text-${getRoleColor(user.role)}-400`}>
                      <Icon name="Shield" size={12} className="mr-1" />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === 'active' ? (
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.lastLogin).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Edit"
                      iconPosition="left"
                      onClick={() => handleChangeRole(user)}
                    >
                      Change Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-muted/30 px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="ChevronLeft">
                Previous
              </Button>
              <Button variant="outline" size="sm" iconName="ChevronRight">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Zap" size={20} className="mr-2 text-primary" />
          Bulk Actions
        </h3>
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="UserPlus" iconPosition="left" onClick={handleBulkRoleChange}>
            Bulk Role Assignment
          </Button>
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export User List
          </Button>
          <Button variant="outline" iconName="Upload" iconPosition="left">
            Import Users
          </Button>
        </div>
      </div>

      {/* Change Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Change User Role"
        maxWidth="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <span className="text-lg font-semibold text-primary">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedUser.department}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Role
              </label>
              <div className="bg-muted/30 rounded-lg p-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-${getRoleColor(selectedUser.role)}-100 text-${getRoleColor(selectedUser.role)}-800 dark:bg-${getRoleColor(selectedUser.role)}-900/30 dark:text-${getRoleColor(selectedUser.role)}-400`}>
                  <Icon name="Shield" size={14} className="mr-2" />
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Role
              </label>
              <Select defaultValue={selectedUser.role}>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </Select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  The user will need to log out and log back in for the new role permissions to take effect.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSaveRoleChange}>
                Update Role
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="Users" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default UserRoleAssignment;
