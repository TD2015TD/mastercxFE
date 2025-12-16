import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import {
  getUsers,
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  updateUserStatus
} from '../../../services/userService';
import { toast } from 'react-toastify';

const UserManagementPanel = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
  });

  // Load users on component mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, selectedRole, pagination.current_page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        search: searchTerm || undefined,
        role_id: selectedRole || undefined,
        page: pagination.current_page,
        per_page: pagination.per_page,
      };

      const response = await getUsers(filters);
      
      if (response.success) {
        setUsers(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          total: response.data.total,
          per_page: response.data.per_page,
        });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    try {
      await bulkActivateUsers(selectedUsers);
      toast.success('Users activated successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      console.error('Error activating users:', err);
      toast.error('Failed to activate users');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await bulkDeactivateUsers(selectedUsers);
      toast.success('Users deactivated successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      console.error('Error deactivating users:', err);
      toast.error('Failed to deactivate users');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete the selected users?')) return;

    try {
      await bulkDeleteUsers(selectedUsers);
      toast.success('Users deleted successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting users:', err);
      toast.error('Failed to delete users');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateUserStatus(userId, newStatus);
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

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
      'active': 'bg-success/10 text-success',
      'inactive': 'bg-error/10 text-error'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[status?.toLowerCase()]}`}>
        {status}
      </span>);

  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !users.length) {
    return (
      <div className="bg-card rounded-lg border border-border p-12">
        <div className="flex items-center justify-center">
          <Icon name="Loader" size={32} className="animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">Loading users...</span>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate('/system-administration/users/create')}>

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
                <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                  Deactivate
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        }

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center">
              <Icon name="AlertTriangle" size={20} className="text-error mr-2" />
              <span className="text-sm text-error">{error}</span>
            </div>
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center">
                    <Icon name="Loader" size={24} className="animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users?.map((user) =>
              <tr key={user?.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <Checkbox
                    checked={selectedUsers?.includes(user?.id)}
                    onChange={(e) => handleUserSelection(user?.id, e?.target?.checked)} />

                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <Icon name="User" size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{user?.role?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{user?.agent?.department || 'N/A'}</td>
                  <td className="py-3 px-4">{getStatusBadge(user?.status)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatLastLogin(user?.last_login)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        iconName="Edit"
                        onClick={() => navigate(`/system-administration/users/${user?.id}/edit`)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" iconName="MoreHorizontal">
                        More
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

};

export default UserManagementPanel;