'use client';

import { useState, useEffect } from 'react';
import { FavoritosService } from '@/services/FavoritosService';
import styles from './favorite-styles.module.css';
import { useNotification } from '@/contexts/NotificationContext';

interface FavoriteButtonProps {
  userId: number;
  componentId: number;
  size?: 'small' | 'medium' | 'large';
  position?: 'card' | 'detail' | 'standalone';
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ 
  userId, 
  componentId, 
  size = 'medium',
  position = 'card',
  onFavoriteChange
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    checkFavoriteStatus();
  }, [userId, componentId]);

  const checkFavoriteStatus = async () => {
    if (!userId || !componentId) return;
    
    try {
      setIsLoading(true);
      const { isFavorito, favoritoData } = await FavoritosService.checkIsFavorito(userId, componentId);
      setIsFavorite(isFavorito);
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
    
    if (!userId || !componentId) {
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
        showToast('Componente removido dos favoritos', 'success');
      } else {
        // Adicionar aos favoritos
        const response = await FavoritosService.addFavorito(userId, componentId);
        setIsFavorite(true);
        setFavoriteId(response.id);
        setAnimating(true);
        showToast('Componente adicionado aos favoritos', 'success');
        
        // Reset animation after it completes
        setTimeout(() => setAnimating(false), 700);
      }
      
      // Notify parent component if callback provided
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

  // Define appropriate class based on position prop
  let buttonClass = styles.favoriteIcon;
  if (position === 'detail') {
    buttonClass = `${styles.detailFavoriteButton} ${isFavorite ? styles.favoriteActive : ''} ${animating ? styles.favoriteSuccess : ''}`;
  } else if (position === 'standalone') {
    buttonClass = `${styles.standaloneFavoriteButton} ${isFavorite ? styles.favoriteActive : ''}`;
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
        <span className={styles.favoriteIcon}>
          {isFavorite ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.4615 9.58842L13.9855 8.6546L11.553 3.29851C11.453 3.03759 11.2712 2.85581 11.0103 2.75577C10.4878 2.55571 9.86547 2.85581 9.6648 3.29851L7.23238 8.6546L1.75632 9.58842C1.45564 9.62842 1.19491 9.7885 1.03429 10.0294C0.834131 10.3255 0.834278 10.6935 1.01358 10.9887C1.19288 11.2838 1.53422 11.474 1.91481 11.4785L6.06183 13.6168L4.9992 19.293C4.93939 19.5305 4.97392 19.7782 5.09603 19.9904C5.35581 20.4103 5.9776 20.5094 6.39729 20.2498L11.6089 17.2252L16.8205 20.2498C17.0605 20.3898 17.3612 20.4097 17.6217 20.3097C18.1843 20.1096 18.4648 19.4893 18.2185 18.9266L17.1559 13.6168L21.3029 11.4785H21.4035C21.8858 11.4785 22.2865 11.0783 22.2865 10.5959C22.2865 10.3354 22.1864 10.0949 21.9858 9.93418C21.8252 9.78852 21.6045 9.62842 19.4615 9.58842Z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.4806 3.49883C11.6728 3.03685 12.3272 3.03685 12.5194 3.49883L14.6726 8.63525C14.7509 8.8138 14.9205 8.93616 15.1146 8.95147L20.7168 9.39702C21.2142 9.43472 21.4135 10.0491 21.0481 10.3821L16.8754 14.1365C16.7311 14.2663 16.6659 14.4653 16.7041 14.6561L18.0425 20.1627C18.1446 20.651 17.6274 21.0428 17.1879 20.7917L12.3187 17.9576C12.1431 17.8567 11.9268 17.8567 11.7513 17.9576L6.88216 20.7917C6.44255 21.0428 5.92538 20.651 6.02735 20.1627L7.36597 14.6561C7.40408 14.4653 7.33892 14.2663 7.19454 14.1365L2.95194 10.3821C2.58654 10.0491 2.78581 9.43472 3.28322 9.39702L8.88542 8.95147C9.07948 8.93616 9.24907 8.8138 9.32731 8.63525L11.4806 3.49883Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      
      {position === 'detail' && (
        <span className={styles.favoriteTooltip}>
          {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        </span>
      )}
    </button>
  );
}
