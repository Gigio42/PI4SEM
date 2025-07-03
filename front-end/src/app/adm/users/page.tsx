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
const generateInitials = (name: string | undefined): string => {
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
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserData, setEditingUserData] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin'
  });
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
        console.log('Iniciando carregamento de usuários...');
        
        const data = await UsersService.getAllUsers();
        console.log(`${data.length} usuários carregados:`, data);
        
        // Adicionar iniciais a cada usuário se não estiverem definidas
        const usersWithInitials = data.map(user => ({
          ...user,
          initials: user.initials || generateInitials(user.name)
        }));
        
        setUsers(usersWithInitials);
        
        // Buscar estatísticas de usuários
        console.log('Carregando estatísticas de usuários...');
        const statsData = await UsersService.getUserStats();
        console.log('Estatísticas carregadas:', statsData);
        setStats(statsData);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showToast("Erro ao carregar usuários. Tente novamente mais tarde.", { type: "error" });
        
        // Em caso de erro, define dados vazios
        setUsers([]);
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          admins: 0,
          newUsersThisMonth: 0
        });
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
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  // Função para gerar números de páginas visíveis
  const getVisiblePages = () => {
    const delta = 2; // Número de páginas antes e depois da atual
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Formatar data para padrão brasileiro
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Abrir o card de visualização rápida do usuário
  const handleViewUser = (user: User): void => {
    setSelectedUser(user);
    setEditingUserData({
      name: user.name || '',
      email: user.email,
      role: user.role
    });
    setIsEditingUser(false);
    setShowUserDetailsModal(true);
  };

  // Ativar modo de edição
  const handleEditUser = (): void => {
    setIsEditingUser(true);
  };

  // Cancelar edição
  const handleCancelEdit = (): void => {
    if (selectedUser) {
      setEditingUserData({
        name: selectedUser.name || '',
        email: selectedUser.email,
        role: selectedUser.role
      });
    }
    setIsEditingUser(false);
  };

  // Salvar alterações do usuário
  const handleSaveUserChanges = async (): Promise<void> => {
    if (!selectedUser) return;
    
    try {
      setIsProcessing(true);
      
      // Se o papel mudou, atualizar
      if (editingUserData.role !== selectedUser.role) {
        await UsersService.updateUserRole(selectedUser.id, editingUserData.role);
      }
      
      // Aqui você pode adicionar mais campos para atualizar
      // Por exemplo, nome, email, etc. quando houver endpoints para isso
      
      // Recarregar a lista de usuários para refletir as mudanças
      const updatedUsers = await UsersService.getAllUsers();
      const usersWithInitials = updatedUsers.map(user => ({
        ...user,
        initials: user.initials || generateInitials(user.name)
      }));
      setUsers(usersWithInitials);
      
      // Atualizar o usuário selecionado
      const updatedSelectedUser = usersWithInitials.find(u => u.id === selectedUser.id);
      if (updatedSelectedUser) {
        setSelectedUser(updatedSelectedUser);
        setEditingUserData({
          name: updatedSelectedUser.name || '',
          email: updatedSelectedUser.email,
          role: updatedSelectedUser.role
        });
      }
      
      setIsEditingUser(false);
      showToast("Usuário atualizado com sucesso!", { type: "success" });
      
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showToast("Erro ao atualizar usuário. Tente novamente.", { type: "error" });
    } finally {
      setIsProcessing(false);
    }
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
      console.log(`Atualizando papel do usuário ${selectedUser.id} para ${newRole}`);
      
      const updatedUser = await UsersService.updateUserRole(selectedUser.id, newRole);
      
      // Atualizar o usuário na lista
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        )
      );
      
      // Safely access name with fallback
      const userName = selectedUser.name || 'Usuário';
      setSuccessMessage(`Papel do usuário ${userName} foi alterado para ${newRole === 'admin' ? 'Administrador' : 'Usuário'}`);
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
      console.log(`${modalAction === 'activate' ? 'Ativando' : 'Desativando'} usuário ${selectedUser.id}`);
      
      const newStatus = modalAction === 'activate' ? 'active' : 'inactive';
      const updatedUser = await UsersService.updateUserStatus(selectedUser.id, newStatus);
      
      // Atualizar o usuário na lista
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        )
      );
      
      // Safely access name with fallback
      const userName = selectedUser.name || 'Usuário';
      setSuccessMessage(`Usuário ${userName} foi ${modalAction === 'activate' ? 'ativado' : 'desativado'} com sucesso!`);
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
                            <div className={styles.userName}>{user.name || 'Usuário'}</div>
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
                                        {processedUsers.length > 0 && totalPages > 1 && (
                                          <div className={styles.pagination}>
                                            <div className={styles.paginationInfo}>
                                              Mostrando {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, processedUsers.length)} de {processedUsers.length} usuários
                                            </div>
                                            <div className={styles.paginationControls}>
                                              {/* Botão Primeira Página */}
                                              <button 
                                                className={`${styles.paginationButton} ${styles.paginationNavButton}`}
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                title="Primeira página"
                                              >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M11 17L6 12L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                  <path d="M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                              </button>
                                              
                                              {/* Botão Anterior */}
                                              <button 
                                                className={`${styles.paginationButton} ${styles.paginationNavButton}`}
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                title="Página anterior"
                                              >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Anterior
                                              </button>
                                              
                                              {/* Números das páginas */}
                                              <div className={styles.paginationNumbers}>
                                                {getVisiblePages().map((page, index) => (
                                                  page === '...' ? (
                                                    <span key={`dots-${index}`} className={styles.paginationDots}>
                                                      ...
                                                    </span>
                                                  ) : (
                                                    <button
                                                      key={page}
                                                      className={`${styles.paginationButton} ${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                                                      onClick={() => setCurrentPage(page as number)}
                                                      disabled={currentPage === page}
                                                    >
                                                      {page}
                                                    </button>
                                                  )
                                                ))}
                                              </div>
                                              
                                              {/* Botão Próxima */}
                                              <button 
                                                className={`${styles.paginationButton} ${styles.paginationNavButton}`}
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                title="Próxima página"
                                              >
                                                Próxima
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                              </button>
                                              
                                              {/* Botão Última Página */}
                                              <button 
                                                className={`${styles.paginationButton} ${styles.paginationNavButton}`}
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                                title="Última página"
                                              >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M13 17L18 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                  <path d="M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        )}
                              
                                        {/* Modal de detalhes do usuário */}
                                        {showUserDetailsModal && selectedUser && (
                                          <div className={styles.modalOverlay} onClick={() => setShowUserDetailsModal(false)}>
                                            <div className={styles.userDetailsModal} onClick={(e) => e.stopPropagation()}>
                                              <div className={styles.modalHeader}>
                                                <div className={styles.modalHeaderContent}>
                                                  <div className={styles.userModalAvatar}>
                                                    {selectedUser.initials || generateInitials(selectedUser.name)}
                                                  </div>
                                                  <div className={styles.userModalInfo}>
                                                    <h2 className={styles.modalTitle}>
                                                      {isEditingUser ? 'Editar Usuário' : 'Detalhes do Usuário'}
                                                    </h2>
                                                    <p className={styles.modalSubtitle}>
                                                      ID: {selectedUser.id}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className={styles.modalHeaderActions}>
                                                  {!isEditingUser && (
                                                    <button 
                                                      className={styles.editIconButton}
                                                      onClick={handleEditUser}
                                                      title="Editar usuário"
                                                    >
                                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M9 15H12L20.5 6.5C21.3284 5.67157 21.3284 4.32843 20.5 3.5C19.6716 2.67157 18.3284 2.67157 17.5 3.5L9 12V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M16 5L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                      </svg>
                                                    </button>
                                                  )}
                                                  <button 
                                                    className={styles.closeButton}
                                                    onClick={() => setShowUserDetailsModal(false)}
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              </div>
                                              
                                              <div className={styles.modalBody}>
                                                <div className={styles.userDetailsGrid}>
                                                  {/* Nome */}
                                                  <div className={styles.fieldGroup}>
                                                    <label className={styles.fieldLabel}>Nome</label>
                                                    {isEditingUser ? (
                                                      <input
                                                        type="text"
                                                        className={styles.fieldInput}
                                                        value={editingUserData.name}
                                                        onChange={(e) => setEditingUserData({
                                                          ...editingUserData,
                                                          name: e.target.value
                                                        })}
                                                        placeholder="Nome do usuário"
                                                      />
                                                    ) : (
                                                      <div className={styles.fieldValue}>
                                                        {selectedUser.name || 'Não informado'}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Email */}
                                                  <div className={styles.fieldGroup}>
                                                    <label className={styles.fieldLabel}>Email</label>
                                                    {isEditingUser ? (
                                                      <input
                                                        type="email"
                                                        className={styles.fieldInput}
                                                        value={editingUserData.email}
                                                        onChange={(e) => setEditingUserData({
                                                          ...editingUserData,
                                                          email: e.target.value
                                                        })}
                                                        placeholder="email@exemplo.com"
                                                      />
                                                    ) : (
                                                      <div className={styles.fieldValue}>
                                                        {selectedUser.email}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Função */}
                                                  <div className={styles.fieldGroup}>
                                                    <label className={styles.fieldLabel}>Função</label>
                                                    {isEditingUser ? (
                                                      <select
                                                        className={styles.fieldSelect}
                                                        value={editingUserData.role}
                                                        onChange={(e) => setEditingUserData({
                                                          ...editingUserData,
                                                          role: e.target.value as 'user' | 'admin'
                                                        })}
                                                      >
                                                        <option value="user">Usuário</option>
                                                        <option value="admin">Administrador</option>
                                                      </select>
                                                    ) : (
                                                      <div className={styles.fieldValue}>
                                                        <span className={selectedUser.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                                                          {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Status */}
                                                  <div className={styles.fieldGroup}>
                                                    <label className={styles.fieldLabel}>Status</label>
                                                    <div className={styles.fieldValue}>
                                                      <span className={selectedUser.status === 'active' ? styles.statusActive : styles.statusInactive}>
                                                        {selectedUser.status === 'active' ? 'Ativo' : 'Inativo'}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {/* Data de Cadastro */}
                                                  <div className={styles.fieldGroup}>
                                                    <label className={styles.fieldLabel}>Data de Cadastro</label>
                                                    <div className={styles.fieldValue}>
                                                      {formatDate(selectedUser.signupDate)}
                                                    </div>
                                                  </div>

                                                  {/* Último Login */}
                                                  {selectedUser.lastLogin && (
                                                    <div className={styles.fieldGroup}>
                                                      <label className={styles.fieldLabel}>Último Login</label>
                                                      <div className={styles.fieldValue}>
                                                        {formatDate(selectedUser.lastLogin)}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Ações de Status */}
                                                {!isEditingUser && (
                                                  <div className={styles.statusActions}>
                                                    <h3 className={styles.sectionTitle}>Ações</h3>
                                                    <div className={styles.actionButtonsGrid}>
                                                      {selectedUser.status === 'active' ? (
                                                        <button
                                                          className={styles.deactivateUserButton}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowUserDetailsModal(false);
                                                            handleStatusAction(selectedUser, 'deactivate', e);
                                                          }}
                                                        >
                                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                          </svg>
                                                          Desativar Usuário
                                                        </button>
                                                      ) : (
                                                        <button
                                                          className={styles.activateUserButton}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowUserDetailsModal(false);
                                                            handleStatusAction(selectedUser, 'activate', e);
                                                          }}
                                                        >
                                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                          </svg>
                                                          Ativar Usuário
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className={styles.modalFooter}>
                                                {isEditingUser ? (
                                                  <>
                                                    <button 
                                                      className={styles.cancelButton}
                                                      onClick={handleCancelEdit}
                                                      disabled={isProcessing}
                                                    >
                                                      Cancelar
                                                    </button>
                                                    <button 
                                                      className={styles.saveButton}
                                                      onClick={handleSaveUserChanges}
                                                      disabled={isProcessing}
                                                    >
                                                      {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
                                                    </button>
                                                  </>
                                                ) : (
                                                  <button 
                                                    className={styles.primaryButton}
                                                    onClick={handleEditUser}
                                                  >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <path d="M11 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                      <path d="M9 15H12L20.5 6.5C21.3284 5.67157 21.3284 4.32843 20.5 3.5C19.6716 2.67157 18.3284 2.67157 17.5 3.5L9 12V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                      <path d="M16 5L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    Editar Usuário
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Modal de visualização rápida do usuário - manter para compatibilidade */}
                                        {showUserCard && selectedUser && (
                                          <div className={styles.modalOverlay} onClick={() => setShowUserCard(false)}>
                                            <div className={styles.userCard} onClick={(e) => e.stopPropagation()}>
                                              <div className={styles.cardHeader}>
                                                <div className={styles.userCardAvatar}>
                                                  {selectedUser.initials || generateInitials(selectedUser.name)}
                                                </div>
                                                <div className={styles.userCardInfo}>
                                                  <h3 className={styles.userCardName}>{selectedUser.name || 'Usuário'}</h3>
                                                  <p className={styles.userCardEmail}>{selectedUser.email}</p>
                                                </div>
                                                <button 
                                                  className={styles.closeButton}
                                                  onClick={() => setShowUserCard(false)}
                                                >
                                                  ×
                                                </button>
                                              </div>
                                              <div className={styles.cardBody}>
                                                <div className={styles.cardField}>
                                                  <label>Função:</label>
                                                  <span className={selectedUser.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                                                    {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                                                  </span>
                                                </div>
                                                <div className={styles.cardField}>
                                                  <label>Status:</label>
                                                  <span className={selectedUser.status === 'active' ? styles.statusActive : styles.statusInactive}>
                                                    {selectedUser.status === 'active' ? 'Ativo' : 'Inativo'}
                                                  </span>
                                                </div>
                                                <div className={styles.cardField}>
                                                  <label>Data de Cadastro:</label>
                                                  <span>{formatDate(selectedUser.signupDate)}</span>
                                                </div>
                                                {selectedUser.lastLogin && (
                                                  <div className={styles.cardField}>
                                                    <label>Último Login:</label>
                                                    <span>{formatDate(selectedUser.lastLogin)}</span>
                                                  </div>
                                                )}
                                                {selectedUser.subscription && (
                                                  <div className={styles.cardField}>
                                                    <label>Plano:</label>
                                                    <span>{selectedUser.subscription}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                              
                                        {/* Modal de edição de função */}
                                        {showRoleModal && selectedUser && (
                                          <div className={styles.modalOverlay} onClick={() => setShowRoleModal(false)}>
                                            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                              <div className={styles.modalHeader}>
                                                <h3>Editar Função</h3>
                                                <button 
                                                  className={styles.closeButton}
                                                  onClick={() => setShowRoleModal(false)}
                                                >
                                                  ×
                                                </button>
                                              </div>
                                              <div className={styles.modalBody}>
                                                <p>Alterar a função do usuário <strong>{selectedUser.name || 'Usuário'}</strong>:</p>
                                                <div className={styles.roleOptions}>
                                                  <label className={styles.radioOption}>
                                                    <input 
                                                      type="radio" 
                                                      value="user" 
                                                      checked={newRole === 'user'}
                                                      onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                                                    />
                                                    <span>Usuário</span>
                                                  </label>
                                                  <label className={styles.radioOption}>
                                                    <input 
                                                      type="radio" 
                                                      value="admin" 
                                                      checked={newRole === 'admin'}
                                                      onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                                                    />
                                                    <span>Administrador</span>
                                                  </label>
                                                </div>
                                              </div>
                                              <div className={styles.modalFooter}>
                                                <button 
                                                  className={styles.cancelButton}
                                                  onClick={() => setShowRoleModal(false)}
                                                >
                                                  Cancelar
                                                </button>
                                                <button 
                                                  className={styles.confirmButton}
                                                  onClick={handleUpdateRole}
                                                  disabled={isProcessing}
                                                >
                                                  {isProcessing ? 'Processando...' : 'Salvar'}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                              
                                        {/* Modal de confirmação */}
                                        {showConfirmModal && selectedUser && (
                                          <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
                                            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                              <div className={styles.modalHeader}>
                                                <h3>{modalAction === 'activate' ? 'Ativar' : 'Desativar'} Usuário</h3>
                                                <button 
                                                  className={styles.closeButton}
                                                  onClick={() => setShowConfirmModal(false)}
                                                >
                                                  ×
                                                </button>
                                              </div>
                                              <div className={styles.modalBody}>
                                                <p>
                                                  Tem certeza que deseja {modalAction === 'activate' ? 'ativar' : 'desativar'} o usuário <strong>{selectedUser.name || 'Usuário'}</strong>?
                                                </p>
                                              </div>
                                              <div className={styles.modalFooter}>
                                                <button 
                                                  className={styles.cancelButton}
                                                  onClick={() => setShowConfirmModal(false)}
                                                >
                                                  Cancelar
                                                </button>
                                                <button 
                                                  className={`${styles.confirmButton} ${modalAction === 'deactivate' ? styles.danger : ''}`}
                                                  onClick={handleConfirmAction}
                                                  disabled={isProcessing}
                                                >
                                                  {isProcessing ? 'Processando...' : (modalAction === 'activate' ? 'Ativar' : 'Desativar')}
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
