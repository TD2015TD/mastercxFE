import api from './api';

export interface MenuPermission {
  menu_item_id: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  menu_items?: MenuItem[];
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: number;
  label: string;
  path: string;
  icon?: string;
  description?: string;
  tooltip?: string;
  order: number;
  parent_id?: number;
  is_active: boolean;
  metadata?: any;
  parent?: MenuItem;
  children?: MenuItem[];
  pivot?: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
}

export interface RoleQueryParams {
  search?: string;
  with_users?: boolean;
  with_menu_items?: boolean;
  per_page?: number;
}

/**
 * Role Management API Service
 */
export class RoleMenuService {
  /**
   * Get all roles with optional filters
   */
  static async getRoles(params?: RoleQueryParams) {
    const response = await api.get('/roles', { params });
    return response.data;
  }

  /**
   * Get a specific role by ID
   */
  static async getRole(roleId: number, withUsers = false) {
    const response = await api.get(`/roles/${roleId}`, {
      params: { with_users: withUsers }
    });
    return response.data;
  }

  /**
   * Create a new role
   */
  static async createRole(data: {
    name: string;
    slug?: string;
    description?: string;
    menu_items?: MenuPermission[];
  }) {
    const response = await api.post('/roles', data);
    return response.data;
  }

  /**
   * Update an existing role
   */
  static async updateRole(
    roleId: number,
    data: {
      name: string;
      slug?: string;
      description?: string;
      menu_items?: MenuPermission[];
    }
  ) {
    const response = await api.put(`/roles/${roleId}`, data);
    return response.data;
  }

  /**
   * Delete a role
   */
  static async deleteRole(roleId: number) {
    const response = await api.delete(`/roles/${roleId}`);
    return response.data;
  }

  /**
   * Assign menu items to a role
   */
  static async assignMenuItems(roleId: number, menuItems: MenuPermission[]) {
    const response = await api.post(`/roles/${roleId}/menu-items`, {
      menu_items: menuItems
    });
    return response.data;
  }

  /**
   * Remove menu items from a role
   */
  static async removeMenuItems(roleId: number, menuItemIds: number[]) {
    const response = await api.delete(`/roles/${roleId}/menu-items`, {
      data: { menu_item_ids: menuItemIds }
    });
    return response.data;
  }

  /**
   * Get all available menu items for assignment
   */
  static async getAvailableMenuItems() {
    const response = await api.get('/roles/available/menu-items');
    return response.data;
  }

  /**
   * Get menu items for the authenticated user
   */
  static async getMenuItems() {
    const response = await api.get('/menus');
    return response.data;
  }

  /**
   * Get menu items by role slug
   */
  static async getMenuItemsByRole(roleSlug: string) {
    const response = await api.get(`/menus/role/${roleSlug}`);
    return response.data;
  }

  /**
   * Get all menu items (admin only)
   */
  static async getAllMenuItems() {
    const response = await api.get('/menus/all');
    return response.data;
  }

  /**
   * Clear menu cache
   */
  static async clearMenuCache() {
    const response = await api.post('/menus/clear-cache');
    return response.data;
  }

  /**
   * Build hierarchical menu structure from flat array
   */
  static buildMenuHierarchy(menus: MenuItem[]): MenuItem[] {
    const menuMap = new Map<number, MenuItem>();
    const rootMenus: MenuItem[] = [];

    // Create a map of all menus with children array
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Build the hierarchy
    menus.forEach(menu => {
      const menuWithChildren = menuMap.get(menu.id);
      if (menu.parent_id) {
        const parent = menuMap.get(menu.parent_id);
        if (parent && menuWithChildren) {
          parent.children = parent.children || [];
          parent.children.push(menuWithChildren);
        }
      } else if (menuWithChildren) {
        rootMenus.push(menuWithChildren);
      }
    });

    // Sort by order
    const sortByOrder = (items: MenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortByOrder(item.children);
        }
      });
    };

    sortByOrder(rootMenus);
    return rootMenus;
  }

  /**
   * Flatten hierarchical menu structure
   */
  static flattenMenuHierarchy(menus: MenuItem[]): MenuItem[] {
    const flattened: MenuItem[] = [];

    const flatten = (items: MenuItem[]) => {
      items.forEach(item => {
        flattened.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };

    flatten(menus);
    return flattened;
  }

  /**
   * Check if a role has a specific permission for a menu
   */
  static hasPermission(
    role: Role,
    menuId: number,
    permission: 'can_view' | 'can_create' | 'can_edit' | 'can_delete'
  ): boolean {
    const menuItem = role.menu_items?.find(m => m.id === menuId);
    return menuItem?.pivot?.[permission] || false;
  }

  /**
   * Get permission summary for a role
   */
  static getPermissionSummary(role: Role) {
    const summary = {
      totalMenus: role.menu_items?.length || 0,
      withView: 0,
      withCreate: 0,
      withEdit: 0,
      withDelete: 0,
    };

    role.menu_items?.forEach(menu => {
      if (menu.pivot?.can_view) summary.withView++;
      if (menu.pivot?.can_create) summary.withCreate++;
      if (menu.pivot?.can_edit) summary.withEdit++;
      if (menu.pivot?.can_delete) summary.withDelete++;
    });

    return summary;
  }
}

export default RoleMenuService;
