/**
 * Utility functions for handling user roles and permissions
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * Checks if a user has admin role (case-insensitive comparison)
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  
  // Use strict equality check against lowercase role
  return user.role.toLowerCase() === 'admin';
};

/**
 * Checks if a user has specific role
 */
export const hasRole = (user: User | null, role: string): boolean => {
  if (!user) return false;
  
  // Compare roles in a case-insensitive way
  return user.role.toLowerCase() === role.toLowerCase();
};
