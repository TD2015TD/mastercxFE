import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import {
  getUsers,
  getRoles,
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  updateUserStatus
} from '../../../services/userService';
import { toast } from 'react-toastify';

const UserManagementPanel = () => {
  const navigate = useNavigate();

  // ─── State ───────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchDebounceTimer = useRef(null);
  const [selectedRole, setSelectedRole] = useState('');        // stores role id as string; cast to Number before API call
  const [roleOptions, setRoleOptions] = useState([{ value: '', label: 'All Roles' }]); // populated from /api/v1/roles
  const [selectedUsers, setSelectedUsers] = useState([]);      // user ids for bulk actions
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMoreMenu, setOpenMoreMenu] = useState(null);      // user id of currently open More dropdown
  const moreMenuRef = useRef(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1,
  });
  // ─────────────────────────────────────────────────────────────────────

  // ─── Effects ──────────────────────────────────────────────────────────
  // Debounce search input
  useEffect(() => {
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, current_page: 1 }));
    }, 400);
    return () => clearTimeout(searchDebounceTimer.current);
  }, [searchTerm]);

  // Load roles from API on mount to populate the role filter dropdown
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await getRoles();
        const rolesData = res.data?.data || res.data || [];
        const options = [
          { value: '', label: 'All Roles' },
          ...rolesData.map(r => ({ value: String(r.id), label: r.name }))
        ];
        setRoleOptions(options);
      } catch (err) {
        console.error('Error loading roles:', err);
      }
    };
    loadRoles();
  }, []);

  // Re-fetch user list whenever debounced search, role filter, or page changes
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, selectedRole, pagination.current_page]);

  // Close More dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setOpenMoreMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // ─────────────────────────────────────────────────────────────────────

  // ─── Data Fetching ─────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        search: debouncedSearch || undefined,
        role_id: selectedRole ? Number(selectedRole) : undefined,
        page: pagination.current_page,
        per_page: pagination.per_page,
      };

      const response = await getUsers(filters);

      if (response.success) {
        setUsers(response.data.data);
        setPagination(prev => ({
          ...prev,
          current_page: response.data.current_page,
          total: response.data.total,
          per_page: response.data.per_page,
          last_page: response.data.last_page || 1,
        }));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // ─── Bulk Action Handlers ────────────────────────────────────────────
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

  // ─── Row-level Action Handlers ───────────────────────────────────────
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateUserStatus(userId, newStatus);
      toast.success('User status updated successfully');
      setOpenMoreMenu(null);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await bulkDeleteUsers([userId]);
      toast.success('User deleted successfully');
      setOpenMoreMenu(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  // ─── Filter Options ────────────────────────────────────────────────────
  // Alias so JSX reads naturally; roleOptions is the source of truth
  const roles = roleOptions;

  // ─── Selection Helpers ────────────────────────────────────────────────
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

  // ─── Rendering Utilities ─────────────────────────────────────────────
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

  // Compute page numbers (sliding window ±2)
  const getPageNumbers = () => {
    const start = Math.max(1, pagination.current_page - 2);
    const end = Math.min(pagination.last_page, pagination.current_page + 2);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)} />

          <Select
            placeholder="Filter by role"
            options={roles}
            value={selectedRole}
            onChange={(value) => {
              setSelectedRole(value);
              setPagination(prev => ({ ...prev, current_page: 1 }));
            }} />
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
                    checked={selectedUsers?.length === users?.length && users?.length > 0}
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
                      {/* More dropdown */}
                      <div className="relative" ref={openMoreMenu === user?.id ? moreMenuRef : null}>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="MoreHorizontal"
                          onClick={() => setOpenMoreMenu(openMoreMenu === user?.id ? null : user?.id)}>
                          More
                        </Button>
                        {openMoreMenu === user?.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-50">
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
                              onClick={() => {
                                setOpenMoreMenu(null);
                                navigate(`/system-administration/users/${user?.id}/edit`);
                              }}>
                              <Icon name="Eye" size={15} />
                              View Profile
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                              onClick={() => handleToggleUserStatus(user?.id, user?.status)}>
                              <Icon name={user?.status === 'active' ? 'UserX' : 'UserCheck'} size={15} />
                              {user?.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors rounded-b-lg"
                              onClick={() => handleDeleteUser(user?.id)}>
                              <Icon name="Trash2" size={15} />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.last_page > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1}–{Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} users
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => setPagination(prev => ({ ...prev, current_page: 1 }))}>
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}>
                ‹
              </Button>
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, current_page: page }))}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    pagination.current_page === page
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}>
                  {page}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}>
                ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPagination(prev => ({ ...prev, current_page: pagination.last_page }))}>
                »
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>);

};

export default UserManagementPanel;
