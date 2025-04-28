"use client";

import { useEffect, useState } from 'react';
import styles from '../page.module.css';
import { ComponentsService } from '@/services/ComponentsService';
import { Component } from '@/types/component';
import Link from 'next/link';

export default function FeaturedComponents() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComponents() {
      try {
        setLoading(true);
        const componentsData = await ComponentsService.getAllComponents();
        setComponents(componentsData);
      } catch (err) {
        console.error('Error fetching components:', err);
        setError('Failed to load components. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchComponents();
  }, []);

  if (loading) {
    return <div className={styles.loadingSection}>Loading components...</div>;
  }

  if (error) {
    return <div className={styles.errorSection}>{error}</div>;
  }

  // Show only first 3 components
  const featuredComponents = components.slice(0, 3);

  return (
    <section className={styles.featuredSection}>
      <h2 className={styles.sectionTitle}>Featured Components</h2>
      
      {featuredComponents.length === 0 ? (
        <p>No components available at the moment.</p>
      ) : (
        <div className={styles.componentsGrid}>
          {featuredComponents.map((component) => (
            <div key={component.id} className={styles.componentCard} style={{ borderColor: component.color || '#6366F1' }}>
              <h3>{component.name}</h3>
              <p className={styles.componentCategory}>{component.category || 'UI Component'}</p>
              <Link href={`/components/${component.id}`} className={styles.viewButton}>
                View Component
              </Link>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.viewAllContainer}>
        <Link href="/components" className={styles.viewAllButton}>
          View All Components
        </Link>
      </div>
    </section>
  );
}
