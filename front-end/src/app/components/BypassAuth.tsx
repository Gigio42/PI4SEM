"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * This component sets a fake authenticated user in the AuthContext
 * It's a temporary solution until proper authentication is implemented
 */
export default function BypassAuth() {
  const { setUser } = useAuth();
  
  useEffect(() => {
    // Simulate authentication with a fake user
    if (setUser) {
      console.log("🔑 Setting fake authenticated user");
      setUser({
        id: 1,
        name: "Temporary User",
        email: "user@example.com"
      });
    } else {
      console.warn("❌ AuthContext doesn't provide setUser method");
    }
  }, [setUser]);
  
  // This component doesn't render anything
  return null;
}
