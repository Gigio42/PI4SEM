import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function BypassAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;
    
    // If we're on the login page and the user is already authenticated,
    // redirect to the home page
    if (pathname === '/login' && user) {
      console.log('Already logged in, redirecting to home');
      router.push('/home');
      return;
    }
    
    // If we're not on the login page and the user is not authenticated,
    // redirect to the login page
    if (pathname !== '/login' && !user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
  }, [user, isLoading, pathname, router]);

  return children;
}
