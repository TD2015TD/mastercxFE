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

  console.log('🔐 Can Component:', {
    permission,
    anyOf,
    allOf,
    userRole: user?.role,
    userRoleSlug: user?.role?.slug,
    isSuperAdmin: user?.role?.slug === 'super_admin',
    permissions: permissions,
    hasPermissions: permissions?.length > 0
  });

  // Super admin bypass
  if (user?.role?.slug === 'super_admin') {
    console.log('✅ Super admin bypass - granting access');
    return <>{children}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permissions, permission);
    console.log(`🔍 Permission check for "${permission}":`, hasAccess);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(permissions, anyOf);
    console.log('🔍 AnyOf permission check:', hasAccess);
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(permissions, allOf);
    console.log('🔍 AllOf permission check:', hasAccess);
  }

  if (!hasAccess) {
    console.log('❌ Access denied, showing fallback');
  }

  return hasAccess ? <>{children}</> : fallback;
};

/**
 * Hook to check permissions in functional components
 */
export const usePermission = () => {
  const { user, permissions } = useAuth();

  return {
    can: (permission) => {
      const result = canPerform(user, permissions, permission);
      console.log('🔐 Permission Check:', {
        permission,
        result,
        userRole: user?.role,
        userRoleSlug: user?.role?.slug,
        hasPermissions: permissions?.length > 0,
        permissions: permissions,
        isSuperAdmin: user?.role?.slug === 'super_admin'
      });
      return result;
    },
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
