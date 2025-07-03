"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import Header from '../../app/components/Header/Header';
import Sidebar from '../../app/components/Sidebar/Sidebar';
import { ComponentProvider } from '@/contexts/ComponentContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
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

  // Handle sidebar toggle
  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <ComponentProvider>
      <div className={`${styles.adminLayout} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <Header />
        <div className={styles.adminContainer}>
          <Sidebar isAdmin={true} onToggle={handleSidebarToggle} />
          <main className={styles.content}>
            {children}
          </main>
        </div>
      </div>
    </ComponentProvider>
  );
}
