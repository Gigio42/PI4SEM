"use client";

import { useState, useEffect, useRef } from "react";
import { Component } from "@/types/component";
import { ComponentsService } from "@/services/ComponentsService";
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import ComponentDetail from "@/app/adm/components/components/ComponentDetail";
import { useNotification } from "@/contexts/NotificationContext";
import styles from "./components.module.css";

export default function ComponentsPage() {  
  const [loaded, setLoaded] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const componentsPerPage = 8;
  // ID do usuário atual (normalmente viria de um contexto de autenticação)
  const userId = 1; // Substitua pelo ID real do usuário logado
  const { showToast } = useNotification();

  useEffect(() => {
    setLoaded(true);
    fetchComponents();
  }, []);
  const fetchComponents = async () => {
    try {
      setLoading(true);
      const data = await ComponentsService.getAllComponents();
      setComponents(data);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar componentes. Tente novamente mais tarde.");
      console.error("Erro ao buscar componentes:", err);
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
  const categories = Array.from(new Set(components.map(comp => comp.category))).filter(Boolean);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Componentes CSS</h1>
            <p className={styles.pageDescription}>
              Explore nossa coleção de componentes CSS para seus projetos de UX/UI
            </p>
          </div>

          <div className={styles.filterContainer}>
            <div className={styles.searchBox}>
              <input 
                type="text" 
                placeholder="Buscar componentes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {categories.length > 0 && (
              <div className={styles.filterSelect}>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={styles.categorySelect}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))} 
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando componentes...</p>
            </div>
          ) : error ? (
            <div className={styles.errorMessage}>              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>{error}</p>
            </div>
          ) : currentComponents.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Nenhum componente encontrado</h3>
              <p>Não encontramos componentes com os filtros atuais. Tente ajustar sua busca.</p>
            </div>
          ) : (
            <>              <div className={styles.componentsGrid}>
                {currentComponents.map((component) => (
                  <div                    key={component.id} 
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
                          // Poderia mostrar uma notificação de sucesso
                        }}
                      >
                        Copiar CSS
                      </button>
                    </div>
                  </div>
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
                  </button>                </div>
              )}
            </>
          )}

          {/* Component detail sidebar */}
          {sidebarOpen && (
            <>
              <div className={styles.backdropOverlay} onClick={closeSidebar}></div>
              <ComponentDetail 
                component={selectedComponent} 
                onClose={closeSidebar} 
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
