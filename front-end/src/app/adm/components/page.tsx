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
  const componentsPerPage = 10;

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

  const handleAddComponent = () => {
    setShowAddForm(true);
    setEditMode(false);
    setComponentToEdit(null);
    closeSidebar();
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
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""}`}>
          <div className={adminStyles.contentHeader}>
            <h1 className={adminStyles.pageTitle}>Gerenciar Componentes</h1>
            <p className={adminStyles.pageDescription}>
              Adicione, edite ou remova componentes CSS disponíveis na plataforma
            </p>
          </div>

          {showAddForm ? (
            <div className={adminStyles.card}>
              <ComponentForm 
                onSuccess={handleComponentCreated} 
                onCancel={handleCancelAdd} 
              />
            </div>
          ) : editMode && componentToEdit ? (
            <div className={adminStyles.card}>
              <ComponentEditForm 
                component={componentToEdit}
                onSuccess={handleComponentUpdated} 
                onCancel={handleCancelEdit} 
              />
            </div>
          ) : (
            <div className={adminStyles.tableContainer}>
              <div className={adminStyles.tableHeader}>
                <div className={adminStyles.tableSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Buscar componentes..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className={adminStyles.filterGroup}>
                  <select 
                    className={adminStyles.filterSelect}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <button 
                    className={adminStyles.addButton}
                    onClick={handleAddComponent}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Adicionar Componente
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              ) : error ? (
                <div className={styles.errorMessage}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{error}</span>
                </div>
              ) : currentComponents.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3>Nenhum componente encontrado</h3>
                  <p>
                    {searchTerm || filterCategory
                      ? "Nenhum componente corresponde aos filtros aplicados. Tente ajustar sua busca."
                      : "Você ainda não tem componentes cadastrados. Clique no botão 'Adicionar Componente' para começar."}
                  </p>
                  <button 
                    className={adminStyles.addButton}
                    onClick={handleAddComponent}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={(e) => handleEditClick(component, e)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Editar
                          </button>
                          
                          <button 
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={(e) => handleDeleteClick(component, e)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className={adminStyles.pagination}>
                      <button 
                        className={adminStyles.paginationButton}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Anterior
                      </button>
                      
                      <div className={adminStyles.paginationNumbers}>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            className={`${adminStyles.paginationNumber} ${
                              currentPage === i + 1 ? adminStyles.active : ""
                            }`}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        className={adminStyles.paginationButton}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Próximo
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Delete confirmation modal */}
          {deleteModalOpen && componentToDelete && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir o componente "{componentToDelete.name}"?</p>
                <p>Esta ação não pode ser desfeita.</p>
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
                    Excluir
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
