import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserManagementPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const users = [
  {
    id: 1,
    name: "Ahmad Rahman",
    email: "ahmad.rahman@jkdm.gov.my",
    role: "Agent",
    department: "Customer Service",
    status: "Active",
    lastLogin: "2024-10-28 09:15:00",
    avatar: "https://images.unsplash.com/photo-1588178457501-31b7688a41a0",
    avatarAlt: "Professional headshot of Malaysian man with short black hair in white shirt"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@jkdm.gov.my",
    role: "Supervisor",
    department: "Customs Operations",
    status: "Active",
    lastLogin: "2024-10-28 08:45:00",
    avatar: "https://images.unsplash.com/photo-1672867209978-1183d00d4714",
    avatarAlt: "Professional headshot of Malaysian woman with long black hair in navy blazer"
  },
  {
    id: 3,
    name: "Raj Kumar",
    email: "raj.kumar@jkdm.gov.my",
    role: "Agent",
    department: "Trade Compliance",
    status: "Inactive",
    lastLogin: "2024-10-25 16:30:00",
    avatar: "https://images.unsplash.com/photo-1585066047759-3438c34cf676",
    avatarAlt: "Professional headshot of Indian man with beard wearing dark suit"
  },
  {
    id: 4,
    name: "Lim Wei Ming",
    email: "lim.weiming@jkdm.gov.my",
    role: "Admin",
    department: "IT Operations",
    status: "Active",
    lastLogin: "2024-10-28 10:20:00",
    avatar: "https://images.unsplash.com/photo-1698072556534-40ec6e337311",
    avatarAlt: "Professional headshot of Chinese man with glasses in light blue shirt"
  }];


  const departments = [
  { value: '', label: 'All Departments' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'customs-operations', label: 'Customs Operations' },
  { value: 'trade-compliance', label: 'Trade Compliance' },
  { value: 'it-operations', label: 'IT Operations' }];


  const roles = [
  { value: '', label: 'All Roles' },
  { value: 'agent', label: 'Agent' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'admin', label: 'Administrator' }];


  const handleUserSelection = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers?.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users?.map((user) => user?.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': 'bg-success/10 text-success',
      'Inactive': 'bg-error/10 text-error'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[status]}`}>
        {status}
      </span>);

  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Button
            variant="default"
            iconName="UserPlus"
            iconPosition="left"
            onClick={() => setShowAddUserModal(true)}>

            Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)} />

          <Select
            placeholder="Filter by department"
            options={departments}
            value={selectedDepartment}
            onChange={setSelectedDepartment} />

          <Select
            placeholder="Filter by role"
            options={roles}
            value={selectedRole}
            onChange={setSelectedRole} />

        </div>
      </div>
      <div className="p-6">
        {/* Bulk Actions */}
        {selectedUsers?.length > 0 &&
        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {selectedUsers?.length} user(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Activate
                </Button>
                <Button variant="outline" size="sm">
                  Deactivate
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        }

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">
                  <Checkbox
                    checked={selectedUsers?.length === users?.length}
                    indeterminate={selectedUsers?.length > 0 && selectedUsers?.length < users?.length}
                    onChange={(e) => handleSelectAll(e?.target?.checked)} />

                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Login</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) =>
              <tr key={user?.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <Checkbox
                    checked={selectedUsers?.includes(user?.id)}
                    onChange={(e) => handleUserSelection(user?.id, e?.target?.checked)} />

                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                        <img
                        src={user?.avatar}
                        alt={user?.avatarAlt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/no_image.png';
                        }} />

                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{user?.role}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{user?.department}</td>
                  <td className="py-3 px-4">{getStatusBadge(user?.status)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatLastLogin(user?.lastLogin)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Edit">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" iconName="MoreHorizontal">
                        More
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};

export default UserManagementPanel;