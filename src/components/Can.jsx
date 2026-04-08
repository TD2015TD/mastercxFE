import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, canPerform } from '../utils/permissions';

/**
 * Component to conditionally render content based on permissions
 * 
 * @param {Object} props
 * @param {string} props.permission - Single permission required
 * @param {Array} props.anyOf - Array of permissions (user needs at least one)
 * @param {Array} props.allOf - Array of permissions (user needs all)
 * @param {ReactNode} props.children - Content to render if user has permission
 * @param {ReactNode} props.fallback - Content to render if user doesn't have permission
 */
const Can = ({ permission, anyOf, allOf, children, fallback = null }) => {
  const { user, permissions } = useAuth();

  // Super admin bypass
  if (user?.role?.slug === 'super_admin') {
    return <>{children}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permissions, permission);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(permissions, anyOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(permissions, allOf);
  }

  return hasAccess ? <>{children}</> : fallback;
};

/**
 * Hook to check permissions in functional components
 */
export const usePermission = () => {
  const { user, permissions } = useAuth();

  return {
    can: (permission) => canPerform(user, permissions, permission),
    canAny: (permissionArray) => {
      if (user?.role?.slug === 'super_admin') return true;
      return hasAnyPermission(permissions, permissionArray);
    },
    canAll: (permissionArray) => {
      if (user?.role?.slug === 'super_admin') return true;
      return hasAllPermissions(permissions, permissionArray);
    },
    isSuperAdmin: () => user?.role?.slug === 'super_admin',
    permissions,
  };
};

export default Can;
