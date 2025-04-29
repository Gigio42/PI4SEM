import React from 'react';
import styles from './FeaturedComponents.module.css';

export default function FeaturedComponents() {
  // Sample featured components data
  const featuredComponents = [
    {
      id: 1,
      title: 'Botões Modernos',
      description: 'Conjunto de botões com estilos modernos e animações suaves.',
      image: '/images/components/buttons.svg',
    },
    {
      id: 2,
      title: 'Cards Interativos',
      description: 'Cards com efeitos de hover e transições elegantes.',
      image: '/images/components/cards.svg',
    },
    {
      id: 3,
      title: 'Formulários Estilizados',
      description: 'Elementos de formulário com validação e estilo personalizado.',
      image: '/images/components/forms.svg',
    }
  ];

  return (
    <section className={styles.featuredSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Componentes em Destaque</h2>
        <p className={styles.sectionDescription}>
          Explore nossa seleção de componentes mais populares
        </p>
      </div>
      
      <div className={styles.componentsGrid}>
        {featuredComponents.map(component => (
          <div key={component.id} className={styles.componentCard}>
            <div className={styles.componentImageContainer}>
              {/* Use a fallback div if image is not available */}
              {component.image ? (
                <div 
                  className={styles.componentImage}
                  style={{ backgroundImage: `url(${component.image})` }}
                />
              ) : (
                <div className={styles.componentImagePlaceholder}>
                  <span>{component.title.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className={styles.componentInfo}>
              <h3 className={styles.componentTitle}>{component.title}</h3>
              <p className={styles.componentDescription}>{component.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
