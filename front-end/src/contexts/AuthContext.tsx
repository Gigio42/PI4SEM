import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage or session
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Add a debugging console log when auth status changes
  useEffect(() => {
    console.log("Auth context state changed:", {
      user,
      isAuthenticated: !!user,
      isLoading
    });
  }, [user, isLoading]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a mock implementation. In a real app, you would call your API
      // Mock successful login with sample user
      const mockUser = {
        id: 1,
        email: email,
        name: 'Test User',
        role: 'user'
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // In your login or auth state detection function, ensure google auth is properly detected
  // For example, if you have a function that looks like:
  const handleAuthStateChanged = (user: any) => {
    console.log("Auth state change detected:", user);
    if (user) {
      // Ensure we properly set the user state from Google auth
      setUser({
        id: user.uid || user.id,
        email: user.email,
        name: user.displayName || user.name,
        picture: user.photoURL || user.picture
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => { 
        console.error('AuthContext not available'); 
      },
      logout: () => { 
        console.error('AuthContext not available'); 
      }
    };
  }
  return context;
}
