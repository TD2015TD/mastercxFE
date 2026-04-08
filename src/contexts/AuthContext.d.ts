import { ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
  agent?: {
    id: number;
    employee_id: string;
  };
  [key: string]: any;
}

export interface AuthContextValue {
  user: User | null;
  permissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider(props: AuthProviderProps): JSX.Element;
export function useAuth(): AuthContextValue;

declare const AuthContext: React.Context<AuthContextValue | null>;
export default AuthContext;
