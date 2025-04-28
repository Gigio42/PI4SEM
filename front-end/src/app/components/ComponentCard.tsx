'use client';

import { useState } from 'react';
import { Component } from '@/types/component';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import styles from './component-card.module.css';

interface ComponentCardProps {
  component: Component;
  userId?: number;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export default function ComponentCard({ component, userId, onFavoriteChange }: ComponentCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleCardClick = () => {
    // Navegação para a página de detalhes ou abrir modal
    // window.location.href = `/components/${component.id}`;
  };

  // Check if imageUrl exists in the component object
  const hasImageUrl = 'imageUrl' in component && component.imageUrl;

  return (
    <div className={styles.componentCard}>
      <div 
        className={styles.cardHeader}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        {hasImageUrl ? (
          <Image 
            src={component.imageUrl as string} 
            alt={component.name} 
            width={300}
            height={200}
            className={styles.componentImage}
          />
        ) : (
          <div 
            className={styles.componentPlaceholder}
            style={{ backgroundColor: component.color || '#e5e7eb' }}
          >
            <span className={styles.componentInitial}>
              {component.name ? component.name.charAt(0) : 'C'}
            </span>
          </div>
        )}
        
        {/* Preview do componente ao fazer hover */}
        {showPreview && component.htmlContent && (
          <div className={styles.componentPreview}>
            <div 
              className={styles.previewContent}
              dangerouslySetInnerHTML={{ 
                __html: `
                <style>
                  /* Reset básico para o preview */
                  .preview-wrapper * { box-sizing: border-box; margin: 0; padding: 0; }
                  .preview-wrapper { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
                  
                  /* Estilos do componente */
                  ${component.cssContent}
                </style>
                <div class="preview-wrapper">${component.htmlContent}</div>
                ` 
              }}
            />
          </div>
        )}
        
        {/* Botão de favorito */}
        {userId && (
          <FavoriteButton 
            userId={userId} 
            componentId={component.id}
            onFavoriteChange={onFavoriteChange}
          />
        )}
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.componentName}>{component.name}</h3>
        
        <div className={styles.componentMeta}>
          {component.category && (
            <span className={styles.componentCategory}>
              {component.category}
            </span>
          )}
          
          <span 
            className={styles.componentColor} 
            style={{ backgroundColor: component.color }}
            title={component.color}
          />
        </div>
      </div>
      
      <div className={styles.cardFooter}>
        <Link 
          href={`/components/${component.id}`}
          className={styles.detailsButton}
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
