"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Define the User type
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  picture?: string;
};

// Define the context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuthentication: () => Promise<boolean>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  checkAuthentication: async () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // Fix the checkAuthentication function definition
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      // Check for a Google auth redirect by looking at the URL params
      const searchParams = new URLSearchParams(window.location.search);
      const authSource = searchParams.get('auth');
      const timestamp = searchParams.get('t');
      
      // If this is a fresh redirect from Google OAuth, check for the user_info cookie first
      if (authSource === 'google' && timestamp) {
        const userInfoCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user_info='));
          
        if (userInfoCookie) {
          try {
            // Parse and use the user info from the cookie
            const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
            console.log("Found user_info cookie from Google redirect:", userInfo);
            
            // Update user state
            setUser(userInfo);
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            // Clean up URL by removing auth params
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Clear the cookie
            document.cookie = "user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            return true;
          } catch (e) {
            console.error("Error parsing user_info cookie:", e);
          }
        }
      }
      
      console.log('Checking authentication with backend...');
      
      // First try to directly check for the user_info cookie
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_info='));
        
      if (userInfoCookie) {
        try {
          // Parse user info from cookie
          const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
          console.log("Found user_info cookie on direct check:", userInfo);
          
          // Update user state
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
          
          // Clear the cookie as we've processed it
          document.cookie = "user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          return true;
        } catch (e) {
          console.error("Error parsing user_info cookie:", e);
        }
      }
      
      // Check for user in localStorage as fallback if backend is unavailable
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('Found user in localStorage, attempting to validate with backend...');
          
          // Try to validate with backend, but don't fail hard if backend is down
          try {
            const response = await fetch('http://localhost:3000/auth/session-check', {
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache',
              },
              // Set a reasonable timeout to avoid hanging
              signal: AbortSignal.timeout(5000),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.authenticated && data.user) {
                // Backend confirmed authentication, update with latest data
                const userData = {
                  id: data.user.id,
                  name: data.user.name || data.user.email.split('@')[0],
                  email: data.user.email,
                  role: data.user.role || 'user',
                  picture: data.user.picture,
                };
                
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return true;
              }
              
              // Backend says not authenticated, clear local storage
              console.log('Backend says user is not authenticated, clearing local storage');
              localStorage.removeItem('user');
              return false;
            } else {
              // Backend error, but we already have user data from localStorage
              console.warn('Backend validation failed, using localStorage data temporarily');
              setUser(userData);
              return true;
            }
          } catch (error) {
            // Network error or timeout - use localStorage data as fallback
            console.warn('Backend unavailable, using localStorage data as fallback', error);
            setUser(userData);
            return true;
          }
        } catch (e) {
          console.error('Failed to parse user data from localStorage', e);
          localStorage.removeItem('user');
        }
      }
      
      // Last resort: try backend session check
      try {
        // If no user_info cookie, try the standard session check
        const response = await fetch('http://localhost:3000/auth/session-check', {
          credentials: 'include', // Important for cookies
          headers: {
            'Cache-Control': 'no-cache',
          },
          // Set a reasonable timeout
          signal: AbortSignal.timeout(5000),
        });
        
        if (!response.ok) {
          console.error(`Session check failed with status: ${response.status}`);
          return false;
        }
        
        const data = await response.json();
        console.log('Session check response:', data);
        
        if (data.authenticated && data.user) {
          console.log('User is authenticated:', data.user);
          
          // Update user state with backend data
          const userData = {
            id: data.user.id,
            name: data.user.name || data.user.email.split('@')[0],
            email: data.user.email,
            role: data.user.role || 'user',
            picture: data.user.picture,
          };
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        }
      } catch (error) {
        console.error('Error during backend session check:', error);
        // Continue to return false
      }
      
      console.log('User is not authenticated');
      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuthentication();
    
    // Listen for auth state changes in other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        if (event.newValue) {
          try {
            setUser(JSON.parse(event.newValue));
          } catch (e) {
            console.error('Failed to parse user data from storage event', e);
          }
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthentication]);

  // Login function
  const login = (userData: User) => {
    console.log('Setting user in context:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out...');
      // Call the backend to clear the cookie
      await fetch('http://localhost:3000/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear local state
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      console.log('Logout successful');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuthentication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
