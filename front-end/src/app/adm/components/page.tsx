"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminStyles from "../admin.module.css";
import styles from "./components.module.css";

// Define component type
interface Component {
  id: string;
  name: string;
  category: string;
  downloads: number;
  status: string;
  color: string;
}

// Mock data - will be replaced with API call later
const mockComponents: Component[] = [
  {
    id: '1',
    name: 'Card Moderno',
    category: 'UI Elements',
    downloads: 1245,
    status: 'active',
    color: '#6366F1'
  },
  {
    id: '2',
    name: 'Botão Glassmórfico',
    category: 'Buttons',
    downloads: 876,
    status: 'active',
    color: '#8B5CF6'
  },
  {
    id: '3',
    name: 'Input Animado',
    category: 'Form Elements',
    downloads: 654,
    status: 'inactive',
    color: '#10B981'
  },
  {
    id: '4',
    name: 'Barra de Progresso',
    category: 'UI Elements',
    downloads: 532,
    status: 'active',
    color: '#F59E0B'
  },
  {
    id: '5',
    name: 'Toggle Switch',
    category: 'Form Elements',
    downloads: 487,
    status: 'active',
    color: '#EF4444'
  },
  {
    id: '6',
    name: 'Modal Responsivo',
    category: 'Overlays',
    downloads: 422,
    status: 'inactive',
    color: '#3B82F6'
  }
];

export default function ManageComponents() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [components, setComponents] = useState<Component[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [componentsPerPage] = useState(4);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<Component | null>(null);
  
  // Fetch data when component mounts
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real scenario, this would be an API call like:
        // const response = await fetch('/api/components');
        // const data = await response.json();
        // setComponents(data);
        
        setComponents(mockComponents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching components:', error);
        setIsLoading(false);
      }
    };
    
    fetchComponents();
    setLoaded(true);
  }, []);

  // Filter components based on search term, category, and status
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      const matchesSearch = searchTerm === "" || 
        component.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "" || 
        component.category === categoryFilter;
      
      const matchesStatus = statusFilter === "" || 
        component.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [components, searchTerm, categoryFilter, statusFilter]);

  // Get available categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(components.map(item => item.category))];
    return uniqueCategories;
  }, [components]);

  // Pagination logic
  const indexOfLastComponent = currentPage * componentsPerPage;
  const indexOfFirstComponent = indexOfLastComponent - componentsPerPage;
  const currentComponents = filteredComponents.slice(indexOfFirstComponent, indexOfLastComponent);
  const totalPages = Math.ceil(filteredComponents.length / componentsPerPage);
  // Handle component deletion
  const handleDeleteClick = (component: Component) => {
    setComponentToDelete(component);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Simulate API request
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real scenario, this would be an API call like:
      // await fetch(`/api/components/${componentToDelete.id}`, {
      //   method: 'DELETE'
      // });
        setComponents(prevComponents => 
        prevComponents.filter(c => c.id !== componentToDelete?.id)
      );
      setShowDeleteModal(false);
      setComponentToDelete(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting component:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""}`}>
          <div className={adminStyles.contentHeader}>
            <h1 className={adminStyles.pageTitle}>Gerenciar Componentes</h1>
            <p className={adminStyles.pageDescription}>
              Adicione, edite ou remova componentes disponíveis na plataforma
            </p>
          </div>

          <div className={adminStyles.tableContainer}>
            <div className={adminStyles.tableHeader}>
              <div className={adminStyles.tableSearch}>
                <input 
                  type="text" 
                  placeholder="Buscar componentes..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar componentes"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={adminStyles.filterGroup}>
                <select 
                  className={adminStyles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filtrar por categoria"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select 
                  className={adminStyles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filtrar por status"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              <button className={adminStyles.addButton} aria-label="Adicionar componente">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Adicionar Componente
              </button>
            </div>
            
            {isLoading ? (
              <div className={adminStyles.loadingContainer}>
                <div className={adminStyles.loadingSpinner}></div>
                <p>Carregando componentes...</p>
              </div>
            ) : filteredComponents.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Nenhum componente encontrado</h3>
                <p>Tente ajustar seus filtros ou adicione um novo componente.</p>
              </div>
            ) : (
              <>
                <div className={adminStyles.table} role="table" aria-label="Lista de componentes">
                  <div className={adminStyles.tableRow + ' ' + adminStyles.tableHead} role="row">
                    <div className={adminStyles.tableCell} role="columnheader">Nome</div>
                    <div className={adminStyles.tableCell} role="columnheader">Categoria</div>
                    <div className={adminStyles.tableCell} role="columnheader">Downloads</div>
                    <div className={adminStyles.tableCell} role="columnheader">Status</div>
                    <div className={adminStyles.tableCell} role="columnheader">Ações</div>
                  </div>

                  {currentComponents.map((component) => (
                    <div className={adminStyles.tableRow} key={component.id} role="row">
                      <div className={adminStyles.tableCell} role="cell">
                        <div className={adminStyles.componentName}>
                          <div 
                            className={adminStyles.componentPreview} 
                            style={{backgroundColor: component.color}}
                            aria-hidden="true"
                          ></div>
                          {component.name}
                        </div>
                      </div>
                      <div className={adminStyles.tableCell} role="cell">{component.category}</div>
                      <div className={adminStyles.tableCell} role="cell">{component.downloads.toLocaleString()}</div>
                      <div className={adminStyles.tableCell} role="cell">
                        <span 
                          className={component.status === 'active' ? adminStyles.statusActive : adminStyles.statusInactive}
                        >
                          {component.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className={adminStyles.tableCell} role="cell">
                        <div className={adminStyles.actionButtons}>
                          <button 
                            className={adminStyles.editButton}
                            aria-label={`Editar ${component.name}`}
                          >
                            Editar
                          </button>
                          <button 
                            className={adminStyles.deleteButton}
                            aria-label={`Excluir ${component.name}`}
                            onClick={() => handleDeleteClick(component)}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={adminStyles.pagination} role="navigation" aria-label="Paginação">
                    <button 
                      className={adminStyles.paginationButton}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      aria-label="Página anterior"
                    >
                      Anterior
                    </button>
                    <div className={adminStyles.paginationNumbers}>
                      {[...Array(totalPages)].map((_, index) => (
                        <button 
                          key={index + 1}
                          className={`${adminStyles.paginationNumber} ${currentPage === index + 1 ? adminStyles.active : ''}`}
                          onClick={() => setCurrentPage(index + 1)}
                          aria-label={`Página ${index + 1}`}
                          aria-current={currentPage === index + 1 ? "page" : undefined}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      className={adminStyles.paginationButton}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      aria-label="Próxima página"
                    >
                      Próximo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Confirmation Modal */}
          {showDeleteModal && (
            <div className={adminStyles.modalOverlay}>
              <div className={adminStyles.modalContent} role="dialog" aria-labelledby="deleteModalTitle">
                <h2 id="deleteModalTitle" className={adminStyles.modalTitle}>Confirmar exclusão</h2>
                <p>
                  Você tem certeza que deseja excluir o componente <strong>{componentToDelete?.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div className={adminStyles.modalActions}>
                  <button 
                    className={adminStyles.cancelButton}
                    onClick={() => setShowDeleteModal(false)}
                    aria-label="Cancelar exclusão"
                  >
                    Cancelar
                  </button>
                  <button 
                    className={adminStyles.confirmDeleteButton}
                    onClick={handleDeleteConfirm}
                    aria-label="Confirmar exclusão"
                  >
                    {isLoading ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
