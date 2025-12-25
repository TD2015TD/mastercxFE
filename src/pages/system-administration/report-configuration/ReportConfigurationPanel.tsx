import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import DashboardForm from './components/DashboardForm';
import RoleAssignment from './components/RoleAssignment';
import supersetDashboardService, { type SupersetDashboard } from '../../../services/supersetDashboardService';

const ReportConfigurationPanel: React.FC = () => {
  const [dashboards, setDashboards] = useState<SupersetDashboard[]>([]);
  const [filteredDashboards, setFilteredDashboards] = useState<SupersetDashboard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showDashboardForm, setShowDashboardForm] = useState(false);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<SupersetDashboard | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<SupersetDashboard | null>(null);

  useEffect(() => {
    loadDashboards();
    loadCategories();
  }, []);

  useEffect(() => {
    filterDashboards();
  }, [dashboards, searchTerm, categoryFilter, statusFilter]);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      const response = await supersetDashboardService.getDashboards();
      if (response.success && response.data) {
        setDashboards(response.data);
      } else {
        toast.error(response.error || 'Failed to load dashboards');
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await supersetDashboardService.getCategories();
      if (response.success && response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterDashboards = () => {
    let filtered = [...dashboards];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dashboard) =>
          dashboard.title_en?.toLowerCase().includes(search) ||
          dashboard.title_ms?.toLowerCase().includes(search) ||
          dashboard.slug?.toLowerCase().includes(search) ||
          dashboard.category?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((dashboard) => dashboard.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter((dashboard) => dashboard.is_active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter((dashboard) => !dashboard.is_active);
      } else if (statusFilter === 'public') {
        filtered = filtered.filter((dashboard) => dashboard.is_public);
      } else if (statusFilter === 'private') {
        filtered = filtered.filter((dashboard) => !dashboard.is_public);
      }
    }

    setFilteredDashboards(filtered);
  };

  const handleCreateDashboard = () => {
    setEditingDashboard(null);
    setShowDashboardForm(true);
  };

  const handleEditDashboard = (dashboard: SupersetDashboard) => {
    setEditingDashboard(dashboard);
    setShowDashboardForm(true);
  };

  const handleDeleteDashboard = async (dashboard: SupersetDashboard) => {
    if (!confirm(`Are you sure you want to delete "${dashboard.title_en}"?`)) {
      return;
    }

    try {
      const response = await supersetDashboardService.deleteDashboard(dashboard.id);
      if (response.success) {
        toast.success('Dashboard deleted successfully');
        loadDashboards();
      } else {
        toast.error(response.error || 'Failed to delete dashboard');
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast.error('Failed to delete dashboard');
    }
  };

  const handleManageRoles = (dashboard: SupersetDashboard) => {
    setSelectedDashboard(dashboard);
    setShowRoleAssignment(true);
  };

  const handleFormSuccess = () => {
    setShowDashboardForm(false);
    setEditingDashboard(null);
    loadDashboards();
    loadCategories();
  };

  const handleRoleAssignmentSuccess = () => {
    setShowRoleAssignment(false);
    setSelectedDashboard(null);
    loadDashboards();
  };

  const stats = {
    total: dashboards.length,
    active: dashboards.filter((d) => d.is_active).length,
    public: dashboards.filter((d) => d.is_public).length,
    categories: categories.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Icon name="BarChart" className="mr-2" size={24} />
              Report & Dashboard Configuration
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure Superset dashboards and assign role-based access
            </p>
          </div>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={handleCreateDashboard}
          >
            Create Dashboard
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dashboards</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <Icon name="BarChart" size={32} className="text-primary" />
            </div>
          </div>
          <div className="bg-success/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success mt-1">{stats.active}</p>
              </div>
              <Icon name="CheckCircle" size={32} className="text-success" />
            </div>
          </div>
          <div className="bg-blue-500/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Public</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.public}</p>
              </div>
              <Icon name="Globe" size={32} className="text-blue-600" />
            </div>
          </div>
          <div className="bg-purple-500/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.categories}</p>
              </div>
              <Icon name="FolderOpen" size={32} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search dashboards by title, slug, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value as string)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]}
            className="w-full md:w-48"
          />
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as string)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'public', label: 'Public' },
              { value: 'private', label: 'Private' },
            ]}
            className="w-full md:w-48"
          />
        </div>
      </div>

      {/* Dashboard List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader" size={32} className="animate-spin text-primary" />
          </div>
        ) : filteredDashboards.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No dashboards found</p>
            {dashboards.length === 0 && (
              <Button
                variant="outline"
                className="mt-4"
                iconName="Plus"
                iconPosition="left"
                onClick={handleCreateDashboard}
              >
                Create Your First Dashboard
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Dashboard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Assigned Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDashboards.map((dashboard) => (
                  <tr key={dashboard.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {dashboard.icon && (
                          <Icon name={dashboard.icon} size={20} className="mr-3 text-primary" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{dashboard.title_en}</p>
                          <p className="text-sm text-muted-foreground">{dashboard.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dashboard.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {dashboard.category}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dashboard.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {dashboard.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dashboard.is_public
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                      >
                        <Icon
                          name={dashboard.is_public ? 'Globe' : 'Lock'}
                          size={12}
                          className="mr-1"
                        />
                        {dashboard.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {dashboard.roles && dashboard.roles.length > 0
                          ? `${dashboard.roles.length} role${dashboard.roles.length > 1 ? 's' : ''}`
                          : 'No roles'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">{dashboard.order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Users"
                          onClick={() => handleManageRoles(dashboard)}
                          title="Manage Roles"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Edit"
                          onClick={() => handleEditDashboard(dashboard)}
                          title="Edit"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Trash2"
                          onClick={() => handleDeleteDashboard(dashboard)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dashboard Form Modal */}
      {showDashboardForm && (
        <DashboardForm
          dashboard={editingDashboard}
          onClose={() => {
            setShowDashboardForm(false);
            setEditingDashboard(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Role Assignment Modal */}
      {showRoleAssignment && selectedDashboard && (
        <RoleAssignment
          dashboard={selectedDashboard}
          onClose={() => {
            setShowRoleAssignment(false);
            setSelectedDashboard(null);
          }}
          onSuccess={handleRoleAssignmentSuccess}
        />
      )}
    </div>
  );
};

export default ReportConfigurationPanel;
