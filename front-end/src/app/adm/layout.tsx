"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real application, you would check if the user is an admin here
    // For now, we'll just simulate a successful authorization
    const checkAuth = async () => {
      try {
        // Replace this with actual authentication code in production
        const userIsAdmin = true; // This would come from your auth system
        
        if (!userIsAdmin) {
          router.push('/login?callbackUrl=/adm');
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push('/login?callbackUrl=/adm');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  if (loading) {
    return <div className={styles.loadingContainer}>Carregando...</div>;
  }
  
  if (!isAuthorized) {
    return null; // Router will redirect, no need to render anything
  }

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <ul>
            <li>
              <Link href="/adm" className={styles.navLink}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/adm/subscriptions" className={styles.navLink}>
                Assinaturas
              </Link>
            </li>
            <li>
              <Link href="/adm/users" className={styles.navLink}>
                Usuários
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
