import { ReactNode } from 'react';

export interface CanProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export interface UsePermissionReturn {
  can: (permission: string) => boolean;
  canAny: (permissionArray: string[]) => boolean;
  canAll: (permissionArray: string[]) => boolean;
  isSuperAdmin: () => boolean;
  permissions: string[];
}

declare const Can: React.FC<CanProps>;
export const usePermission: () => UsePermissionReturn;

export default Can;
