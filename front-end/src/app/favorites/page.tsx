"use client";

import { useState, useEffect } from "react";
import { Component } from "@/types/component";
import { FavoritosService } from "@/services/FavoritosService";
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import ComponentDetail from "@/app/adm/components/components/ComponentDetail";
import { useNotification } from "@/contexts/NotificationContext";
import styles from "../components/components.module.css"; // Reuse the components page styling
import favStyles from "./favorites.module.css";

export default function FavoritesPage() {
  const [loaded, setLoaded] = useState(false);
  const [favorites, setFavorites] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userId = 1; // In a real app, this would come from auth context
  const { showToast } = useNotification();

  useEffect(() => {
    setLoaded(true);
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await FavoritosService.getFavoritosByUser(userId);
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar favoritos. Tente novamente mais tarde.");
      console.error("Erro ao buscar favoritos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComponentClick = (component: Component) => {
    setSelectedComponent(component);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedComponent(null);
  };

  const handleFavoriteRemoved = async (componentId: number) => {
    // Filter out the removed favorite from the state
    setFavorites(prev => prev.filter(comp => comp.id !== componentId));
    showToast("Componente removido dos favoritos", "success");
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Seus Favoritos</h1>
            <p className={styles.pageDescription}>
              Acesse rapidamente os componentes CSS que você salvou
            </p>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando seus favoritos...</p>
            </div>
          ) : error ? (
            <div className={styles.errorMessage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>{error}</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Nenhum componente favorito</h3>
              <p>Você ainda não adicionou nenhum componente aos favoritos. Navegue pela biblioteca de componentes e marque seus favoritos.</p>
            </div>
          ) : (
            <div className={styles.componentsGrid}>
              {favorites.map((component) => (
                <div 
                  key={component.id} 
                  className={styles.componentCard}
                  onClick={() => handleComponentClick(component)}
                >
                  <div className={styles.componentHeader}>
                    <h3 className={styles.componentName}>{component.name}</h3>
                    {component.category && (
                      <span className={styles.componentCategory}>{component.category}</span>
                    )}
                  </div>
                  
                  <div 
                    className={styles.componentPreview}
                    style={{ 
                      backgroundColor: component.htmlContent ? 'white' : component.color || "#6366F1",
                      overflow: 'hidden'
                    }}
                  >
                    {component.htmlContent ? (
                      <div 
                        className={styles.componentPreviewFrame}
                        dangerouslySetInnerHTML={{ 
                          __html: `<style>${component.cssContent}</style>${component.htmlContent}` 
                        }}
                      />
                    ) : (
                      <div style={{ 
                        color: "white", 
                        fontWeight: "bold",
                        textShadow: "0 1px 3px rgba(0,0,0,0.3)" 
                      }}>
                        {component.name}
                      </div>
                    )}
                    <div className={styles.previewOverlay}>
                      <span>Clique para visualizar detalhes</span>
                    </div>
                  </div>
                  
                  <div className={styles.componentCode}>
                    {component.cssContent.length > 150 
                      ? `${component.cssContent.substring(0, 150)}...` 
                      : component.cssContent}
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
                        showToast("CSS copiado para a área de transferência", "success");
                      }}
                    >
                      Copiar CSS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Component detail sidebar */}
          {sidebarOpen && (
            <>
              <div className={styles.backdropOverlay} onClick={closeSidebar}></div>
              <ComponentDetail 
                component={selectedComponent} 
                onClose={closeSidebar}
                onFavoriteRemoved={handleFavoriteRemoved}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
