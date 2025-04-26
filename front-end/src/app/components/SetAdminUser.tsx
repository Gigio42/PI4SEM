"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function SetAdminUser() {
  const { user, login } = useAuth();
  const [isSet, setIsSet] = useState(false);
  const [hasCheckedBackend, setHasCheckedBackend] = useState(false);

  useEffect(() => {
    // First, always check the actual role from the backend
    const verifyUserRole = async () => {
      if (user && user.id) {
        try {
          // Verify with backend to get the actual role
          const response = await fetch('http://localhost:3000/auth/session-check', {
            credentials: 'include',
          });
          
          const data = await response.json();
          if (data.authenticated && data.user) {
            console.log(`Backend reports user role as: "${data.user.role}"`);
            
            // If there's a mismatch between local and backend role
            if (data.user.role !== user.role) {
              console.log(`Role mismatch detected! Local: "${user.role}", Backend: "${data.user.role}"`);
              
              // Update local user with the correct role from backend
              const correctedUser = {
                ...user,
                role: data.user.role // Use the exact role from backend
              };
              
              login(correctedUser);
              console.log('User role corrected from backend:', correctedUser);
            }
          }
          
          // Mark that we've checked with the backend
          setHasCheckedBackend(true);
        } catch (e) {
          console.error('Failed to verify user role with backend:', e);
          // Still mark as checked even if there was an error
          setHasCheckedBackend(true);
        }
      } else {
        setHasCheckedBackend(true);
      }
    };
    
    verifyUserRole();
  }, [user, login]);
  
  // This component is no longer automatically setting admin role
  // Only enable manual activation in development mode if needed
  const devModeForceAdmin = false; // Set to true only for development testing
  
  useEffect(() => {
    // Only run this effect if we've verified the backend role first
    if (hasCheckedBackend && user && user.id && devModeForceAdmin) {
      try {
        console.log(`Current user role before update: "${user.role}"`);
        
        // Only update in development mode and if explicitly enabled
        if (process.env.NODE_ENV === 'development' && devModeForceAdmin) {
          // Only change the role if it's not already admin
          if (user.role !== 'admin') {
            console.log('Development mode: Setting user to admin role (DEVELOPMENT ONLY)');
            const updatedUser = {
              ...user,
              role: 'admin'
            };
            
            login(updatedUser);
            setIsSet(true);
            console.log('DEV MODE ONLY: Updated user to admin role:', updatedUser);
          } else {
            console.log('User already has admin role:', user.role);
          }
        } else {
          console.log('Normal mode: Respecting user role from backend');
        }
      } catch (e) {
        console.error('Failed to update user role:', e);
      }
    }
  }, [user, login, hasCheckedBackend, devModeForceAdmin]);

  // This component doesn't render anything visually
  return null;
}
