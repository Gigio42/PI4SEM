"use client";

import { useState, useEffect, useRef } from "react";
import { Component } from "@/types/component";
import { ComponentsService } from "@/services/ComponentsService";
import { SubscriptionService } from '@/services/SubscriptionService';
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import ComponentCard from "@/app/components/ComponentCard/ComponentCard";
import ComponentPreview from "@/app/components/ComponentPreview/ComponentPreview";
import ComponentPreviewModal from "@/app/components/ComponentPreviewModal/ComponentPreviewModal";
import styles from "./ComponentsPage.module.css";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ComponentsPage() {
  const [loaded, setLoaded] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const componentsPerPage = 12;
  const { user } = useAuth();
  // Efeito para inicializar e carregar dados
  useEffect(() => {
    const init = async () => {
      // Verificar o login e assinatura
      if (user?.id) {
        // Primeiro verificar se precisamos forçar o recarregamento do status de assinatura
        const forceRefresh = typeof window !== 'undefined' && 
          (localStorage.getItem('forceRefreshSubscription') === 'true' || 
           localStorage.getItem('forceRefreshComponents') === 'true');
        
        try {
          // Forçar recarregamento do status de assinatura se necessário
          if (forceRefresh) {
            console.log('Forcing subscription status refresh');
            // Remover a flag de forceRefreshSubscription
            localStorage.removeItem('forceRefreshSubscription');
          }
            
          // Verificar assinatura
          const hasActive = await SubscriptionService.checkUserHasActiveSubscription(user.id);
          console.log('User subscription status:', hasActive);
          setHasSubscription(hasActive);
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
      
      // Carregar componentes em todos os casos
      fetchComponents();
    };

    init();
  }, [user]); // Dependências que disparam a reexecução
  const fetchComponents = async () => {
    if (!ComponentsService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se precisamos forçar o recarregamento dos componentes
      const forceRefresh = typeof window !== 'undefined' && localStorage.getItem('forceRefreshComponents') === 'true';
      if (forceRefresh) {
        // Limpar a flag após usar
        localStorage.removeItem('forceRefreshComponents');
        console.log('Forçando atualização dos componentes após mudança na assinatura');
      }
      
      // Re-checar o status de assinatura se tiver forcado refresh
      if (forceRefresh && user?.id) {
        const hasActive = await SubscriptionService.checkUserHasActiveSubscription(user.id);
        console.log('Re-verificado status de assinatura:', hasActive);
        setHasSubscription(hasActive);
      }
      
      // Passar userId para API verificar assinatura no backend
      const components = await ComponentsService.getAllComponents(user?.id);
      
      console.log(`Buscou ${components.length} componentes`);
      setComponents(components);
      setLoaded(true);
    } catch (error) {
      console.error('Erro ao buscar componentes:', error);
      setError('Não foi possível carregar os componentes. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };  const handleComponentPreview = (component: Component) => {
    // Verificando explicitamente se o componente requer assinatura
    console.log("Trying to open preview, component:", component);
    
    // Evitar a abertura do preview para componentes que exigem assinatura
    if (component.requiresSubscription === true) {
      console.log("Blocked preview - subscription required");
      return;
    }
    
    setSelectedComponent(component);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedComponent(null), 300);
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
          </div>          {!hasSubscription && (
            <div className={styles.subscriptionBanner}>
              <div>
                <h3 className={styles.subscriptionBannerTitle}>
                  🔐 Acesso restrito
                </h3>
                <p className={styles.subscriptionMessage}>
                  Assine um plano para ter acesso completo ao código dos componentes e poder visualizá-los!
                </p>
              </div>
              <Link href="/subscription" className={styles.subscriptionButton}>
                Ver planos
              </Link>
            </div>
          )}

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
            </>          )}          {/* Preview Modal - só exibir se o componente não requer assinatura */}
          {selectedComponent && !selectedComponent.requiresSubscription && (
            <ComponentPreviewModal
              component={selectedComponent}
              isOpen={isModalOpen}
              onClose={closeModal}
              userId={user?.id}
              onFavoriteChange={() => handleFavoriteChange(selectedComponent.id, !selectedComponent.isFavorited)}
            />
          )}

          {/* Subscription Notice */}
          {!hasSubscription && (
            <div className={styles.subscriptionNotice}>
              <p className={styles.subscriptionText}>
                Para acessar todos os componentes, assine nosso plano premium.
              </p>
              <Link href="/pricing" className={styles.subscribeButton}>
                Assinar Agora
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
