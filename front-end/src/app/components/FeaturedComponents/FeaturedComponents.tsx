/* filepath: e:\4sem\UXperiment-Labs\front-end\src\app\components\FeaturedComponents\FeaturedComponents.tsx */
import React from 'react';
import Link from 'next/link';
import styles from './FeaturedComponents.module.css';

interface FeaturedComponent {
  id: string;
  icon: string;
  title: string;
  description: string;
  previewUrl: string;
}

const featuredComponents: FeaturedComponent[] = [
  {
    id: 'buttons',
    icon: '🔘',
    title: 'Botões Modernos',
    description: 'Conjunto de botões com estilos modernos e animações suaves.',
    previewUrl: '/components?category=buttons'
  },
  {
    id: 'cards',
    icon: '🖼️',
    title: 'Cards Interativos',
    description: 'Cards com efeitos de hover e transições elegantes.',
    previewUrl: '/components?category=cards'
  },
  {
    id: 'forms',
    icon: '📋',
    title: 'Formulários Estilizados',
    description: 'Elementos de formulário com validação e estilo personalizado.',
    previewUrl: '/components?category=forms'
  }
];

export default function FeaturedComponents() {
  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Componentes em Destaque</h2>
          <p className={styles.sectionDescription}>
            Explore nossa seleção de componentes mais populares
          </p>
        </div>
        
        <div className={styles.componentsGrid}>
          {featuredComponents.map((component) => (
            <div key={component.id} className={styles.componentCard}>
              <span className={styles.componentIcon} aria-hidden="true">
                {component.icon}
              </span>
              <h3 className={styles.componentTitle}>{component.title}</h3>
              <p className={styles.componentDescription}>{component.description}</p>
              
              <div className={styles.componentActions}>
                <Link href={component.previewUrl}>
                  <span className={styles.previewButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Ver Preview
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}