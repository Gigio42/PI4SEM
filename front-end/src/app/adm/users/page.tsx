"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./users.module.css";
import { useToast } from "@/hooks/useToast";

// Definição de interface para o tipo User
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  signupDate: string;
  initials: string;
  lastLogin?: string;
  subscription?: string;
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
    initials: 'MS',
    lastLogin: '2025-04-12',
    subscription: 'Básico'
  },
  {
    id: '2',
    name: 'João Costa',
    email: 'joao.costa@email.com',
    role: 'admin',
    status: 'active',
    signupDate: '2025-03-05',
    initials: 'JC',
    lastLogin: '2025-04-13',
    subscription: 'Premium'
  },
  {
    id: '3',
    name: 'Lucas Ribeiro',
    email: 'lucas.ribeiro@email.com',
    role: 'user',
    status: 'inactive',
    signupDate: '2025-02-22',
    initials: 'LR',
    lastLogin: '2025-03-15',
    subscription: 'Básico'
  },
  {
    id: '4',
    name: 'Ana Pereira',
    email: 'ana.pereira@email.com',
    role: 'user',
    status: 'active',
    signupDate: '2025-03-15',
    initials: 'AP',
    lastLogin: '2025-04-11',
    subscription: 'Premium'
  },
  {
    id: '5',
    name: 'Carlos Souza',
    email: 'carlos.souza@email.com',
    role: 'admin',
    status: 'active',
    signupDate: '2025-01-20',
    initials: 'CS',
    lastLogin: '2025-04-13',
    subscription: 'Empresarial'
  },
  {
    id: '6',
    name: 'Patrícia Lopes',
    email: 'patricia.lopes@email.com',
    role: 'user',
    status: 'inactive',
    signupDate: '2025-02-08',
    initials: 'PL',
    lastLogin: '2025-03-02',
    subscription: 'Básico'
  }
];

export default function ManageUsers() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate'>('deactivate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { showToast } = useToast();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real scenario, this would be an API call
        setUsers(mockUsers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        showToast("Erro ao carregar usuários. Tente novamente mais tarde.");
        setIsLoading(false);
      }
    };
    
    fetchUsers();
    setLoaded(true);
  }, [showToast]);

  // Display success message for a limited time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Sort, filter and paginate users
  const processedUsers = useMemo(() => {
    // First filter the users
    let result = users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || user.status === statusFilter;
      const matchesRole = roleFilter === '' || user.role === roleFilter;
      const matchesSubscription = subscriptionFilter === '' || 
        (user.subscription && user.subscription === subscriptionFilter);
      
      return matchesSearch && matchesStatus && matchesRole && matchesSubscription;
    });
    
    // Then sort them
    result = [...result].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // Handle string comparisons
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortDirection === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }
      
      // Handle date comparisons
      if (sortField === 'signupDate' || sortField === 'lastLogin') {
        const dateA = new Date(valueA as string).getTime();
        const dateB = new Date(valueB as string).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Default comparison
      if (sortDirection === 'asc') {
        // Handle undefined cases
        if (valueA === undefined && valueB === undefined) return 0;
        if (valueA === undefined) return -1;
        if (valueB === undefined) return 1;
        return valueA > valueB ? 1 : -1;
      } else {
        // Handle undefined cases
        if (valueA === undefined && valueB === undefined) return 0;
        if (valueA === undefined) return 1;
        if (valueB === undefined) return -1;
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return result;
  }, [users, searchTerm, statusFilter, roleFilter, subscriptionFilter, sortField, sortDirection]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = processedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(processedUsers.length / usersPerPage);

  // Format date to Brazilian standard
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
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
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === actionUser.id 
            ? { ...user, status: modalAction === 'activate' ? 'active' : 'inactive' }
            : user
        )
      );
      
      setShowConfirmModal(false);
      showToast(`Usuário ${actionUser.name} foi ${modalAction === 'activate' ? 'ativado' : 'desativado'} com sucesso!`);
      setIsProcessing(false);
      setActionUser(null);
    } catch (error) {
      console.error(`Error ${modalAction}ing user:`, error);
      showToast(`Erro ao ${modalAction === 'activate' ? 'ativar' : 'desativar'} usuário. Tente novamente.`);
      setIsProcessing(false);
    }
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditUser = (user: User) => {
    setActionUser(user);
    setShowEditModal(true);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  // Get unique subscription types for filter
  const subscriptionTypes = useMemo(() => {
    return Array.from(new Set(users.filter(user => user.subscription).map(user => user.subscription as string)));
  }, [users]);

  return (
    <div className={styles.contentContainer}>
      {successMessage && (
        <div className={styles.successAlert}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {successMessage}
        </div>
      )}
      
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Gerenciar Usuários</h1>
        <p className={styles.pageDescription}>
          Administre usuários, suas permissões e status na plataforma
        </p>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Buscar usuário..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterContainer}>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          
          <select 
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todas as funções</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuários</option>
          </select>
          
          {subscriptionTypes.length > 0 && (
            <select 
              className={styles.filterSelect}
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
            >
              <option value="">Todos os planos</option>
              {subscriptionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
          
          <button 
            className={styles.addButton}
            onClick={handleAddUser}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Adicionar Usuário
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingCell}>Carregando usuários...</div>
        ) : processedUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Nenhum usuário encontrado</h3>
            <p>Tente ajustar seus filtros ou adicionar um novo usuário.</p>
          </div>
        ) : (
          <table className={styles.usersTable}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.tableCell} onClick={() => handleSort('name')}>
                  <div className={styles.sortableHeader}>
                    Usuário
                    {sortField === 'name' && (
                      <span className={styles.sortIcon}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className={styles.tableCell} onClick={() => handleSort('email')}>
                  <div className={styles.sortableHeader}>
                    Email
                    {sortField === 'email' && (
                      <span className={styles.sortIcon}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className={styles.tableCell} onClick={() => handleSort('role')}>
                  <div className={styles.sortableHeader}>
                    Função
                    {sortField === 'role' && (
                      <span className={styles.sortIcon}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className={styles.tableCell} onClick={() => handleSort('status')}>
                  <div className={styles.sortableHeader}>
                    Status
                    {sortField === 'status' && (
                      <span className={styles.sortIcon}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className={styles.tableCell} onClick={() => handleSort('lastLogin')}>
                  <div className={styles.sortableHeader}>
                    Último Acesso
                    {sortField === 'lastLogin' && (
                      <span className={styles.sortIcon}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className={styles.tableCell}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className={styles.userRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar} style={{
                        backgroundColor: user.status === 'active'
                          ? 'var(--primary)'
                          : 'var(--text-tertiary)'
                      }}>
                        {user.initials}
                      </div>
                      <div>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userDate}>Desde {formatDate(user.signupDate)}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.userEmail}>{user.email}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={user.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                      {user.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    {user.lastLogin ? formatDate(user.lastLogin) : '-'}
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditUser(user)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Editar
                      </button>
                      {user.status === 'active' ? (
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleStatusAction(user, 'deactivate')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Desativar
                        </button>
                      ) : (
                        <button 
                          className={styles.activateButton}
                          onClick={() => handleStatusAction(user, 'activate')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Ativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Anterior
          </button>
          <div className={styles.paginationNumbers}>
            {[...Array(totalPages)].map((_, index) => (
              <button 
                key={index + 1}
                className={`${styles.paginationNumber} ${currentPage === index + 1 ? styles.active : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button 
            className={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Próximo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {modalAction === 'activate' ? 'Ativar usuário' : 'Desativar usuário'}
            </h2>
            <p>
              Deseja realmente {modalAction === 'activate' ? 'ativar' : 'desativar'} o usuário <strong>{actionUser?.name}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button 
                className={modalAction === 'activate' ? styles.confirmButton : styles.confirmDeleteButton}
                onClick={handleConfirmAction}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.smallSpinner}></span>
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

      {/* Add User Modal - Basic implementation */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Adicionar Novo Usuário</h2>
            <form className={styles.userForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>Nome</label>
                <input 
                  id="name"
                  type="text" 
                  className={styles.formInput}
                  placeholder="Nome completo"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input 
                  id="email"
                  type="email" 
                  className={styles.formInput}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="role" className={styles.formLabel}>Função</label>
                  <select 
                    id="role"
                    className={styles.formSelect}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subscription" className={styles.formLabel}>Plano</label>
                  <select 
                    id="subscription"
                    className={styles.formSelect}
                  >
                    <option value="">Sem plano</option>
                    {subscriptionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className={styles.saveButton}
                >
                  Adicionar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal - Basic implementation */}
      {showEditModal && actionUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Editar Usuário</h2>
            <form className={styles.userForm}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-name" className={styles.formLabel}>Nome</label>
                <input 
                  id="edit-name"
                  type="text" 
                  className={styles.formInput}
                  defaultValue={actionUser.name}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-email" className={styles.formLabel}>Email</label>
                <input 
                  id="edit-email"
                  type="email" 
                  className={styles.formInput}
                  defaultValue={actionUser.email}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-role" className={styles.formLabel}>Função</label>
                  <select 
                    id="edit-role"
                    className={styles.formSelect}
                    defaultValue={actionUser.role}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit-subscription" className={styles.formLabel}>Plano</label>
                  <select 
                    id="edit-subscription"
                    className={styles.formSelect}
                    defaultValue={actionUser.subscription || ""}
                  >
                    <option value="">Sem plano</option>
                    {subscriptionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className={styles.saveButton}
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
