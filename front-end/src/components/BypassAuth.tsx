import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContext, User } from '../../src/contexts/AuthContext';

export const BypassAuth: React.FC = () => {
  const router = useRouter();
  const { user, login, isAdmin } = useContext(AuthContext);

  // ...existing code...

  // Add a function to check admin status with proper logging
  const checkAdminStatus = (user: User | null) => {
    if (!user) return false;
    
    const isUserAdmin = user.role === 'admin';
    console.log(`Admin check: User role is "${user.role}" - isAdmin: ${isUserAdmin}`);
    return isUserAdmin;
  };

  // Use in your component as needed
  useEffect(() => {
    if (user) {
      console.log(`User role from context: "${user.role}"`);
      console.log(`Is admin: ${checkAdminStatus(user)}`);
    }
  }, [user]);

  // ...existing code...
  
  // Return JSX to fix the TypeScript error
  return <></>;  // Empty fragment as placeholder
};