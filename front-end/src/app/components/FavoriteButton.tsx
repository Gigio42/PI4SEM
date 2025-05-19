'use client';

import { useState, useEffect, useRef } from 'react';
import { FavoritosService } from '@/services/FavoritosService';
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
  
  // Update internal state if initialFavoriteState changes
  useEffect(() => {
    if (initialFavoriteState !== undefined) {
      setIsFavorite(initialFavoriteState);
    }
  }, [initialFavoriteState]);

  // Subscribe to favorite state changes from the context
  useEffect(() => {
    // Check if there's a state for this component in the context
    if (favoriteStates[favoriteStateKey] !== undefined) {
      setIsFavorite(favoriteStates[favoriteStateKey]);
    }
    
    // Subscribe to changes
    const unsubscribe = subscribeToFavoriteChanges(() => {
      const contextState = favoriteStates[favoriteStateKey];
      if (contextState !== undefined && contextState !== isFavoriteRef.current) {
        setIsFavorite(contextState);
      }
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, [favoriteStates, favoriteStateKey, subscribeToFavoriteChanges]); // Removed isFavorite dependency
  const checkFavoriteStatus = async () => {
    if (userId === undefined || !componentId) return;
    
    try {
      setIsLoading(true);
      const { isFavorito, favoritoData } = await FavoritosService.checkIsFavorito(userId, componentId);
      
      // Only update state if the status has changed
      if (isFavorito !== isFavoriteRef.current) {
        setIsFavorite(isFavorito);
        // Update global context
        updateFavoriteState(componentId, userId, isFavorito);
        // Notify parent of change if state was different
        if (onFavoriteChange) {
          onFavoriteChange(isFavorito);
        }
      }
      
      setFavoriteId(favoritoData?.id || null);
    } catch (error) {
      console.error('Erro ao verificar status de favorito:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (userId === undefined || !componentId) {
      showToast('Você precisa estar logado para favoritar componentes', 'warning');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isFavorite && favoriteId) {
        // Remover dos favoritos
        await FavoritosService.removeFavorito(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        // Update global context
        updateFavoriteState(componentId, userId, false);
        showToast('Componente removido dos favoritos', 'success');
      } else {
        // Adicionar aos favoritos
        const response = await FavoritosService.addFavorito(userId, componentId);
        setIsFavorite(true);
        setFavoriteId(response.id);
        // Update global context
        updateFavoriteState(componentId, userId, true);
        setAnimating(true);
        showToast('Componente adicionado aos favoritos', 'success');
        
        // Reset animation after it completes
        setTimeout(() => setAnimating(false), 700);
      }
      
      // Notify parent component if callback provided - always do this
      if (onFavoriteChange) {
        onFavoriteChange(!isFavorite);
      }
    } catch (error) {
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
