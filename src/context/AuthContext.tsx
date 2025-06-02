import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

// Define user roles
export enum UserRole {
  ADMIN = 'admin',
  DATA_STEWARD = 'data_steward',
  DYNPRO_TEAM_MEMBER = 'dynpro_team_member',
  VIEWER = 'viewer',
}

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
}

// Create AuthContext
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  hasPermission: () => false,
});

// Create hook for using auth context
export const useAuth = () => useContext(AuthContext);

// Define provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Effect to check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // In a real app, this would call an API to validate the token
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Authentication error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call an API
      // Mocking login for demo purposes
      if (email === 'admin@example.com' && password === 'password') {
        const user: User = {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          avatar: 'https://i.pravatar.cc/150?u=admin',
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else if (email === 'steward@example.com' && password === 'password') {
        const user: User = {
          id: '2',
          name: 'Data Steward',
          email: 'steward@example.com',
          role: UserRole.DATA_STEWARD,
          avatar: 'https://i.pravatar.cc/150?u=steward',
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else if (email === 'dynpro@example.com' && password === 'password') {
        const user: User = {
          id: '3',
          name: 'Dynpro Team Member',
          email: 'dynpro@example.com',
          role: UserRole.DYNPRO_TEAM_MEMBER,
          avatar: 'https://i.pravatar.cc/150?u=dynpro',
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else if (email === 'viewer@example.com' && password === 'password') {
        const user: User = {
          id: '4',
          name: 'Viewer User',
          email: 'viewer@example.com',
          role: UserRole.VIEWER,
          avatar: 'https://i.pravatar.cc/150?u=viewer',
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/auth/login');
  };
  
  // Check if user has required permission
  const hasPermission = (requiredRole: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    if (user.role === UserRole.ADMIN) return true;
    
    return user.role === requiredRole;
  };
  
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
