/**
 * Permission utility functions for the frontend
 */

/**
 * Check if user has a specific permission
 * @param {Array} userPermissions - Array of permission slugs the user has
 * @param {string} requiredPermission - The permission slug to check
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the specified permissions
 * @param {Array} userPermissions - Array of permission slugs the user has
 * @param {Array} requiredPermissions - Array of permission slugs to check
 * @returns {boolean}
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  if (!requiredPermissions || !Array.isArray(requiredPermissions)) {
    return false;
  }
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {Array} userPermissions - Array of permission slugs the user has
 * @param {Array} requiredPermissions - Array of permission slugs to check
 * @returns {boolean}
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  if (!requiredPermissions || !Array.isArray(requiredPermissions)) {
    return false;
  }
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

/**
 * Check if user is super admin (bypass all permission checks)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
  return user?.role?.slug === 'super_admin';
};

/**
 * Check if user can perform action (includes super admin bypass)
 * @param {Object} user - User object
 * @param {Array} userPermissions - Array of permission slugs
 * @param {string} requiredPermission - Permission slug to check
 * @returns {boolean}
 */
export const canPerform = (user, userPermissions, requiredPermission) => {
  // Super admin can do everything
  if (isSuperAdmin(user)) {
    return true;
  }
  return hasPermission(userPermissions, requiredPermission);
};
