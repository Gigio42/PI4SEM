"use client";

import { useState, useEffect } from 'react';
import { FavoritosService } from '@/services/FavoritosService';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  componentId: number;
  userId: number;
  initialState?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function FavoriteButton({
  componentId,
  userId,
  initialState = false,
  onToggle,
  size = 'medium',
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritoId, setFavoritoId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [componentId, userId]);

  const checkFavoriteStatus = async () => {
    try {
      const result = await FavoritosService.checkIsFavorito(userId, componentId);
      setIsFavorite(result.isFavorito);
      setFavoritoId(result.favoritoData?.id || null);
    } catch (error) {
      console.error('Erro ao verificar status de favorito:', error);
    }
  };
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      setAnimated(true);
      
      if (isFavorite) {
        // Primeiro verificamos se temos o ID do favorito
        if (favoritoId) {
          await FavoritosService.removeFavorito(favoritoId);
        } else {
          // Se não temos o ID, precisamos verificar novamente para obtê-lo
          const result = await FavoritosService.checkIsFavorito(userId, componentId);
          if (result.isFavorito && result.favoritoData?.id) {
            await FavoritosService.removeFavorito(result.favoritoData.id);
          } else {
            console.warn('Favorito não encontrado para remover');
          }
        }
        setIsFavorite(false);
        setFavoritoId(null);
      } else {
        const result = await FavoritosService.addFavorito(userId, componentId);
        setFavoritoId(result.id);
        setIsFavorite(true);
      }
      
      if (onToggle) {
        onToggle(!isFavorite);
      }
    } catch (error) {
      console.error('Erro ao manipular favorito:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAnimated(false), 500);
    }
  };
  return (
    <button
      className={`${styles.favoriteButton} ${styles[size]} ${isFavorite ? styles.active : ''} ${animated ? styles.animated : ''} ${className || ''}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.icon}
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
      {isLoading && <span className={styles.loader}></span>}
    </button>
  );
}
