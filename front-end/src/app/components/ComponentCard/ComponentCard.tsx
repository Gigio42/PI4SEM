'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Component } from '@/types/component';
import ComponentPreview from '@/app/components/ComponentPreview/ComponentPreview';
import FavoriteButton from '@/app/components/FavoriteButton';
import { useToast } from '@/hooks/useToast';
import styles from './ComponentCard.module.css';

interface ComponentCardProps {
  component: Component;
  userId?: number;
  onPreview?: (component: Component) => void;
  onEdit?: (component: Component) => void;
  onDelete?: (component: Component) => void;
  onFavoriteChange?: (isFavorited: boolean) => void;
  showAdminActions?: boolean;
  showFavorite?: boolean;
  showDetailsLink?: boolean;
  variant?: "user" | "admin" | "favorites";
}

export default function ComponentCard({
  component,
  userId,
  onPreview,
  onEdit,
  onDelete,
  onFavoriteChange,
  showAdminActions = false,
  showFavorite = true,
  showDetailsLink = true,
  variant = "user"
}: ComponentCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  // Check favorite status
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (userId && component?.id && showFavorite) {
        try {
          // FavoritosService.checkIfFavorited(userId, component.id);
          setIsFavorited(false);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [userId, component?.id, showFavorite]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId || !component?.id) {
      showToast('Você precisa estar logado para favoritar componentes.', { type: 'warning' });
      return;
    }

    try {
      setIsProcessing(true);
      
      if (isFavorited) {
        // await FavoritosService.removeFavorite(userId, component.id);
        setIsFavorited(false);
        showToast('Componente removido dos favoritos', { type: 'success' });
      } else {
        // await FavoritosService.addFavorite(userId, component.id);
        setIsFavorited(true);
        showToast('Componente adicionado aos favoritos', { type: 'success' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Erro ao atualizar favoritos. Tente novamente.', { type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardClick = () => {
    if (onPreview) {
      onPreview(component);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(component);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Link navigation will be handled by Next.js
  };

  return (
    <div 
      className={`${styles.componentCard} ${styles[variant]}`}
      onClick={!showAdminActions ? handleCardClick : undefined}
      style={{ cursor: !showAdminActions ? 'pointer' : 'default' }}
    >
      {/* Header with name and favorite button */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderContent}>
          <h3 className={styles.componentName}>{component.name}</h3>
          {component.category && (
            <span className={styles.componentCategory}>
              {component.category}
            </span>
          )}
        </div>
        
        {showFavorite && userId && (
          <FavoriteButton
            userId={userId}
            componentId={component.id}
            position="product"
            onFavoriteChange={onFavoriteChange}
            initialFavoriteState={component.isFavorited}
          />
        )}
      </div>

      {/* Preview area */}
      <div className={styles.cardPreview}>
        <div className={styles.previewContainer}>
          <ComponentPreview
            htmlContent={component.htmlContent || ''}
            cssContent={component.cssContent}
            initialMode="light"
            initialDevice="desktop"
            showCode={false}
            showControls={false}
          />
          
          <div className={styles.previewOverlay}>
            <span>Clique para visualizar</span>
          </div>
        </div>
      </div>

      {/* Card body with metadata */}
      <div className={styles.cardBody}>
        <div className={styles.componentMeta}>
          {component.primaryColor && (
            <div className={styles.componentColor}>
              <div 
                className={styles.colorPreview}
                style={{ backgroundColor: component.primaryColor }}
                title={`Cor principal: ${component.primaryColor}`}
              />
              <span>{component.primaryColor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card footer with actions */}
      <div className={styles.cardFooter}>
        {showAdminActions ? (
          <div className={styles.adminActions}>
            <button
              className={`${styles.actionButton} ${styles.previewButton}`}
              onClick={handlePreviewClick}
              title="Visualizar componente"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Preview
            </button>
            
            {onEdit && (
              <button
                className={`${styles.actionButton} ${styles.editButton}`}
                onClick={(e) => onEdit(component)}
                title="Editar componente"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Editar
              </button>
            )}
            
            {onDelete && (
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={(e) => onDelete(component)}
                title="Excluir componente"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Excluir
              </button>
            )}
          </div>
        ) : (
          <div className={styles.userActions}>
            <button
              className={`${styles.actionButton} ${styles.detailsButton}`}
              onClick={handlePreviewClick}
              title="Ver detalhes"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Ver Detalhes
            </button>
            
            {showDetailsLink && (
              <Link href={`/components/${component.id}`}>
                <span
                  className={`${styles.actionButton} ${styles.previewButton}`}
                  onClick={handleLinkClick}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Abrir
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
