"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '../services/config';

// Define the User type and export it
export type User = {
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
const AuthContext = createContext<AuthContextType>( {
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
    // Utility function for safer fetch with timeout and retry
  const safeFetch = async (url: string, options: RequestInit = {}, retries = 2) => {
    // Set default timeout if not provided
    if (!options.signal) {
      options.signal = AbortSignal.timeout(5000);
    }
    
    // Ensure credentials are included for cookie-based auth
    if (!options.credentials) {
      options.credentials = 'include';
    }
    
    // Remove problematic headers
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      if (headers['Cache-Control']) {
        delete headers['Cache-Control'];
      }
    }
    
    try {
      return await fetch(url, options);
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying fetch to ${url}, ${retries} attempts left`);
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
        return safeFetch(url, options, retries - 1);
      }
      throw error;
    }
  };
  
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
            // Use try-catch with safeFetch for backend validation
          try {
            const response = await safeFetch(`${apiBaseUrl}/auth/session-check`, {
              credentials: 'include'
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
            console.warn('Backend unavailable during validation, using localStorage data as fallback', error);
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
        console.log('Attempting session check with backend at:', `${apiBaseUrl}/auth/session-check`);
        
        // Use safeFetch for more reliable network requests
        const response = await safeFetch(`${apiBaseUrl}/auth/session-check`, {
          credentials: 'include'
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
        
        // Enhanced error handling for network failures
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('Network error when contacting backend. Backend may be down or unreachable.');
          
          // Fallback to localStorage if available
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              console.log('Using cached user data due to backend unavailability');
              setUser(userData);
              return true;
            } catch (e) {
              console.error('Failed to parse cached user data', e);
            }
          }
        }
      }
      
      console.log('User is not authenticated');
      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      
      // Enhanced error handling
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Network error detected in authentication check. Falling back to local data if available.');
      }
      
      // Fallback to localStorage if there was an error in the main authentication flow
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          return true;
        } catch (e) {
          console.error('Failed to parse user data', e);
        }
      }
      
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
  };  // Enhanced logout function
  const logout = async () => {
    try {
      console.log('Logging out...');
      
      // Call the backend to clear the cookie, but handle network failures gracefully
      try {
        await safeFetch(`${apiBaseUrl}/users/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        console.log('Backend logout successful');
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('Backend appears to be down or unreachable during logout');
        } else {
          console.warn('Failed to contact backend for logout:', error);
        }
        console.log('Continuing with client-side logout');
      }
      
      // Always clear local state regardless of backend response
      setUser(null);
      localStorage.removeItem('user');
      
      // Also clear cookies on the client side for redundancy
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      console.log('Client-side logout successful');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if there's an error, ensure local state is cleared
      setUser(null);
      localStorage.removeItem('user');
      
      // Also clear cookies on the client side
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      router.push('/login');
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
