import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import api from '../../../../services/api';

const MenuPermissionMatrix = () => {
  const [roles, setRoles] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [permissions, setPermissions] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [filterRole, setFilterRole] = useState('all');
  const [filterMenu, setFilterMenu] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, menusResponse] = await Promise.all([
        api.get('/roles', { params: { with_menu_items: true, per_page: 100 } }),
        api.get('/roles/available/menu-items')
      ]);

      // Handle both paginated and non-paginated responses for roles
      let rolesData = [];
      if (rolesResponse.data.data) {
        if (Array.isArray(rolesResponse.data.data)) {
          rolesData = rolesResponse.data.data;
        } else if (rolesResponse.data.data.data && Array.isArray(rolesResponse.data.data.data)) {
          rolesData = rolesResponse.data.data.data;
        }
      }

      // Handle menu items response
      const menusData = menusResponse.data.data || [];

      setRoles(rolesData);
      setMenuItems(menusData);

      // Build permissions map
      const permMap = new Map();
      rolesData.forEach(role => {
        (role.menu_items || []).forEach(menu => {
          const key = `${role.id}-${menu.id}`;
          permMap.set(key, {
            can_view: menu.pivot?.can_view || false,
            can_create: menu.pivot?.can_create || false,
            can_edit: menu.pivot?.can_edit || false,
            can_delete: menu.pivot?.can_delete || false,
          });
        });
      });
      setPermissions(permMap);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (roleId, menuId, permission) => {
    const key = `${roleId}-${menuId}`;
    const newPermissions = new Map(permissions);

    if (!newPermissions.has(key)) {
      newPermissions.set(key, {
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
      });
    }

    const current = newPermissions.get(key);
    current[permission] = !current[permission];
    newPermissions.set(key, current);
    setPermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);

      // Group permissions by role
      const rolePermissions = new Map();
      permissions.forEach((perms, key) => {
        const [roleId, menuId] = key.split('-').map(Number);

        // Only include if at least one permission is true
        if (perms.can_view || perms.can_create || perms.can_edit || perms.can_delete) {
          if (!rolePermissions.has(roleId)) {
            rolePermissions.set(roleId, []);
          }
          rolePermissions.get(roleId).push({
            menu_item_id: menuId,
            ...perms
          });
        }
      });

      // Update each role
      const updatePromises = Array.from(rolePermissions.entries()).map(([roleId, menuItems]) => {
        const role = roles.find(r => r.id === roleId);
        return api.put(`/roles/${roleId}`, {
          name: role.name,
          slug: role.slug,
          description: role.description,
          menu_items: menuItems
        });
      });

      await Promise.all(updatePromises);
      toast.success('Permissions saved successfully');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save permissions');
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleMenuExpansion = (menuId) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const buildMenuHierarchy = (menus) => {
    const menuMap = new Map();
    const rootMenus = [];

    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach(menu => {
      if (menu.parent_id) {
        const parent = menuMap.get(menu.parent_id);
        if (parent) {
          parent.children.push(menuMap.get(menu.id));
        }
      } else {
        rootMenus.push(menuMap.get(menu.id));
      }
    });

    return rootMenus;
  };

  const getPermissionKey = (roleId, menuId) => `${roleId}-${menuId}`;

  const hasPermission = (roleId, menuId, permission) => {
    const key = getPermissionKey(roleId, menuId);
    return permissions.get(key)?.[permission] || false;
  };

  const getRoleColorClass = (slug) => {
    const colorMap = {
      'super_admin': 'bg-red-500',
      'admin': 'bg-purple-500',
      'supervisor': 'bg-blue-500',
      'agent': 'bg-green-500',
      'customer': 'bg-gray-500',
    };
    return colorMap[slug] || 'bg-blue-500';
  };

  const filteredRoles = filterRole === 'all'
    ? roles
    : roles.filter(r => r.id.toString() === filterRole);

  const HIDDEN_MENU_PATHS = ['/knowledge-base-content-creator-portal'];

  const filteredMenus = menuItems
    .filter(m => !HIDDEN_MENU_PATHS.includes(m.path))
    .filter(m =>
      !filterMenu ||
      m.label.toLowerCase().includes(filterMenu.toLowerCase()) ||
      m.path.toLowerCase().includes(filterMenu.toLowerCase())
    );

  const renderPermissionCell = (role, menu, permission, permissionLabel, icon) => {
    const hasValue = hasPermission(role.id, menu.id, permission);

    return (
      <button
        onClick={() => handlePermissionToggle(role.id, menu.id, permission)}
        className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
          hasValue
            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
            : 'bg-muted hover:bg-muted/60'
        }`}
        title={`${permissionLabel} - ${hasValue ? 'Enabled' : 'Disabled'}`}
      >
        <Icon name={icon} size={14} />
      </button>
    );
  };

  const renderMenuRow = (menu, level = 0) => {
    const isExpanded = expandedMenus.has(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;

    return (
      <React.Fragment key={menu.id}>
        <tr className="border-b border-border hover:bg-muted/30">
          <td className="py-3 px-4 sticky left-0 bg-card z-10">
            <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleMenuExpansion(menu.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
                </button>
              )}
              <Icon name={menu.icon || 'FileText'} size={16} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">{menu.label}</div>
                <div className="text-xs text-muted-foreground font-mono">{menu.path}</div>
              </div>
            </div>
          </td>

          {filteredRoles.map(role => (
            <td key={role.id} className="py-3 px-2 text-center">
              <div className="flex items-center justify-center space-x-1">
                {renderPermissionCell(role, menu, 'can_view', 'View', 'Eye')}
                {renderPermissionCell(role, menu, 'can_create', 'Create', 'Plus')}
                {renderPermissionCell(role, menu, 'can_edit', 'Edit', 'Edit')}
                {renderPermissionCell(role, menu, 'can_delete', 'Delete', 'Trash2')}
              </div>
            </td>
          ))}
        </tr>

        {isExpanded && hasChildren && menu.children.map(child => renderMenuRow(child, level + 1))}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading permission matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Permission Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Manage all role-menu permissions in one comprehensive view
            </p>
          </div>
          <Button
            variant="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSavePermissions}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter menus..."
                value={filterMenu}
                onChange={(e) => setFilterMenu(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Icon name="Eye" size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">View</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Plus" size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Create</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Edit" size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Edit</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Trash2" size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Delete</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Click on permission icons to toggle
          </div>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0 z-20">
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-semibold text-foreground sticky left-0 bg-muted/50 z-30 min-w-[300px]">
                  Menu Items
                </th>
                {filteredRoles.map(role => (
                  <th key={role.id} className="py-4 px-2 text-center min-w-[180px]">
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 rounded-full ${getRoleColorClass(role.slug)} flex items-center justify-center`}>
                        <Icon name="Shield" size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{role.name}</div>
                        <div className="text-xs text-muted-foreground">{role.slug}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buildMenuHierarchy(filteredMenus).map(menu => renderMenuRow(menu))}
            </tbody>
          </table>
        </div>

        {filteredMenus.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Icon name="Search" size={32} className="text-muted-foreground" />
            </div>
            <h5 className="text-md font-semibold text-foreground mb-2">No menus found</h5>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search filters
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">Permission Matrix Tips</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Click any permission icon to toggle it on/off</li>
              <li>Changes are highlighted but not saved until you click "Save All Changes"</li>
              <li>Use the filters to focus on specific roles or menus</li>
              <li>Expand parent menus to see child menu permissions</li>
              <li>View permission is typically required for Create, Edit, and Delete permissions to work</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPermissionMatrix;
