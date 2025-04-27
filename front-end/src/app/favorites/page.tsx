'use client';

import { useState, useEffect } from 'react';
import { FavoritosService } from '@/services/FavoritosService';
import { Component } from '@/types/component';
import ComponentCard from '@/app/components/ComponentCard';
import styles from './favorites.module.css';

export default function FavoritosPage() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Component[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // ID do usuário atual (normalmente viria de um contexto de autenticação)
  const userId = 1; // Substitua pelo ID real do usuário logado

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const favoritedComponents = await FavoritosService.getFavoritosByUser(userId);
      setFavorites(favoritedComponents);
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
      setError('Não foi possível carregar seus componentes favoritos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteRemoved = (componentId: number) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(component => component.id !== componentId)
    );
  };

  return (
    <div className={styles.favoritesContainer}>
      <div className={styles.favoritesHeader}>
        <h1 className={styles.favoritesTitle}>Meus Favoritos</h1>
        <p className={styles.favoritesDescription}>
          Componentes que você marcou como favoritos
        </p>
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Carregando seus favoritos...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={loadFavorites}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.4806 3.49883C11.6728 3.03685 12.3272 3.03685 12.5194 3.49883L14.6726 8.63525C14.7509 8.8138 14.9205 8.93616 15.1146 8.95147L20.7168 9.39702C21.2142 9.43472 21.4135 10.0491 21.0481 10.3821L16.8754 14.1365C16.7311 14.2663 16.6659 14.4653 16.7041 14.6561L18.0425 20.1627C18.1446 20.651 17.6274 21.0428 17.1879 20.7917L12.3187 17.9576C12.1431 17.8567 11.9268 17.8567 11.7513 17.9576L6.88216 20.7917C6.44255 21.0428 5.92538 20.651 6.02735 20.1627L7.36597 14.6561C7.40408 14.4653 7.33892 14.2663 7.19454 14.1365L2.95194 10.3821C2.58654 10.0491 2.78581 9.43472 3.28322 9.39702L8.88542 8.95147C9.07948 8.93616 9.24907 8.8138 9.32731 8.63525L11.4806 3.49883Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>Nenhum favorito encontrado</h2>
          <p className={styles.emptyDescription}>
            Você ainda não adicionou nenhum componente aos seus favoritos.
          </p>
          <a href="/components" className={styles.browseLink}>
            Explorar componentes
          </a>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && (
        <div className={styles.componentGrid}>
          {favorites.map(component => (
            <ComponentCard 
              key={component.id} 
              component={component}
              userId={userId}
              onFavoriteChange={(isFavorite) => {
                if (!isFavorite) handleFavoriteRemoved(component.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
