import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/lib/api';

// Mapping des rôles backend vers frontend
const roleMapping: Record<string, UserRole> = {
  superadmin: 'admin',
  admin: 'admin', 
  secretary: 'secretary',
  accountant: 'accountant',
  comptable: 'accountant',  // Ajout pour le rôle en français
  secretaire: 'secretary', // Support français
  administrateur: 'admin', // Support français
};

export type UserRole = 'admin' | 'secretary' | 'accountant';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const permissions: Record<UserRole, string[]> = {
  admin: ['view_dashboard', 'view_revenue', 'view_users', 'manage_users', 'view_cvs', 'view_partners', 'manage_partners', 'view_commercials', 'manage_commercials', 'view_invoices', 'manage_invoices', 'view_accounting', 'manage_accounting', 'view_logs', 'view_settings', 'manage_settings'],
  secretary: ['view_dashboard', 'view_users', 'manage_users', 'view_cvs', 'view_partners', 'manage_partners', 'view_invoices', 'view_settings'],
  accountant: ['view_dashboard', 'view_revenue', 'view_invoices', 'manage_invoices', 'view_accounting', 'manage_accounting', 'view_logs', 'view_settings'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (userId: string) => {
    try {
      const { data } = await authService.getProfile(userId);
      // Adapter selon le format de réponse de l'API admin
      const userData = data.admin || data.data?.admin || data;
      
      // Debug logs pour vérifier le rôle
      console.log('🔐 Fetch User Debug - Backend Role:', userData.role);
      console.log('🔐 Fetch User Debug - Backend Role Type:', typeof userData.role);
      console.log('🔐 Fetch User Debug - User Data:', userData);
      console.log('🔐 Fetch User Debug - Available Role Mappings:', Object.keys(roleMapping));
      
      // Mapping du rôle avec validation stricte
      let userRole: UserRole;
      
      if (roleMapping[userData.role]) {
        userRole = roleMapping[userData.role];
        console.log('🔐 Fetch User Debug - Role mapped successfully:', userRole);
      } else {
        console.warn('🔐 Fetch User Debug - Unknown backend role:', userData.role);
        console.warn('🔐 Fetch User Debug - Available mappings:', Object.keys(roleMapping));
        
        // Mapping spécial pour les rôles non reconnus
        if (userData.role === 'comptable') {
          userRole = 'accountant';
          console.log('🔐 Fetch User Debug - Special mapping for comptable -> accountant');
        } else {
          console.warn('🔐 Fetch User Debug - Defaulting to secretary for safety');
          userRole = 'secretary';  // Fallback sécurisé
        }
      }
      
      console.log('🔐 Fetch User Debug - Final Mapped Role:', userRole);
      
      setUser({
        id: userData.id,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userRole,
      });
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
            if (token) {
        try {
          const decoded: { sub: string, exp: number } = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            await fetchUser(decoded.sub);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Invalid token", error);
          logout();
        }
      } else {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authService.login({ email, password });
      
      // Vérifier le format de réponse du nouveau backend
      if (data.success && data.data?.accessToken) {
        localStorage.setItem('token', data.data.accessToken);
        
        // Utiliser les données de l'admin directement depuis la réponse login
        const adminData = data.data.admin;
        
        // Debug logs pour vérifier le rôle
        console.log('🔐 Login Debug - Backend Role:', adminData.role);
        console.log('🔐 Login Debug - Backend Role Type:', typeof adminData.role);
        console.log('🔐 Login Debug - Admin Data:', adminData);
        console.log('🔐 Login Debug - Available Role Mappings:', Object.keys(roleMapping));
        
        // Mapping du rôle avec validation stricte
        let userRole: UserRole;
        
        if (roleMapping[adminData.role]) {
          userRole = roleMapping[adminData.role];
          console.log('🔐 Login Debug - Role mapped successfully:', userRole);
        } else {
          console.warn('🔐 Login Debug - Unknown backend role:', adminData.role);
          console.warn('🔐 Login Debug - Available mappings:', Object.keys(roleMapping));
          
          // Mapping spécial pour les rôles non reconnus
          if (adminData.role === 'comptable') {
            userRole = 'accountant';
            console.log('🔐 Login Debug - Special mapping for comptable -> accountant');
          } else {
            console.warn('🔐 Login Debug - Defaulting to secretary for safety');
            userRole = 'secretary';  // Fallback sécurisé
          }
        }
        
        console.log('🔐 Login Debug - Final Mapped Role:', userRole);
        
        setUser({
          id: adminData.id,
          name: `${adminData.firstName} ${adminData.lastName}`,
          email: adminData.email,
          role: userRole,
        });
        
        setIsLoading(false);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log('🔐 Permission Debug - No user found');
      return false;
    }
    
    const userPermissions = permissions[user.role] || [];
    const hasPermission = userPermissions.includes(permission);
    
    console.log('🔐 Permission Debug - User Role:', user.role);
    console.log('🔐 Permission Debug - Required Permission:', permission);
    console.log('🔐 Permission Debug - User Permissions:', userPermissions);
    console.log('🔐 Permission Debug - Has Permission:', hasPermission);
    
    return hasPermission;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
