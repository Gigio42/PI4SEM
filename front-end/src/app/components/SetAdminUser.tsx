"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function SetAdminUser() {
  const { user, setUser } = useAuth();
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    // Only process if there's a real user (don't create fake users)
    if (user && user.id) {
      try {
        // Update the real user to have admin role
        if (user.role !== 'admin') {
          const updatedUser = {
            ...user,
            role: 'admin'
          };
          
          // Update both context and localStorage
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setIsSet(true);
          console.log('Updated real user to admin role:', updatedUser);
        }
      } catch (e) {
        console.error('Failed to update user role:', e);
      }
    }
  }, [user, setUser]);

  // This component doesn't render anything visually
  return null;
}
