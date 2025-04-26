"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check for user data in localStorage on initial load
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log(`Loading stored user with role: "${userData.role}"`);
          return userData;
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
          return null;
        }
      }
    }
    return null;
  });

  // Calculate isAdmin based on exact role value - use strict comparison
  const isAdmin = user?.role === 'admin';
  
  const login = (userData: User) => {
    // Ensure role is preserved exactly as provided
    console.log(`Setting user with role: "${userData.role}"`);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  console.log('Auth Provider: Initializing with stored user', { user, isAdmin });
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
