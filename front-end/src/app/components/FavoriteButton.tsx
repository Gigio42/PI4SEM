"use client";

import { useState, useEffect, useRef } from 'react';
import { FavoritesService } from '@/services/FavoritosService';
import styles from './favorite-styles.module.css';
import { useNotification } from '@/contexts/NotificationContext';
import { useFavorite } from '@/contexts/FavoriteContext';

interface FavoriteButtonProps {
  userId: number | undefined;
  componentId: number;
  size?: 'small' | 'medium' | 'large';
  position?: 'card' | 'detail' | 'standalone' | 'product';
  onFavoriteChange?: (isFavorite: boolean) => void;
  initialFavoriteState?: boolean;
  forceRefresh?: number;
}

export default function FavoriteButton({ 
  userId, 
  componentId, 
  size = 'medium',
  position = 'card',
  onFavoriteChange,
  initialFavoriteState,
  forceRefresh = 0
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavoriteState ?? false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { showToast } = useNotification();
  const { favoriteStates, updateFavoriteState, subscribeToFavoriteChanges } = useFavorite();
  
  // Use a ref to track the current favorite state to avoid dependency issues
  const isFavoriteRef = useRef(isFavorite);
  
  // Update ref when state changes
  useEffect(() => {
    isFavoriteRef.current = isFavorite;
  }, [isFavorite]);
  // Generate a unique key for this component-user combination
  const favoriteStateKey = userId ? `${userId}_${componentId}` : `guest_${componentId}`;

  // Check favorite status whenever props change or forceRefresh changes
  useEffect(() => {
    checkFavoriteStatus();
  }, [userId, componentId, forceRefresh]);

  const checkFavoriteStatus = async () => {
    if (userId === undefined || !componentId) return;
    
    try {
      console.log(`FavoriteButton: Checking favorite status for component ${componentId}, user ${userId}`);
      
      const isFavorited = await FavoritesService.checkIsFavorito(componentId, userId);
      
      console.log(`FavoriteButton: Component ${componentId} is favorited: ${isFavorited}`);
      
      // Only update state if the status has changed
      if (isFavorited !== isFavoriteRef.current) {
        setIsFavorite(isFavorited);
        // Update global context
        updateFavoriteState(componentId, userId, isFavorited);
        // Notify parent of change if state was different
        if (onFavoriteChange) {
          onFavoriteChange(isFavorited);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status de favorito:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('FavoriteButton - Toggle called:', { userId, componentId, position, currentState: isFavorite });
    
    if (userId === undefined || !componentId) {
      showToast('Você precisa estar logado para favoritar componentes', 'warning');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isFavorite) {
        // Remove from favorites
        const success = await FavoritesService.removeFavorito(componentId, userId);
        if (success) {
          setIsFavorite(false);
          updateFavoriteState(componentId, userId, false);
          showToast('Componente removido dos favoritos', 'success');
          
          if (onFavoriteChange) {
            onFavoriteChange(false);
          }
        } else {
          showToast('Erro ao remover dos favoritos', 'error');
        }
      } else {
        // Add to favorites
        const result = await FavoritesService.addFavorito(componentId, userId);
        if (result) {
          setIsFavorite(true);
          updateFavoriteState(componentId, userId, true);
          setAnimating(true);
          showToast('Componente adicionado aos favoritos', 'success');
          
          setTimeout(() => setAnimating(false), 700);
          
          if (onFavoriteChange) {
            onFavoriteChange(true);
          }
        } else {
          showToast('Erro ao adicionar aos favoritos', 'error');
        }
      }

      // Force refresh the favorite status after a short delay to ensure consistency
      setTimeout(async () => {
        const refreshedStatus = await FavoritesService.checkIsFavorito(componentId, userId);
        if (refreshedStatus !== isFavorite) {
          console.log(`Correcting favorite status for component ${componentId}: ${refreshedStatus}`);
          setIsFavorite(refreshedStatus);
          updateFavoriteState(componentId, userId, refreshedStatus);
        }
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao atualizar favorito:', error);
      showToast('Erro ao atualizar favoritos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced class selection
  let buttonClass = '';
  if (position === 'detail') {
    // Make the detail button appear like the card button
    buttonClass = `${styles.favoriteIcon} ${isFavorite ? styles.favoriteActive : ''} ${animating ? styles.favoriteSuccess : ''}`;
  } else if (position === 'standalone') {
    buttonClass = `${styles.standaloneFavoriteButton} ${isFavorite ? styles.favoriteActive : ''}`;
  } else if (position === 'product') {
    buttonClass = `${styles.productCardFavorite} ${isFavorite ? styles.favoriteActive : ''} ${animating ? styles.favoriteSuccess : ''}`;
  } else {
    buttonClass = `${styles.favoriteIcon} ${isFavorite ? styles.favoriteActive : ''} ${animating ? styles.favoriteSuccess : ''}`;
  }

  // Define size class
  const sizeClass = size === 'small' 
    ? styles.favoriteSmall 
    : size === 'large' 
      ? styles.favoriteLarge 
      : '';

  return (
    <button 
      className={`${buttonClass} ${sizeClass}`}
      onClick={toggleFavorite}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      disabled={isLoading}
      type="button"
    >
      {isLoading ? (
        <span className={styles.favoriteLoading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.loadingIcon}>
            <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M19.07 19.07L16.24 16.24M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      ) : (
        <span>
          {isFavorite ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
}
