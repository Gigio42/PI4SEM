import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { isAdmin } from '@/utils/roleUtils';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Check if user is not admin using the utility function
    if (!user || !isAdmin(user)) {
      console.log(`Access denied - User: ${user?.email}, Role: ${user?.role}`);
      router.push('/dashboard');
    } else {
      console.log(`Admin access granted - User: ${user.email}, Role: ${user.role}`);
    }
  }, [user, router]);

  // If no user or not admin, render nothing while redirecting
  if (!user || !isAdmin(user)) {
    return null;
  }

  // Render children if user is admin
  return <>{children}</>;
};

export default AdminRoute;
