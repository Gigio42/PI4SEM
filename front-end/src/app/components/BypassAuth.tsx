"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function BypassAuth() {
  const { setUser, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First check for already authenticated user in context
        if (user) {
          console.log('User already exists in context:', user);
          setIsLoading(false);
          return;
        }
        
        // Then check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('Found user in localStorage:', userData);
            setUser(userData);
            
            // Verify this user with the backend
            try {
              const response = await fetch('http://localhost:3000/auth/session-check', {
                credentials: 'include',
              });
              
              const data = await response.json();
              
              // If backend session doesn't match localStorage, clear it
              if (!data.authenticated) {
                console.log('Backend session expired. Clearing local user data.');
                localStorage.removeItem('user');
                setUser(null);
                
                // Redirect to login if not on login page
                if (!pathname?.includes('/login') && !pathname?.includes('/signup')) {
                  router.push('/login');
                }
              }
            } catch (backendError) {
              console.error('Error verifying session with backend:', backendError);
              // We keep the localStorage user since backend might be down
            }
            
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse user data from localStorage:', e);
            localStorage.removeItem('user');
          }
        }

        // No user found, check with backend for active session
        try {
          const response = await fetch('http://localhost:3000/auth/session-check', {
            credentials: 'include',
          });
          
          const data = await response.json();
          
          if (data.authenticated && data.user) {
            console.log('User authenticated from backend session:', data.user);
            const userData = {
              id: data.user.id,
              name: data.user.name || 'User',
              email: data.user.email,
              role: data.user.role || 'user'
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.log('No authenticated user found in backend');
            // If not on login page, redirect
            if (!pathname?.includes('/login') && !pathname?.includes('/signup')) {
              router.push('/login');
            }
          }
        } catch (error) {
          console.error('Error checking authentication with backend:', error);
          // If backend is down and we're not on login page, redirect
          if (!pathname?.includes('/login') && !pathname?.includes('/signup')) {
            router.push('/login');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [setUser, user, pathname, router]);

  // This component doesn't render anything visually
  return null;
}
