"use client";

import { useState, useEffect } from "react";
import { Component } from "@/types/component";
import { FavoritesService } from "@/services/FavoritosService";
import { ComponentsService } from "@/services/ComponentsService";
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import ComponentCard from "@/app/components/ComponentCard/ComponentCard";
import ComponentPreview from "@/app/components/ComponentPreview/ComponentPreview";
import styles from "./favorites.module.css";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

export default function FavoritesPage() {
  const [loaded, setLoaded] = useState(false);
  const [favoriteComponents, setFavoriteComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    setLoaded(true);
    if (user?.id) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
    
    // Set up an interval to refresh favorites periodically
    const refreshInterval = setInterval(() => {
      if (user?.id) {
        console.log('Auto-refreshing favorites...');
        fetchFavorites();
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [user]);

  const fetchFavorites = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching favorites');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`=== Fetching favorites for user ${user.id} ===`);

      // Use the new API endpoint that returns favorites with component details
      const favoriteComponents = await FavoritesService.getUserFavoritesWithComponents(user.id);
      console.log('Favorite components from API:', favoriteComponents);
      
      setFavoriteComponents(favoriteComponents);
      
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError("Falha ao carregar favoritos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleComponentPreview = (component: Component) => {
    setSelectedComponent(component);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setTimeout(() => setSelectedComponent(null), 300);
  };

  const handleFavoriteRemoved = (componentId: number) => {
    console.log(`Removing component ${componentId} from favorites list`);
    setFavoriteComponents(prev =>
      prev.filter(component => component.id !== componentId)
    );
    showToast("Favorito removido com sucesso.", { type: "success" });
    
    // Refresh favorites after a short delay
    setTimeout(() => {
      fetchFavorites();
    }, 1000);
  };

  if (!user) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.layoutContainer}>
          <Sidebar />
          <main className={styles.mainContent}>
            <div className={styles.loginPrompt}>
              <h1>Acesso Necessário</h1>
              <p>Você precisa estar logado para ver seus favoritos.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Meus Favoritos</h1>
            <p className={styles.pageDescription}>
              Componentes que você marcou como favoritos para acesso rápido.
            </p>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Carregando favoritos...</p>
            </div>
          ) : error ? (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button onClick={fetchFavorites} className={styles.retryButton}>
                Tentar novamente
              </button>
            </div>
          ) : favoriteComponents.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Nenhum favorito ainda</h3>
              <p>Explore a biblioteca de componentes e marque seus favoritos!</p>
              <button 
                onClick={() => window.location.href = '/components'}
                className={styles.exploreButton}
              >
                Explorar Componentes
              </button>
            </div>
          ) : (
            <>
              <div className={styles.favoriteStats}>
                <p>Você tem <strong>{favoriteComponents.length}</strong> componente{favoriteComponents.length !== 1 ? 's' : ''} favorito{favoriteComponents.length !== 1 ? 's' : ''}.</p>
              </div>
              
              <div className={styles.componentsGrid}>
                {favoriteComponents.map(component => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    userId={user?.id}
                    onPreview={handleComponentPreview}
                    onFavoriteChange={(isFavorited: boolean) => {
                      if (!isFavorited) {
                        handleFavoriteRemoved(component.id);
                      }
                    }}
                    showAdminActions={false}
                    showFavorite={true}
                    showDetailsLink={true}
                    variant="user"
                  />
                ))}
              </div>
            </>
          )}

          {/* ComponentPreview Sidebar */}
          {previewOpen && selectedComponent && (
            <>
              <div className={styles.previewSidebar}>
                <div className={styles.previewSidebarHeader}>
                  <h2 className={styles.previewSidebarTitle}>{selectedComponent.name}</h2>
                  <button 
                    className={styles.closeSidebarButton}
                    onClick={closePreview}
                    aria-label="Fechar preview"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className={styles.previewSidebarContent}>
                  <ComponentPreview
                    htmlContent={selectedComponent.htmlContent || ''}
                    cssContent={selectedComponent.cssContent}
                    initialMode="system"
                    initialDevice="desktop"
                    showCode={true}
                    showControls={true}
                  />
                </div>
              </div>
              <div 
                className={styles.sidebarBackdrop}
                onClick={closePreview}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
