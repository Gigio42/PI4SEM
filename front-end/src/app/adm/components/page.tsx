"use client";

import { useState, useEffect, useRef } from "react";
import { Component } from "@/types/component";
import { ComponentsService } from "@/services/ComponentsService";
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import ComponentForm from "./components/ComponentForm";
import ComponentEditForm from "./components/ComponentEditForm";
import ComponentDetail from "./components/ComponentDetail";
import adminStyles from "../admin.module.css";
import styles from "./components.module.css";

export default function ManageComponents() {
  const [loaded, setLoaded] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<Component | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const componentsPerPage = 8; // Changed from 10 to 8 for better grid layout

  useEffect(() => {
    setLoaded(true);
    fetchComponents();
  }, []);

  // Focus search input when using keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleAddComponent = () => {
    setShowAddForm(true);
    setEditMode(false);
    setComponentToEdit(null);
    closeSidebar();
    
    // Scroll to top with smooth animation
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleComponentCreated = (newComponent: Component) => {
    setComponents(prev => [newComponent, ...prev]);
    setShowAddForm(false);
  };

  const handleEditClick = (component: Component, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail sidebar
    setComponentToEdit(component);
    setEditMode(true);
    setShowAddForm(false);
    closeSidebar();
    
    // Scroll to top with smooth animation
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setComponentToEdit(null);
  };

  const handleComponentUpdated = (updatedComponent: Component) => {
    setComponents(prev => 
      prev.map(comp => comp.id === updatedComponent.id ? updatedComponent : comp)
    );
    setEditMode(false);
    setComponentToEdit(null);
  };

  const handleDeleteClick = (component: Component, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail sidebar
    setComponentToDelete(component);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!componentToDelete) return;

    try {
      await ComponentsService.deleteComponent(componentToDelete.id);
      setComponents(prev => prev.filter(c => c.id !== componentToDelete.id));
      
      // If the deleted component was the selected one, close the sidebar
      if (selectedComponent && selectedComponent.id === componentToDelete.id) {
        closeSidebar();
      }
      
      setDeleteModalOpen(false);
      setComponentToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir componente:", err);
      // Poderíamos adicionar uma notificação de erro aqui
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setComponentToDelete(null);
  };

  const handleComponentClick = (component: Component) => {
    setSelectedComponent(component);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    // Add a small delay before actually removing the component from state
    // This allows the close animation to play
    setTimeout(() => {
      setSelectedComponent(null);
    }, 300);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  const handleClearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
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
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""}`}>
          <div className={styles.pageHeaderContainer}>
            <h1 className={styles.pageTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H7C8.10457 3 9 3.89543 9 5V7C9 8.10457 8.10457 9 7 9H5C3.89543 9 3 8.10457 3 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 5C15 3.89543 15.8954 3 17 3H19C20.1046 3 21 3.89543 21 5V7C21 8.10457 20.1046 9 19 9H17C15.8954 9 15 8.10457 15 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 17C3 15.8954 3.89543 15 5 15H7C8.10457 15 9 15.8954 9 17V19C9 20.1046 8.10457 21 7 21H5C3.89543 21 3 20.1046 3 19V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 17C15 15.8954 15.8954 15 17 15H19C20.1046 15 21 15.8954 21 17V19C21 20.1046 20.1046 21 19 21H17C15.8954 21 15 20.1046 15 19V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Gerenciar Componentes
            </h1>
            <p className={styles.pageDescription}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 3.25H14.5M12 15V6.5M18.446 7.108L14.1764 14.2612M15.6517 18.8537L7.5 14.5M5.55397 16.892L9.82353 9.73875M8.34827 5.14625L16.5 9.5" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Adicione, edite ou remova componentes CSS disponíveis na plataforma
            </p>
            
            {!showAddForm && !editMode && (
              <div className={styles.pageActions}>
                <div className={styles.searchContainer}>
                  <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Buscar componentes..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                  />
                  {searchTerm && (
                    <button 
                      onClick={handleClearSearch}
                      className={styles.clearSearchButton}
                      aria-label="Limpar busca"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  <div className={styles.searchShortcut}>
                    <span>Ctrl+K</span>
                  </div>
                </div>
                
                <div className={styles.filterContainer}>
                  <select 
                    className={styles.categorySelect}
                    value={filterCategory}
                    onChange={handleCategoryChange}
                    aria-label="Filtrar por categoria"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <svg className={styles.categorySelectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <button 
                  className={styles.addComponentButton}
                  onClick={handleAddComponent}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Adicionar Componente
                </button>
              </div>
            )}
            
            {!showAddForm && !editMode && (searchTerm || filterCategory) && (
              <div className={styles.filterTags}>
                {searchTerm && (
                  <div className={styles.filterTag}>
                    Pesquisando: {searchTerm}
                    <button 
                      className={styles.filterTagRemove}
                      onClick={handleClearSearch}
                      aria-label="Remover filtro de pesquisa"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
                
                {filterCategory && (
                  <div className={styles.filterTag}>
                    Categoria: {filterCategory}
                    <button 
                      className={styles.filterTagRemove}
                      onClick={() => setFilterCategory('')}
                      aria-label="Remover filtro de categoria"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showAddForm ? (
            <div className={`${adminStyles.card} ${styles.formCard}`}>
              <ComponentForm 
                onSuccess={handleComponentCreated} 
                onCancel={handleCancelAdd} 
              />
            </div>
          ) : editMode && componentToEdit ? (
            <div className={`${adminStyles.card} ${styles.formCard}`}>
              <ComponentEditForm 
                component={componentToEdit}
                onSuccess={handleComponentUpdated} 
                onCancel={handleCancelEdit} 
              />
            </div>
          ) : (
            <div className={adminStyles.tableContainer}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>Carregando componentes...</p>
                </div>
              ) : error ? (
                <div className={styles.errorMessage}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <h3>Erro ao carregar componentes</h3>
                    <p>{error}</p>
                    <button 
                      className={styles.retryButton}
                      onClick={fetchComponents}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Tentar novamente
                    </button>
                  </div>
                </div>
              ) : currentComponents.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className={styles.emptyTitle}>Nenhum componente encontrado</h3>
                  <p className={styles.emptyDescription}>
                    {searchTerm || filterCategory
                      ? "Nenhum componente corresponde aos filtros aplicados. Tente ajustar sua busca."
                      : "Você ainda não tem componentes cadastrados. Clique no botão 'Adicionar Componente' para começar."}
                  </p>
                  <button 
                    className={`${adminStyles.addButton} ${styles.emptyAddButton}`}
                    onClick={handleAddComponent}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Adicionar Componente
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.componentsGrid}>
                    {currentComponents.map(component => (
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
                            <div className={styles.colorPreviewOnly} style={{ 
                              color: "white", 
                              fontWeight: "bold",
                              textShadow: "0 1px 3px rgba(0,0,0,0.3)" 
                            }}>
                              {component.name}
                            </div>
                          )}
                          <div className={styles.previewOverlay}>
                            <span>Visualizar detalhes</span>
                          </div>
                        </div>
                        
                        <div className={styles.componentCode}>
                          {component.cssContent.length > 150 
                            ? `${component.cssContent.substring(0, 150)}...` 
                            : component.cssContent}
                        </div>
                        
                        <div className={styles.componentActions}>
                          <button 
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={(e) => handleEditClick(component, e)}
                            aria-label={`Editar ${component.name}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Editar</span>
                          </button>
                          
                          <button 
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={(e) => handleDeleteClick(component, e)}
                            aria-label={`Excluir ${component.name}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Paginação melhorada */}
                  {totalPages > 1 && (
                    <div className={`${adminStyles.pagination} ${styles.enhancedPagination}`}>
                      <button 
                        className={`${adminStyles.paginationButton} ${styles.paginationArrow}`}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Anterior</span>
                      </button>
                      
                      <div className={`${adminStyles.paginationNumbers} ${styles.enhancedPaginationNumbers}`}>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            className={`${adminStyles.paginationNumber} ${
                              currentPage === i + 1 ? adminStyles.active : ""
                            } ${styles.enhancedPaginationNumber}`}
                            onClick={() => setCurrentPage(i + 1)}
                            aria-label={`Página ${i + 1}`}
                            aria-current={currentPage === i + 1 ? "page" : undefined}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        className={`${adminStyles.paginationButton} ${styles.paginationArrow}`}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        aria-label="Próxima página"
                      >
                        <span>Próximo</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
              
              {/* Contador de resultados */}
              {!loading && !error && filteredComponents.length > 0 && (
                <div className={styles.resultsCounter}>
                  Mostrando {indexOfFirstComponent + 1}-{Math.min(indexOfLastComponent, filteredComponents.length)} de {filteredComponents.length} componentes
                </div>
              )}
            </div>
          )}

          {/* Modal de exclusão com design aprimorado */}
          {deleteModalOpen && componentToDelete && (
            <div className={styles.modalOverlay}>
              <div className={`${styles.modalContent} ${styles.deleteModal}`}>
                <div className={styles.deleteModalHeader}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className={styles.modalTitle}>Excluir Componente</h3>
                </div>
                <div className={styles.deleteModalBody}>
                  <p className={styles.deleteWarning}>
                    Tem certeza que deseja excluir o componente <strong>"{componentToDelete.name}"</strong>?
                  </p>
                  <p className={styles.deleteNote}>
                    Esta ação não pode ser desfeita e todos os dados relacionados serão removidos permanentemente.
                  </p>
                </div>
                <div className={styles.modalActions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={handleCancelDelete}
                  >
                    Cancelar
                  </button>
                  <button 
                    className={styles.confirmDeleteButton}
                    onClick={handleConfirmDelete}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Excluir Componente
                  </button>
                </div>
              </div>
            </div>
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
