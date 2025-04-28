"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/types/user";
import { UsersService } from "@/services/UsersService";
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import styles from "./users.module.css";
import adminStyles from "../admin.module.css";
import { useToast } from "@/hooks/useToast";

// Função para gerar iniciais a partir do nome
const generateInitials = (name: string): string => {
  if (!name) return '??';
  
  const nameParts = name.split(' ').filter(part => part.length > 0);
  if (nameParts.length === 0) return '?';
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

export default function ManageUsers() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserCard, setShowUserCard] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate'>('deactivate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    newUsersThisMonth: 0
  });
  const { showToast } = useToast();
  // Buscar usuários quando o componente montar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await UsersService.getAllUsers();
        
        // Adicionar iniciais a cada usuário se não estiverem definidas
        const usersWithInitials = data.map(user => ({
          ...user,
          initials: user.initials || generateInitials(user.name)
        }));
        
        setUsers(usersWithInitials);
        
        // Buscar estatísticas de usuários
        const statsData = await UsersService.getUserStats();
        setStats(statsData);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showToast("Erro ao carregar usuários. Tente novamente mais tarde.", { type: "error" });
      } finally {
        setIsLoading(false);
        setLoaded(true);
      }
    };
    
    fetchUsers();
  }, [showToast]);

  // Fechar mensagem de sucesso após alguns segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Aplicar filtros, ordenação e paginação aos usuários
  const processedUsers = useMemo(() => {
    // Primeiro aplicar a tab de filtro
    let result = users.filter(user => {
      if (activeTab === 'active') return user.status === 'active';
      if (activeTab === 'inactive') return user.status === 'inactive';
      return true; // 'all'
    });
    
    // Depois aplicar os filtros da barra de pesquisa
    result = result.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || user.status === statusFilter;
      const matchesRole = roleFilter === '' || user.role === roleFilter;
      const matchesSubscription = subscriptionFilter === '' || 
        (user.subscription && user.subscription === subscriptionFilter);
      
      return matchesSearch && matchesStatus && matchesRole && matchesSubscription;
    });
    
    // Ordenar os resultados
    result = [...result].sort((a, b) => {
      let valueA: string | number = a[sortField] ?? '';
      let valueB: string | number = b[sortField] ?? '';
      
      // Tratamento especial para datas
      if (sortField === 'signupDate' || sortField === 'lastLogin') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      if (sortDirection === 'asc') {
        // Tratar valores indefinidos
        if (valueA === undefined && valueB === undefined) return 0;
        if (valueA === undefined) return 1;
        if (valueB === undefined) return -1;
        return valueA > valueB ? 1 : -1;
      } else {
        // Tratar valores indefinidos
        if (valueA === undefined && valueB === undefined) return 0;
        if (valueA === undefined) return 1;
        if (valueB === undefined) return -1;
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return result;
  }, [users, searchTerm, statusFilter, roleFilter, subscriptionFilter, sortField, sortDirection, activeTab]);

  // Calcular dados para paginação
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = processedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(processedUsers.length / usersPerPage);

  // Formatar data para padrão brasileiro
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Abrir o card de visualização rápida do usuário
  const handleViewUser = (user: User): void => {
    setSelectedUser(user);
    setShowUserCard(true);
  };

  // Abrir modal para editar o papel do usuário
  const handleEditRole = (user: User, e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  // Atualizar o papel do usuário
  const handleUpdateRole = async (): Promise<void> => {
    if (!selectedUser) return;
    
    try {
      setIsProcessing(true);
      
      const updatedUser = await UsersService.updateUserRole(selectedUser.id, newRole);
      
      // Atualizar o usuário na lista
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: updatedUser.role }
            : user
        )
      );
      
      setSuccessMessage(`Papel do usuário ${selectedUser.name} foi alterado para ${newRole === 'admin' ? 'Administrador' : 'Usuário'}`);
      showToast(`Papel do usuário foi alterado com sucesso!`, { type: "success" });
      setShowRoleModal(false);
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      showToast("Erro ao atualizar papel do usuário. Tente novamente.", { type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal para confirmar ativação/desativação
  const handleStatusAction = (user: User, action: 'activate' | 'deactivate', e: React.MouseEvent): void => {
    e.stopPropagation();
    setSelectedUser(user);
    setModalAction(action);
    setShowConfirmModal(true);
  };

  // Confirmar ação de ativação/desativação
  const handleConfirmAction = async (): Promise<void> => {
    if (!selectedUser) return;
    
    try {
      setIsProcessing(true);
      
      const newStatus = modalAction === 'activate' ? 'active' : 'inactive';
      const updatedUser = await UsersService.updateUserStatus(selectedUser.id, newStatus);
      
      // Atualizar o usuário na lista
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, status: updatedUser.status }
            : user
        )
      );
      
      setSuccessMessage(`Usuário ${selectedUser.name} foi ${modalAction === 'activate' ? 'ativado' : 'desativado'} com sucesso!`);
      showToast(`Usuário foi ${modalAction === 'activate' ? 'ativado' : 'desativado'} com sucesso!`, { type: "success" });
      setShowConfirmModal(false);
    } catch (error) {
      console.error(`Erro ao ${modalAction} usuário:`, error);
      showToast(`Erro ao ${modalAction === 'activate' ? 'ativar' : 'desativar'} usuário. Tente novamente.`, { type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Ordenar usuários ao clicar no cabeçalho da coluna
  const handleSort = (field: keyof User): void => {
    if (sortField === field) {
      // Alternar direção se já estamos ordenando por este campo
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Definir novo campo e padrão para ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Obter tipos de assinatura únicos para o filtro
  const subscriptionTypes = useMemo(() => {
    return Array.from(new Set(users.filter(user => user.subscription).map(user => user.subscription as string)));
  }, [users]);

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""} ${styles.usersPage}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Gerenciar Usuários</h1>
            <p className={styles.pageDescription}>
              Administre usuários, suas permissões e status na plataforma.
            </p>
          </div>

          {/* Exibir mensagem de sucesso se houver */}
          {successMessage && (
            <div className={styles.successAlert}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {successMessage}
            </div>
          )}          
          
          {/* Cards de estatísticas */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.statLabel}>Total de Usuários</div>
              <div className={styles.statValue}>{stats.totalUsers}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 8L20 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 11L17 11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.statLabel}>Usuários Ativos</div>
              <div className={styles.statValue}>{stats.activeUsers}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.statLabel}>Administradores</div>
              <div className={styles.statValue}>{stats.admins}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.05078 11.0002C3.27422 8.18963 4.5448 5.56138 6.60471 3.67642C8.66463 1.79146 11.3521 0.787323 14.1793 0.867003C16.9774 0.945874 19.587 2.09481 21.4919 4.07322C23.3968 6.05163 24.4489 8.70038 24.4999 11.5002C24.55 14.2812 23.5987 16.982 21.807 19.0566C20.0154 21.1311 17.5127 22.4421 14.7578 22.7541C11.9845 23.0697 9.19687 22.3612 6.9149 20.7584C4.63292 19.1556 3.04677 16.7837 2.48982 14.0939M1.5 6.00024L3.06 11.0102L8.07 9.45024" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.statLabel}>Novos este mês</div>
              <div className={styles.statValue}>{stats.newUsersThisMonth}</div>
            </div>
          </div>

          {/* Tabs de filtro */}
          <div className={styles.tabs}>
            <div 
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Todos
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'active' ? styles.active : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Ativos
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'inactive' ? styles.active : ''}`}
              onClick={() => setActiveTab('inactive')}
            >
              Inativos
            </div>
          </div>

          {/* Barra de pesquisa e filtros */}
          <div className={styles.searchAndFilterBar}>
            <div className={styles.searchContainer}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar usuário por nome ou email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterContainer}>
              <select 
                className={styles.filterSelect}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filtrar por função"
              >
                <option value="">Função: Todas</option>
                <option value="admin">Função: Administradores</option>
                <option value="user">Função: Usuários</option>
              </select>
              
              {subscriptionTypes.length > 0 && (
                <select 
                  className={styles.filterSelect}
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  aria-label="Filtrar por plano"
                >
                  <option value="">Plano: Todos</option>
                  {subscriptionTypes.map(type => (
                    <option key={type} value={type}>Plano: {type}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Tabela de usuários */}
          <div className={styles.tableContainer}>
            {isLoading ? (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingSpinner}></div>
                <span>Carregando usuários...</span>
              </div>
            ) : processedUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                </svg>
                <h3>Nenhum usuário encontrado</h3>
                <p>Tente ajustar os filtros ou adicionar novos usuários ao sistema.</p>
              </div>
            ) : (
              <table className={styles.usersTable}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableCell}>
                      <div 
                        className={styles.sortableHeader} 
                        onClick={() => handleSort('name')}
                      >
                        Usuário
                        {sortField === 'name' && (
                          <span className={styles.sortIcon}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className={styles.tableCell}>
                      <div 
                        className={styles.sortableHeader} 
                        onClick={() => handleSort('email')}
                      >
                        Email
                        {sortField === 'email' && (
                          <span className={styles.sortIcon}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className={styles.tableCell}>
                      <div 
                        className={styles.sortableHeader} 
                        onClick={() => handleSort('role')}
                      >
                        Função
                        {sortField === 'role' && (
                          <span className={styles.sortIcon}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className={styles.tableCell}>
                      <div 
                        className={styles.sortableHeader} 
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortField === 'status' && (
                          <span className={styles.sortIcon}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className={styles.tableCell}>
                      <div 
                        className={styles.sortableHeader} 
                        onClick={() => handleSort('signupDate')}
                      >
                        Data de Cadastro
                        {sortField === 'signupDate' && (
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
                    <tr 
                      key={user.id} 
                      className={styles.userRow}
                      onClick={() => handleViewUser(user)}
                    >
                      <td className={styles.tableCell}>
                        <div className={styles.userInfo}>
                          <div 
                            className={styles.userAvatar}
                            style={{ backgroundColor: `var(--${user.role === 'admin' ? 'primary' : 'text-secondary'})` }}
                          >
                            {user.initials || generateInitials(user.name)}
                          </div>
                          <div>
                            <div className={styles.userName}>{user.name}</div>
                            <div className={styles.idBadge}>ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.userEmail}>{user.email}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={user.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          <div className={styles.dateValue}>{formatDate(user.signupDate)}</div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.editButton}
                            onClick={(e) => handleEditRole(user, e)}
                            title="Editar função"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 15H12L20.5 6.5C21.3284 5.67157 21.3284 4.32843 20.5 3.5C19.6716 2.67157 18.3284 2.67157 17.5 3.5L9 12V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 5L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {user.status === 'active' ? (
                            <button 
                              className={styles.deleteButton}
                              onClick={(e) => handleStatusAction(user, 'deactivate', e)}
                              title="Desativar usuário"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          ) : (
                            <button 
                              className={styles.activateButton}
                              onClick={(e) => handleStatusAction(user, 'activate', e)}
                              title="Ativar usuário"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
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
          
          {/* Paginação */}
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
                {totalPages <= 7 ? (
                  // Se tiver 7 páginas ou menos, mostra todas
                  [...Array(totalPages)].map((_, index) => (
                    <button 
                      key={index + 1}
                      className={`${styles.paginationNumber} ${currentPage === index + 1 ? styles.active : ''}`}
                      onClick={() => setCurrentPage(index + 1)}
                      aria-label={`Página ${index + 1}`}
                      aria-current={currentPage === index + 1 ? 'page' : undefined}
                    >
                      {index + 1}
                    </button>
                  ))
                ) : (
                  // Se tiver mais de 7 páginas, faz o tratamento especial
                  <>
                    {/* Primeira página sempre aparece */}
                    <button 
                      className={`${styles.paginationNumber} ${currentPage === 1 ? styles.active : ''}`}
                      onClick={() => setCurrentPage(1)}
                      aria-label="Página 1"
                      aria-current={currentPage === 1 ? 'page' : undefined}
                    >
                      1
                    </button>
                    
                    {/* Elipses antes de pág. atual (se estiver distante do início) */}
                    {currentPage > 3 && <span className={styles.paginationEllipsis}>...</span>}
                    
                    {/* Páginas ao redor da página atual */}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Mostrar 2 páginas antes e 2 depois da atual, se possível
                      if (
                        (pageNumber > 1 && pageNumber < totalPages) && // não é a primeira nem a última
                        (
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) || // está próxima da atual
                          (currentPage <= 3 && pageNumber <= 4) || // está no início
                          (currentPage >= totalPages - 2 && pageNumber >= totalPages - 3) // está no fim
                        )
                      ) {
                        return (
                          <button 
                            key={pageNumber}
                            className={`${styles.paginationNumber} ${currentPage === pageNumber ? styles.active : ''}`}
                            onClick={() => setCurrentPage(pageNumber)}
                            aria-label={`Página ${pageNumber}`}
                            aria-current={currentPage === pageNumber ? 'page' : undefined}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Elipses depois da pág. atual (se estiver distante do fim) */}
                    {currentPage < totalPages - 2 && <span className={styles.paginationEllipsis}>...</span>}
                    
                    {/* Última página sempre aparece */}
                    <button 
                      className={`${styles.paginationNumber} ${currentPage === totalPages ? styles.active : ''}`}
                      onClick={() => setCurrentPage(totalPages)}
                      aria-label={`Página ${totalPages}`}
                      aria-current={currentPage === totalPages ? 'page' : undefined}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
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
          )}          {/* Modal para editar papel do usuário */}
          {showRoleModal && selectedUser && (
            <div className="modalOverlay" onClick={() => !isProcessing && setShowRoleModal(false)}>
              <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 'var(--spacing-xs)' }}>
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Alterar Função do Usuário
                </h2>
                <p className={styles.modalSubtitle}>
                  Selecione a nova função para <strong>{selectedUser.name}</strong>
                </p>
                
                <div className={styles.formGroup}>
                  <label htmlFor="role-select" className={styles.formLabel}>Função</label>
                  <div className={styles.roleSelectContainer}>
                    <select 
                      id="role-select"
                      className={styles.formSelect}
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <div className={styles.formDescription}>
                    {newRole === 'admin' ? (
                      <div className={styles.roleDescription}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15.5H7.5C6.10444 15.5 5.40665 15.5 4.83886 15.6722C3.56045 16.06 2.56004 17.0605 2.17224 18.3389C2 18.9067 2 19.6044 2 21M19 21V15M16 18H22M14.5 7.5C14.5 9.98528 12.4853 12 10 12C7.51472 12 5.5 9.98528 5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>
                          Administradores têm acesso a todas as funcionalidades de gerenciamento do sistema, incluindo:
                          <ul>
                            <li>Gerenciamento de componentes</li>
                            <li>Gerenciamento de usuários</li>
                            <li>Acesso a estatísticas</li>
                            <li>Configurações avançadas</li>
                          </ul>
                        </p>
                      </div>
                    ) : (
                      <div className={styles.roleDescription}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>
                          Usuários comuns têm acesso apenas às funcionalidades básicas, como:
                          <ul>
                            <li>Visualização de componentes</li>
                            <li>Gerenciamento da própria conta</li>
                            <li>Favoritos e coleções pessoais</li>
                          </ul>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => setShowRoleModal(false)}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </button>
                  <button 
                    className={styles.saveButton}
                    onClick={handleUpdateRole}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className={styles.loadingSpinner}></span>
                        Processando...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}          {/* Modal para confirmar ativação/desativação */}
          {showConfirmModal && selectedUser && (
            <div className="modalOverlay" onClick={() => !isProcessing && setShowConfirmModal(false)}>
              <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>
                  {modalAction === 'activate' ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 'var(--spacing-xs)', color: '#10B981' }}>
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ativar usuário
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 'var(--spacing-xs)', color: 'var(--google-red)' }}>
                        <path d="M15 9L9 15M9 9L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Desativar usuário
                    </>
                  )}
                </h2>
                
                <div className={styles.confirmationContent}>
                  <div className={styles.userConfirmationCard}>
                    <div className={styles.userAvatar} style={{
                      backgroundColor: selectedUser.status === 'active'
                        ? 'var(--primary)'
                        : 'var(--text-tertiary)'
                    }}>
                      {selectedUser.initials}
                    </div>
                    <div>
                      <div className={styles.userName}>{selectedUser.name}</div>
                      <div className={styles.userEmail}>{selectedUser.email}</div>
                    </div>
                  </div>
                  
                  <p className={styles.confirmationMessage}>
                    Você deseja realmente {modalAction === 'activate' ? 'ativar' : 'desativar'} este usuário?
                  </p>
                  
                  {modalAction === 'deactivate' && (
                    <div className={styles.warningBox}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>
                        Um usuário desativado não poderá acessar o sistema até que seja ativado novamente.
                        Todas as suas permissões serão temporariamente suspensas.
                      </p>
                    </div>
                  )}
                </div>
                
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
                        <span className={styles.loadingSpinner}></span>
                        Processando...
                      </>
                    ) : (
                      <>
                        {modalAction === 'activate' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {modalAction === 'activate' ? 'Sim, Ativar' : 'Sim, Desativar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}          {/* Card de visualização rápida do usuário */}
          {showUserCard && selectedUser && (
            <div className="modalOverlay" onClick={() => setShowUserCard(false)}>
              <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <div className={styles.userCardContainer}>
                  <div className={styles.userCardHeader}>
                    <div className={styles.userCardAvatar} style={{
                      backgroundColor: selectedUser.status === 'active'
                        ? 'var(--primary)'
                        : 'var(--text-tertiary)'
                    }}>
                      {selectedUser.initials}
                    </div>
                    <div className={styles.userCardInfo}>
                      <h3 className={styles.userCardName}>{selectedUser.name}</h3>
                      <div className={styles.userCardEmail}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {selectedUser.email}
                      </div>
                      <div className={styles.badgeContainer}>
                        <span className={selectedUser.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {selectedUser.role === 'admin' ? (
                              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M21 12L15 18L12 15M14 7C14 9.20914 12.2091 11 10 11C7.79086 11 5.5 9.20914 5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            ) : (
                              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            )}
                          </svg>
                          {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                        <span className={selectedUser.status === 'active' ? styles.statusActive : styles.statusInactive}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {selectedUser.status === 'active' ? (
                              <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            ) : (
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            )}
                          </svg>
                          {selectedUser.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        {selectedUser.subscription && (
                          <span className={styles.subscriptionBadge}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 18V20M12 18V22M8 18V20M2 8H22M5.5 3H18.5C19.8807 3 21 4.11929 21 5.5V18.5C21 19.8807 19.8807 21 18.5 21H5.5C4.11929 21 3 19.8807 3 18.5V5.5C3 4.11929 4.11929 3 5.5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {selectedUser.subscription}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.userCardDivider}></div>
                  
                  <div className={styles.userCardData}>
                    <div className={styles.userCardItem}>
                      <span className={styles.userCardLabel}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Data de Cadastro
                      </span>
                      <span className={styles.userCardValue}>{formatDate(selectedUser.signupDate)}</span>
                    </div>
                    <div className={styles.userCardItem}>
                      <span className={styles.userCardLabel}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V12L15 15M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Último Acesso
                      </span>
                      <span className={styles.userCardValue}>
                        {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : (
                          <span className={styles.neverAccessed}>Nunca acessou</span>
                        )}
                      </span>
                    </div>
                    <div className={styles.userCardItem}>
                      <span className={styles.userCardLabel}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 7C16.1046 7 17 6.10457 17 5C17 3.89543 16.1046 3 15 3C13.8954 3 13 3.89543 13 5C13 6.10457 13.8954 7 15 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12.6343 8.46448L9.5 12.7071L4.92893 17.2782L3.10052 15.4498C2.91913 15.2684 2.91913 14.9806 3.10052 14.7992L7.67159 10.2281C7.85298 10.0467 8.14081 10.0467 8.3222 10.2281L10.5 12.4059L13.2348 8.53546C13.4193 8.30371 13.7359 8.26229 13.9676 8.44684L15.4676 9.69684C15.6993 9.88138 15.7407 10.198 15.5562 10.4297L12.0685 15.0684C11.884 15.3002 11.5674 15.3416 11.3356 15.1571L8.3222 12.7071" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 15L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        ID do Usuário
                      </span>
                      <span className={styles.userCardValue}>
                        <code className={styles.idCode}>{selectedUser.id}</code>
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.userCardActions}>
                    <button 
                      className={styles.cancelButton}
                      onClick={() => setShowUserCard(false)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Fechar
                    </button>
                    
                    <div className={styles.actionButtonsGroup}>
                      <button 
                        className={styles.editButton}
                        onClick={(e) => {
                          setShowUserCard(false);
                          handleEditRole(selectedUser, e as any);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Editar Função
                      </button>
                      
                      {selectedUser.status === 'active' ? (
                        <button 
                          className={styles.deleteButton}
                          onClick={(e) => {
                            setShowUserCard(false);
                            handleStatusAction(selectedUser, 'deactivate', e as any);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                                                 Desativar Usuário
                        </button>
                      ) : (
                        <button 
                          className={styles.activateButton}
                          onClick={(e) => {
                            setShowUserCard(false);
                            handleStatusAction(selectedUser, 'activate', e as any);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Ativar Usuário
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
