import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'operator';
  isActive: boolean;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Only verify token if we're in admin area
          if (window.location.pathname.startsWith('/admin')) {
            const response = await authAPI.getProfile();
            setUser(response.data);
          }
        } catch (error) {
          // Token is invalid, clear auth state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call logout endpoint to invalidate token on server
    authAPI.logout().catch(() => {
      // Ignore errors on logout
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: 'admin' | 'operator'
) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        // Only redirect to admin login if we're not already there
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
      return null;
    }

    if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              غير مصرح لك بالوصول
            </h1>
            <p className="text-gray-600">
              ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (requiredRole: 'admin' | 'operator') => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === requiredRole;
  };

  const isAdmin = () => user?.role === 'admin';
  const isOperator = () => user?.role === 'operator';

  return {
    hasPermission,
    isAdmin,
    isOperator,
  };
};
