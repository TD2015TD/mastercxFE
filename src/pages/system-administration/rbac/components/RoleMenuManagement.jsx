import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import api from '../../../../services/api';
import { menuService } from '../../../../services/menuService';

const RoleMenuManagement = () => {
  const [roles, setRoles] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleMenuItems, setRoleMenuItems] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
    loadAvailableMenuItems();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRoleMenuItems(selectedRole.id);
    }
  }, [selectedRole]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles', {
        params: {
          with_menu_items: true,
          per_page: 100
        }
      });

      // Handle both paginated and non-paginated responses
      let rolesData = [];
      if (response.data.data) {
        // Check if it's paginated (has data array with pagination info) or direct array
        if (Array.isArray(response.data.data)) {
          rolesData = response.data.data;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          // Paginated response
          rolesData = response.data.data.data;
        }
      }

      setRoles(rolesData);
    } catch (error) {
      toast.error('Failed to load roles');
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMenuItems = async () => {
    try {
      const response = await api.get('/roles/available/menu-items');
      setMenuItems(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load menu items');
      console.error('Error loading menu items:', error);
    }
  };

  const loadRoleMenuItems = async (roleId) => {
    try {
      setLoading(true);
      const response = await api.get(`/roles/${roleId}`);
      const role = response.data.data;
      setRoleMenuItems(role.menu_items || []);

      // Initialize selectedMenus map with existing permissions
      const menusMap = new Map();
      (role.menu_items || []).forEach(menu => {
        menusMap.set(menu.id, {
          menu_item_id: menu.id,
          can_view: menu.pivot?.can_view || false,
          can_create: menu.pivot?.can_create || false,
          can_edit: menu.pivot?.can_edit || false,
          can_delete: menu.pivot?.can_delete || false,
        });
      });
      setSelectedMenus(menusMap);
    } catch (error) {
      toast.error('Failed to load role menu items');
      console.error('Error loading role menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleOpenAssignMenu = () => {
    setIsModalOpen(true);
  };

  const handleToggleMenu = (menuId) => {
    const newMap = new Map(selectedMenus);
    if (newMap.has(menuId)) {
      newMap.delete(menuId);
    } else {
      newMap.set(menuId, {
        menu_item_id: menuId,
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
      });
    }
    setSelectedMenus(newMap);
  };

  const handlePermissionChange = (menuId, permission, value) => {
    const newMap = new Map(selectedMenus);
    if (newMap.has(menuId)) {
      const menuPermissions = { ...newMap.get(menuId) };
      menuPermissions[permission] = value;
      newMap.set(menuId, menuPermissions);
      setSelectedMenus(newMap);
    }
  };

  const handleSaveMenuAssignments = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      const menuItemsArray = Array.from(selectedMenus.values());

      await api.put(`/roles/${selectedRole.id}`, {
        name: selectedRole.name,
        slug: selectedRole.slug,
        description: selectedRole.description,
        menu_items: menuItemsArray
      });

      toast.success('Menu assignments saved successfully');
      setIsModalOpen(false);
      loadRoleMenuItems(selectedRole.id);
      loadRoles();
      // Clear caches so all users with this role see updated menus immediately
      await menuService.clearCache();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save menu assignments');
      console.error('Error saving menu assignments:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMenu = async (menuItemId) => {
    if (!selectedRole) return;

    if (!window.confirm('Are you sure you want to remove this menu from the role?')) return;

    try {
      await api.delete(`/roles/${selectedRole.id}/menu-items`, {
        data: { menu_item_ids: [menuItemId] }
      });

      toast.success('Menu removed successfully');
      loadRoleMenuItems(selectedRole.id);
      loadRoles();
      await menuService.clearCache();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove menu');
      console.error('Error removing menu:', error);
    }
  };

  const getRoleColorClass = (slug) => {
    const colorMap = {
      'super_admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'supervisor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'agent': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'customer': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colorMap[slug] || 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
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

  const renderMenuTree = (menus, level = 0) => {
    return menus.map(menu => {
      const isSelected = selectedMenus.has(menu.id);
      const permissions = selectedMenus.get(menu.id) || {};

      return (
        <div key={menu.id} className={`${level > 0 ? 'ml-6' : ''}`}>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg mb-2 hover:bg-muted/30">
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleMenu(menu.id)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <Icon name={menu.icon || 'FileText'} size={18} className="text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{menu.label}</div>
                <div className="text-xs text-muted-foreground font-mono">{menu.path}</div>
              </div>
            </div>

            {isSelected && (
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={permissions.can_view || false}
                    onChange={(e) => handlePermissionChange(menu.id, 'can_view', e.target.checked)}
                    className="w-3 h-3 text-primary bg-background border-border rounded"
                  />
                  <span className="text-xs text-muted-foreground">View</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={permissions.can_create || false}
                    onChange={(e) => handlePermissionChange(menu.id, 'can_create', e.target.checked)}
                    className="w-3 h-3 text-primary bg-background border-border rounded"
                  />
                  <span className="text-xs text-muted-foreground">Create</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={permissions.can_edit || false}
                    onChange={(e) => handlePermissionChange(menu.id, 'can_edit', e.target.checked)}
                    className="w-3 h-3 text-primary bg-background border-border rounded"
                  />
                  <span className="text-xs text-muted-foreground">Edit</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={permissions.can_delete || false}
                    onChange={(e) => handlePermissionChange(menu.id, 'can_delete', e.target.checked)}
                    className="w-3 h-3 text-primary bg-background border-border rounded"
                  />
                  <span className="text-xs text-muted-foreground">Delete</span>
                </label>
              </div>
            )}
          </div>
          {menu.children && menu.children.length > 0 && (
            <div className="ml-4">
              {renderMenuTree(menu.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Role & Menu Management</h3>
            <p className="text-sm text-muted-foreground">Assign menu items and permissions to roles</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="text-md font-semibold text-foreground mb-4">Roles</h4>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading roles...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedRole?.id === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon name="Shield" size={18} className="text-primary" />
                      <span className="font-medium text-foreground">{role.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleColorClass(role.slug)}`}>
                      {role.slug}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{role.menu_items?.length || 0} menus assigned</span>
                    {role.description && (
                      <Icon name="Info" size={14} className="text-muted-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Menus */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-md font-semibold text-foreground">
                    Menus assigned to {selectedRole.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {roleMenuItems.length} menu items assigned
                  </p>
                </div>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={handleOpenAssignMenu}
                >
                  Assign Menus
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading menu items...</p>
                </div>
              ) : roleMenuItems.length > 0 ? (
                <div className="space-y-3">
                  {roleMenuItems.map((menu) => (
                    <div
                      key={menu.id}
                      className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name={menu.icon || 'FileText'} size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-sm font-semibold text-foreground">{menu.label}</h5>
                              {menu.parent && (
                                <span className="text-xs text-muted-foreground">
                                  (under {menu.parent.label})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mb-2">{menu.path}</p>

                            {/* Permissions */}
                            <div className="flex items-center space-x-2">
                              {menu.pivot?.can_view && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  <Icon name="Eye" size={12} className="mr-1" />
                                  View
                                </span>
                              )}
                              {menu.pivot?.can_create && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  <Icon name="Plus" size={12} className="mr-1" />
                                  Create
                                </span>
                              )}
                              {menu.pivot?.can_edit && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                  <Icon name="Edit" size={12} className="mr-1" />
                                  Edit
                                </span>
                              )}
                              {menu.pivot?.can_delete && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  <Icon name="Trash2" size={12} className="mr-1" />
                                  Delete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="X"
                          onClick={() => handleRemoveMenu(menu.id)}
                          className="text-error hover:text-error"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <Icon name="Menu" size={32} className="text-muted-foreground" />
                  </div>
                  <h5 className="text-md font-semibold text-foreground mb-2">No menus assigned</h5>
                  <p className="text-sm text-muted-foreground mb-4">
                    This role doesn't have any menu items assigned yet
                  </p>
                  <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={handleOpenAssignMenu}
                  >
                    Assign Menus
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={32} className="text-muted-foreground" />
              </div>
              <h5 className="text-md font-semibold text-foreground mb-2">Select a role</h5>
              <p className="text-sm text-muted-foreground">
                Choose a role from the list to view and manage its menu assignments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Menu Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Assign Menus to ${selectedRole?.name || 'Role'}`}
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Menu Assignment Instructions</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check the menu items you want to assign to this role</li>
                  <li>For each selected menu, set the appropriate permissions (View, Create, Edit, Delete)</li>
                  <li>Parent menus will automatically include child menus in the hierarchy</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {renderMenuTree(buildMenuHierarchy(menuItems))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {selectedMenus.size} menu item{selectedMenus.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveMenuAssignments}
                disabled={saving || selectedMenus.size === 0}
              >
                {saving ? 'Saving...' : 'Save Assignments'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleMenuManagement;
