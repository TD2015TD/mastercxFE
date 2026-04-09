import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user and permissions from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const userPermissions = authService.getPermissions();
        const token = localStorage.getItem('jwt_token');

        console.log('🔧 AuthContext Init:', {
          hasToken: !!token,
          currentUser: currentUser,
          userRole: currentUser?.role,
          userRoleSlug: currentUser?.role?.slug,
          permissions: userPermissions,
          permissionsCount: userPermissions?.length
        });

        if (currentUser && token) {
          setUser(currentUser);
          setPermissions(userPermissions);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setPermissions([]);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setPermissions([]);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const userPermissions = authService.getPermissions();
      
      console.log('🔧 AuthContext Login:', {
        user: response.user,
        userRole: response.user?.role,
        userRoleSlug: response.user?.role?.slug,
        permissions: userPermissions,
        permissionsCount: userPermissions?.length
      });
      
      setUser(response.user);
      setPermissions(userPermissions);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { user: freshUser } = await authService.me();
      const userPermissions = authService.getPermissions();
      
      setUser(freshUser);
      setPermissions(userPermissions);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might not be authenticated anymore
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value = {
    user,
    permissions,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
