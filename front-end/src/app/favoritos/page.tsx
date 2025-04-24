"use client";

import { useState, useEffect } from 'react';
import { FavoritosService } from '@/services/FavoritosService';
import { Component } from '@/types/component';
import Header from '@/app/components/Header/Header';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import styles from '@/app/components/components.module.css';
import favStyles from './favorites.module.css';
import ComponentDetail from '@/app/adm/components/components/ComponentDetail';
import FavoriteButton from '@/components/FavoriteButton/FavoriteButton';
import { useNotification } from '@/contexts/NotificationContext';
import Link from 'next/link';

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showToast } = useNotification();

  // ID do usuário atual (normalmente viria de um contexto de autenticação)
  // Este é apenas um exemplo, você deve obter o ID real do usuário logado
  const userId = 1;
  useEffect(() => {
    setLoaded(true);
    fetchFavoritos();
  }, []);

  const fetchFavoritos = async () => {
    try {
      setLoading(true);
      const data = await FavoritosService.getFavoritosByUser(userId);
      setFavoritos(data);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar seus favoritos. Tente novamente mais tarde.");
      console.error("Erro ao buscar favoritos:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveFavorito = async (componentId: number) => {
    try {
      await FavoritosService.removeFavoritoByUserAndComponent(userId, componentId);
      setFavoritos(prev => prev.filter(comp => comp.id !== componentId));
      showToast('Componente removido dos favoritos', 'info');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      showToast('Erro ao remover dos favoritos', 'error');
    }
  };

  const handleComponentClick = (component: Component) => {
    setSelectedComponent(component);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedComponent(null);
    // Atualizar a lista de favoritos após fechar o sidebar
    // pois o usuário pode ter removido um favorito
    fetchFavoritos();
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Meus Favoritos</h1>
            <p className={styles.pageDescription}>
              Acesse rapidamente os componentes que você marcou como favoritos
            </p>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : error ? (
            <div className={styles.errorMessage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          ) : favoritos.length === 0 ? (            <div className={favStyles.emptyFavorites}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Ainda não há componentes favoritos</h3>
              <p>Você ainda não adicionou nenhum componente aos seus favoritos. Adicione componentes aos favoritos para acessá-los facilmente.</p>
              <Link href="/components">
                <button className={favStyles.exploreButton}>
                  Explorar componentes
                </button>
              </Link>
            </div>
          ) : (            <div className={styles.componentsGrid}>
              {favoritos.map((component) => (
                <div 
                  key={component.id} 
                  className={styles.componentCard}
                  onClick={() => handleComponentClick(component)}
                >
                  <div className={styles.componentHeader}>
                    <h3 className={styles.componentName}>{component.name}</h3>
                    <span className={styles.componentCategory}>
                      {component.category || "Outros"}
                    </span>
                    <FavoriteButton 
                      componentId={component.id}
                      userId={userId}
                      initialState={true}
                      onToggle={(isFavorite) => {
                        if (!isFavorite) {
                          handleRemoveFavorito(component.id);
                        }
                      }}
                      size="medium"
                      className={styles.favoriteIcon}
                    />
                  </div>
                  
                  <div 
                    className={styles.componentPreview}
                    style={{ 
                      backgroundColor: component.htmlContent ? 'white' : component.color || "#6366F1"
                    }}
                  >
                    {component.htmlContent ? (
                      <div 
                        className={styles.previewContent}
                        dangerouslySetInnerHTML={{ 
                          __html: `<style>${component.cssContent}</style>${component.htmlContent}` 
                        }}
                      />
                    ) : (
                      <div className={styles.previewLabel}>
                        Componente CSS
                      </div>
                    )}
                    <div className={styles.previewOverlay}>
                      <span>Clique para visualizar detalhes</span>
                    </div>
                  </div>
                  
                  <div className={styles.componentCode}>
                    <pre>
                      {component.cssContent.length > 150 
                        ? `${component.cssContent.substring(0, 150)}...` 
                        : component.cssContent}
                    </pre>
                  </div>
                    <div className={styles.componentActions}>
                    <button 
                      className={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComponentClick(component);
                      }}
                    >
                      Ver detalhes
                    </button>
                    <button 
                      className={styles.copyButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(component.cssContent);
                        showToast('CSS copiado para a área de transferência', 'success');
                      }}
                    >
                      Copiar CSS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {sidebarOpen && selectedComponent && (
        <ComponentDetail 
          component={selectedComponent} 
          onClose={closeSidebar}
        />
      )}
    </div>
  );
}
