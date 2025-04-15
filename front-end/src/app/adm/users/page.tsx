"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminStyles from "../admin.module.css";
import styles from "./users.module.css";

// Definição de interface para o tipo User
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  signupDate: string;
  initials: string;
}

// Mock user data - will be replaced with API call
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    role: 'user',
    status: 'active',
    signupDate: '2025-04-10',
    initials: 'MS'
  },
  {
    id: '2',
    name: 'João Costa',
    email: 'joao.costa@email.com',
    role: 'admin',
    status: 'active',
    signupDate: '2025-03-05',
    initials: 'JC'
  },
  {
    id: '3',
    name: 'Lucas Ribeiro',
    email: 'lucas.ribeiro@email.com',
    role: 'user',
    status: 'inactive',
    signupDate: '2025-02-22',
    initials: 'LR'
  },
  {
    id: '4',
    name: 'Ana Pereira',
    email: 'ana.pereira@email.com',
    role: 'user',
    status: 'active',
    signupDate: '2025-03-15',
    initials: 'AP'
  },
  {
    id: '5',
    name: 'Carlos Souza',
    email: 'carlos.souza@email.com',
    role: 'admin',
    status: 'active',
    signupDate: '2025-01-20',
    initials: 'CS'
  },
  {
    id: '6',
    name: 'Patrícia Lopes',
    email: 'patricia.lopes@email.com',
    role: 'user',
    status: 'inactive',
    signupDate: '2025-02-08',
    initials: 'PL'
  }
];

export default function ManageUsers() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate'>('deactivate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch data when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real scenario, this would be an API call:
        // const response = await fetch('/api/users');
        // const data = await response.json();
        // setUsers(data);
        
        setUsers(mockUsers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsLoading(false);
      }
    };
    
    fetchUsers();
    setLoaded(true);
  }, []);

  // Display success message for a limited time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter users based on search, status, and role
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || user.status === statusFilter;
      const matchesRole = roleFilter === '' || user.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Format date to Brazilian standard
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Handle user activation/deactivation
  const handleStatusAction = (user: User, action: 'activate' | 'deactivate'): void => {
    setActionUser(user);
    setModalAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async (): Promise<void> => {
    if (!actionUser) return;
    
    try {
      setIsProcessing(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real scenario, this would be an API call:
      // await fetch(`/api/users/${actionUser.id}/${modalAction}`, {
      //   method: 'PUT'
      // });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === actionUser.id 
            ? { ...user, status: modalAction === 'activate' ? 'active' : 'inactive' }
            : user
        )
      );
      
      setShowConfirmModal(false);
      setSuccessMessage(`Usuário ${actionUser.name} foi ${modalAction === 'activate' ? 'ativado' : 'desativado'} com sucesso!`);
      setIsProcessing(false);
      setActionUser(null);
    } catch (error) {
      console.error(`Error ${modalAction}ing user:`, error);
      setIsProcessing(false);
    }
  };

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""}`}>
          <div className={adminStyles.contentHeader}>
            <h1 className={adminStyles.pageTitle}>Gerenciar Usuários</h1>
            <p className={adminStyles.pageDescription}>
              Administre usuários e suas permissões na plataforma
            </p>
          </div>

          {successMessage && (
            <div className={styles.successAlert} role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {successMessage}
            </div>
          )}

          <div className={adminStyles.tableContainer}>
            <div className={adminStyles.tableHeader}>
              <div className={adminStyles.tableSearch}>
                <input 
                  type="text" 
                  placeholder="Buscar usuários..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar usuários"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={adminStyles.filterGroup}>
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
                <select 
                  className={adminStyles.filterSelect}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  aria-label="Filtrar por função"
                >
                  <option value="">Todas as funções</option>
                  <option value="admin">Administradores</option>
                  <option value="user">Usuários</option>
                </select>
                <button className={adminStyles.addButton} aria-label="Adicionar usuário">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Adicionar Usuário
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className={adminStyles.loadingContainer}>
                <div className={adminStyles.loadingSpinner}></div>
                <p>Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className={adminStyles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Nenhum usuário encontrado</h3>
                <p>Tente ajustar seus filtros ou adicionar um novo usuário.</p>
              </div>
            ) : (
              <>
                <div className={adminStyles.table} role="table" aria-label="Lista de usuários">
                  <div className={adminStyles.tableRow + ' ' + adminStyles.tableHead} role="row">
                    <div className={adminStyles.tableCell} role="columnheader">Usuário</div>
                    <div className={adminStyles.tableCell} role="columnheader">Email</div>
                    <div className={adminStyles.tableCell} role="columnheader">Função</div>
                    <div className={adminStyles.tableCell} role="columnheader">Status</div>
                    <div className={adminStyles.tableCell} role="columnheader">Ações</div>
                  </div>

                  {currentUsers.map((user) => (
                    <div className={adminStyles.tableRow} key={user.id} role="row">
                      <div className={adminStyles.tableCell} role="cell">
                        <div className={adminStyles.userInfo}>
                          <div className={adminStyles.userAvatar}>{user.initials}</div>
                          <div>
                            <div className={adminStyles.userName}>{user.name}</div>
                            <div className={adminStyles.userDate}>Desde {formatDate(user.signupDate)}</div>
                          </div>
                        </div>
                      </div>
                      <div className={adminStyles.tableCell} role="cell">{user.email}</div>
                      <div className={adminStyles.tableCell} role="cell">
                        <span className={user.role === 'admin' ? adminStyles.roleAdmin : adminStyles.roleUser}>
                          {user.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      </div>
                      <div className={adminStyles.tableCell} role="cell">
                        <span className={user.status === 'active' ? adminStyles.statusActive : adminStyles.statusInactive}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className={adminStyles.tableCell} role="cell">
                        <div className={adminStyles.actionButtons}>
                          <button 
                            className={adminStyles.editButton}
                            aria-label={`Editar ${user.name}`}
                          >
                            Editar
                          </button>
                          {user.status === 'active' ? (
                            <button 
                              className={adminStyles.deleteButton}
                              aria-label={`Desativar ${user.name}`}
                              onClick={() => handleStatusAction(user, 'deactivate')}
                            >
                              Desativar
                            </button>
                          ) : (
                            <button 
                              className={adminStyles.activateButton}
                              aria-label={`Ativar ${user.name}`}
                              onClick={() => handleStatusAction(user, 'activate')}
                            >
                              Ativar
                            </button>
                          )}
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
          {showConfirmModal && (
            <div className={adminStyles.modalOverlay}>
              <div className={adminStyles.modalContent} role="dialog" aria-labelledby="confirmModalTitle">
                <h2 id="confirmModalTitle" className={adminStyles.modalTitle}>
                  {modalAction === 'activate' ? 'Ativar usuário' : 'Desativar usuário'}
                </h2>
                <p>
                  Deseja realmente {modalAction === 'activate' ? 'ativar' : 'desativar'} o usuário <strong>{actionUser?.name}</strong>?
                </p>
                <div className={adminStyles.modalActions}>
                  <button 
                    className={adminStyles.cancelButton}
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </button>
                  <button 
                    className={modalAction === 'activate' ? adminStyles.saveButton : adminStyles.confirmDeleteButton}
                    onClick={handleConfirmAction}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className={adminStyles.smallSpinner}></span>
                        Processando...
                      </>
                    ) : (
                      modalAction === 'activate' ? 'Ativar' : 'Desativar'
                    )}
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
