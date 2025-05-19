"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function BypassAuth() {
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First check for already authenticated user in context
        if (user) {
          console.log('User already exists in context:', user);
          
          // Always verify with backend to ensure role is correct
          try {
            const response = await fetch('http://localhost:3000/auth/session-check', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              // Prevent browser from adding cache-control headers
              cache: 'no-store',
            });
            
            const data = await response.json();
            if (data.authenticated && data.user && data.user.role) {
              // Check if the backend role differs from context
              if (data.user.role !== user.role) {
                console.log(`Role mismatch! Context: "${user.role}", Backend: "${data.user.role}"`);
                // Update with correct role from backend
                const updatedUser = {
                  ...user,
                  role: data.user.role // Use exact role from backend
                };
                login(updatedUser);
                console.log('Updated user with correct role from backend:', updatedUser);
              }
            }
          } catch (error) {
            console.error('Error verifying role with backend:', error);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Then check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('Found user in localStorage:', userData);
            console.log(`User role from localStorage: "${userData.role}"`);
            
            // Always verify with backend before using localStorage data
            try {
              const response = await fetch('http://localhost:3000/auth/session-check', {
                credentials: 'include',
              });
              
              const data = await response.json();
              
              if (data.authenticated && data.user) {
                // Use backend data as source of truth, especially for role
                const backendUserData = {
                  id: data.user.id,
                  name: data.user.name || userData.name,
                  email: data.user.email,
                  role: data.user.role // Always use exact role from backend
                };
                
                console.log(`Using backend role: "${backendUserData.role}"`);
                login(backendUserData);
                console.log('Using authenticated user from backend:', backendUserData);              } else {
                // Session not valid, but still use localStorage data for limited functionality
                console.log('Backend session not valid, using localStorage with caution');
                login(userData);
                
                // If not on login page, redirect
                if (!pathname?.includes('/login') && !pathname?.includes('/signup') && 
                    !pathname?.includes('/home') && pathname !== '/') {
                  router.push('/login');
                }
              }
            } catch (error) {
              console.error('Error verifying authentication with backend:', error);
              // Use localStorage data if backend is unreachable
              login(userData);
            }
          } catch (e) {
            console.error('Failed to parse user data from localStorage:', e);            localStorage.removeItem('user');
            
            // If not on login page, redirect
            if (!pathname?.includes('/login') && !pathname?.includes('/signup') && 
                !pathname?.includes('/home') && pathname !== '/') {
              router.push('/login');
            }
          }
        } else {          console.log('No authenticated user found');
          // If not on login page, redirect
          if (!pathname?.includes('/login') && !pathname?.includes('/signup') && 
              !pathname?.includes('/home') && pathname !== '/') {
            router.push('/login');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [login, pathname, router, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return null;
}
