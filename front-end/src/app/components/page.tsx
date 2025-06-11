"use client";

import { useState, useEffect, useRef } from "react";
import { Component } from "@/types/component";
import { ComponentsService } from "@/services/ComponentsService";
import Header from "@/app/components/Header/Header";
import  Sidebar  from "@/app/components/Sidebar/Sidebar";
import ComponentCard from "@/app/components/ComponentCard/ComponentCard";
import ComponentPreview from "@/app/components/ComponentPreview/ComponentPreview";
import ComponentPreviewModal from "@/app/components/ComponentPreviewModal/ComponentPreviewModal";
import styles from "./ComponentsPage.module.css";
import { useAuth } from '@/contexts/AuthContext';

export default function ComponentsPage() {
  const [loaded, setLoaded] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const componentsPerPage = 12;
  const { user } = useAuth();

  useEffect(() => {
    setLoaded(true);
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching components...');
      
      const data = await ComponentsService.getAllComponents();
      console.log('✅ Components received:', data);
      
      setComponents(data);
      setError(null);
    } catch (err: any) {
      console.error("❌ Erro ao buscar componentes:", err);
      
      let errorMessage = "Falha ao carregar componentes. Tente novamente mais tarde.";
      
      if (err.message?.includes('Timeout')) {
        errorMessage = "Timeout na conexão. O servidor está demorando para responder.";
      } else if (err.message?.includes('Erro de conexão')) {
        errorMessage = "Erro de conexão. Verifique se o servidor está rodando.";
      } else if (err.message?.includes('interno do servidor')) {
        errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
      }
      
      setError(errorMessage);
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFavoriteChange = async (componentId: number, isFavorite: boolean) => {
    // Update the local state immediately for better UX
    setComponents(prev => prev.map(component => 
      component.id === componentId 
        ? { ...component, isFavorited: isFavorite }
        : component
    ));
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Filtragem e paginação
  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? component.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredComponents.length / componentsPerPage);
  const indexOfLastComponent = currentPage * componentsPerPage;
  const indexOfFirstComponent = indexOfLastComponent - componentsPerPage;
  const currentComponents = filteredComponents.slice(indexOfFirstComponent, indexOfLastComponent);

  // Lista única de categorias para o filtro
  const categories = Array.from(new Set(components.map(comp => comp.category).filter(Boolean)));

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar onCollapseChange={handleSidebarCollapse} />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Biblioteca de Componentes</h1>
            <p className={styles.pageDescription}>
              Explore nossa coleção de componentes CSS prontos para uso em seus projetos.
            </p>
          </div>

          <div className={styles.filterContainer}>
            <div className={styles.searchWrapper}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar componentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.categoryFilter}
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Carregando componentes...</p>
            </div>
          ) : error ? (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button onClick={fetchComponents} className={styles.retryButton}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <div className={styles.componentsGrid}>
                {currentComponents.map(component => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    userId={user?.id}
                    onPreview={handleComponentPreview}
                    showAdminActions={false}
                    showFavorite={true}
                    showDetailsLink={true}
                    variant="user"
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.paginationButton}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Anterior
                  </button>
                  
                  <div className={styles.paginationNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className={styles.paginationButton}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Próximo
                  </button>
                </div>
              )}
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

          {/* Preview Modal */}
          {selectedComponent && (
            <ComponentPreviewModal
              component={selectedComponent}
              isOpen={isModalOpen}
              onClose={closeModal}
              userId={user?.id}
              onFavoriteChange={() => handleFavoriteChange(selectedComponent.id, !selectedComponent.isFavorited)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
