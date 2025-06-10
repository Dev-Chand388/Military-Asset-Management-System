import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roleName: string) => boolean;
  hasBaseAccess: (baseId: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    const foundUser = mockUsers.find(u => u.username === username);
    if (foundUser && password === 'password') { // Mock password check
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasRole = (roleName: string): boolean => {
    return user?.roles.some(role => role.role_name === roleName) || false;
  };

  const hasBaseAccess = (baseId: string): boolean => {
    if (hasRole('Admin')) return true;
    return user?.bases.some(base => base.base_id === baseId) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      hasRole,
      hasBaseAccess,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};