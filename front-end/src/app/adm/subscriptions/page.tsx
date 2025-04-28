"use client";

import { useState, useEffect } from 'react';
import { subscriptionsService, SubscriptionType, PlanType, PaymentType } from '@/services/SubscriptionsService';
import styles from './subscriptions.module.css';
import { useToast } from '@/hooks/useToast';
import { apiBaseUrl } from '@/services/config';

// Types for filter and pagination
interface FilterOptions {
  status?: string; // Agora é string: 'ACTIVE', 'CANCELLED', etc.
  searchTerm?: string;
}

export default function AdminSubscriptionsPage() {
  // Data states
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionType | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentType[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans' | 'history'>('subscriptions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
  // Sort states
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter and pagination states
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showToast } = useToast();

  // Function to fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching subscription data with filters:', filters);
      
      try {
        // Primeiro, teste a conexão com o backend
        const response = await fetch(`${apiBaseUrl}/subscriptions/plans?onlyActive=false`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log('API connection test response status:', response.status);
        
        if (!response.ok) {
          console.error('API connection test failed with status:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      } catch (connectionError) {
        console.error('API connection test error:', connectionError);
      }
      
      // Fetch subscriptions and plans in parallel
      const [fetchedSubscriptions, fetchedPlans] = await Promise.all([
        subscriptionsService.getAllSubscriptions(filters.status),
        subscriptionsService.getPlans(false) // Get all plans including inactive ones
      ]);
      
      console.log('Fetched plans (count):', fetchedPlans?.length || 0);
      console.log('Fetched plans data:', JSON.stringify(fetchedPlans, null, 2));
      console.log('Fetched subscriptions (count):', fetchedSubscriptions?.length || 0);
      console.log('Fetched subscriptions data:', JSON.stringify(fetchedSubscriptions, null, 2));
      
      setSubscriptions(fetchedSubscriptions);
      setPlans(fetchedPlans);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast("Erro ao carregar dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch payment history for a specific subscription
  const fetchPaymentHistory = async (subscriptionId: number) => {
    try {
      const history = await subscriptionsService.getPaymentsBySubscription(subscriptionId);
      setPaymentHistory(history);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      showToast("Erro ao carregar histórico de pagamentos.");
    }
  };

  // Function to handle subscription selection and load its payment history
  const handleSelectSubscription = async (subscription: SubscriptionType) => {
    setSelectedSubscription(subscription);
    
    if (activeTab === 'history') {
      await fetchPaymentHistory(subscription.id);
    }
  };

  // Function to add a new subscription
  const handleAddSubscription = async (data: any) => {
    try {
      setLoading(true);
      
      const newSubscription = await subscriptionsService.createSubscription(data);
      
      // Refresh the subscriptions list
      await fetchData();
      
      // Close the modal
      setIsAddModalOpen(false);
      showToast("Assinatura criada com sucesso!");
    } catch (error) {
      console.error('Error adding subscription:', error);
      showToast("Erro ao criar assinatura. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Function to edit an existing subscription
  const handleEditSubscription = async (data: any) => {
    if (!selectedSubscription) return;
    
    try {
      setLoading(true);
      
      // This would depend on what fields are editable in your API
      await subscriptionsService.renewSubscription(
        selectedSubscription.id,
        data.duration
      );
      
      // Refresh the subscriptions list
      await fetchData();
      
      // Close the modal
      setIsEditModalOpen(false);
      showToast("Assinatura atualizada com sucesso!");
    } catch (error) {
      console.error('Error editing subscription:', error);
      showToast("Erro ao atualizar assinatura. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel a subscription
  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;
    
    try {
      setLoading(true);
      
      await subscriptionsService.cancelSubscription(selectedSubscription.id);
      
      // Refresh the subscriptions list
      await fetchData();
      
      // Close the modal
      setIsCancelModalOpen(false);
      showToast("Assinatura cancelada com sucesso!");
    } catch (error) {
      console.error('Error canceling subscription:', error);
      showToast("Erro ao cancelar assinatura. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle plan operations
  const handleAddPlan = async (data: Omit<PlanType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      
      await subscriptionsService.createPlan(data);
      
      // Refresh plans list
      await fetchData();
      
      // Close the modal
      setIsPlanModalOpen(false);
      showToast("Plano criado com sucesso!");
    } catch (error) {
      console.error('Error adding plan:', error);
      showToast("Erro ao criar plano. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = async (data: Partial<PlanType>) => {
    if (!selectedPlan) return;
    
    try {
      setLoading(true);
      
      await subscriptionsService.updatePlan(selectedPlan.id, data);
      
      // Refresh plans list
      await fetchData();
      
      // Close the modal
      setIsPlanModalOpen(false);
      setSelectedPlan(null);
      showToast("Plano atualizado com sucesso!");
    } catch (error) {
      console.error('Error updating plan:', error);
      showToast("Erro ao atualizar plano. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlanStatus = async (planId: number) => {
    try {
      setLoading(true);
      
      await subscriptionsService.togglePlanStatus(planId);
      
      // Refresh plans list
      await fetchData();
      showToast("Status do plano alterado com sucesso!");
    } catch (error) {
      console.error('Error toggling plan status:', error);
      showToast("Erro ao alterar status do plano. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle search term change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Function to apply filters
  const applyFilters = () => {
    const newFilters: FilterOptions = {};
    
    // Only set status filter if it's defined
    if (filters.status !== undefined) {
      newFilters.status = filters.status;
    }
    
    if (searchTerm) {
      newFilters.searchTerm = searchTerm;
    }
    
    setFilters(newFilters);
  };

  // Function to filter subscriptions based on search term (client-side filtering)
  const filteredSubscriptions = subscriptions.filter(sub => {
    // Return true if no search term or if search term matches user email/name
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      sub.user?.name?.toLowerCase().includes(searchLower) ||
      sub.user?.email?.toLowerCase().includes(searchLower) ||
      sub.plan?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Função para ordenar assinaturas
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Função para obter iniciais do nome do usuário
  const getUserInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase();
  };

  // Função para verificar se a assinatura está prestes a expirar (menos de 7 dias)
  const isSubscriptionExpiringSoon = (subscription: SubscriptionType): boolean => {
    if (!subscription.endDate) return false;
    
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays > 0;
  };

  // Ordenar as assinaturas com base no campo e direção selecionados
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    // Definir valores para comparação com base no campo de ordenação
    switch (sortField) {
      case 'id':
        valueA = a.id;
        valueB = b.id;
        break;
      case 'userId':
        valueA = a.user?.name || a.userId;
        valueB = b.user?.name || b.userId;
        break;
      case 'planId':
        valueA = a.plan?.name || a.planId;
        valueB = b.plan?.name || b.planId;
        break;
      case 'startDate':
        valueA = new Date(a.startDate).getTime();
        valueB = new Date(b.startDate).getTime();
        break;
      case 'endDate':
        valueA = new Date(a.endDate).getTime();
        valueB = new Date(b.endDate).getTime();
        break;
      case 'status':
        valueA = String(a.status);
        valueB = String(b.status);
        break;
      default:
        valueA = a.id;
        valueB = b.id;
    }

    // Ordenação baseada na direção (asc/desc)
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Function to format dates consistently
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Funções auxiliares para lidar com valores de status
  const getStatusText = (status: string): string => {
    switch(status) {
      case 'ACTIVE': return 'Ativa';
      case 'CANCELLED': return 'Cancelada';
      case 'EXPIRED': return 'Expirada';
      case 'PENDING': return 'Pendente';
      default: return status ? String(status) : 'Desconhecido';
    }
  };
  
  const getStatusBadgeClass = (status: string): string => {
    switch(status) {
      case 'ACTIVE': return styles.statusActive;
      case 'CANCELLED': return styles.statusCancelled;
      case 'EXPIRED': return styles.statusExpired;
      case 'PENDING': return styles.statusPending;
      default: return '';
    }
  };

  // Function to handle tab change
  const handleTabChange = async (tab: 'subscriptions' | 'plans' | 'history') => {
    setActiveTab(tab);
    
    // Se mudar para a aba de histórico e tiver uma assinatura selecionada, busca o histórico
    if (tab === 'history' && selectedSubscription) {
      await fetchPaymentHistory(selectedSubscription.id);
    }
    
    // Se mudar para qualquer aba, recarrega todos os dados para garantir que estejam atualizados
    fetchData();
  };
  
  // Efeito para buscar dados ao carregar a página e quando os filtros mudarem
  useEffect(() => {
    fetchData();
    
    // Definir um intervalo para atualizar os dados a cada 30 segundos
    const interval = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchData();
    }, 30000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, [filters]);

  return (
    <div className={styles.contentContainer}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Gerenciamento de Assinaturas</h1>
        <p className={styles.pageDescription}>
          Gerencie assinaturas e planos disponíveis na plataforma.
        </p>
      </div>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'subscriptions' ? styles.active : ''}`}
          onClick={() => handleTabChange('subscriptions')}
        >
          Assinaturas
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'plans' ? styles.active : ''}`}
          onClick={() => handleTabChange('plans')}
        >
          Planos
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Histórico de Pagamentos
        </button>
      </div>
      
      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className={styles.tabContent}>
          <div className={styles.actionBar}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar por usuário ou plano..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
              <button onClick={applyFilters} className={styles.searchButton}>
                Buscar
              </button>
            </div>
              <div className={styles.filterContainer}>
              <select 
                value={filters.status as string || 'all'} 
                onChange={(e) => setFilters({
                  ...filters, 
                  status: e.target.value === 'all' ? undefined : e.target.value
                })}
                className={styles.filterSelect}
              >
                <option value="all">Todos os status</option>
                <option value="ACTIVE">Ativas</option>
                <option value="CANCELLED">Canceladas</option>
                <option value="EXPIRED">Expiradas</option>
                <option value="PENDING">Pendentes</option>
              </select>
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className={styles.addButton}
            >
              Adicionar Assinatura
            </button>
          </div>
          
          {/* Subscriptions Table */}
          <div className={styles.tableContainer}>
            <table className={styles.subscriptionsTable}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.tableCell}>
                    <div className={styles.sortableHeader} onClick={() => handleSort('id')}>
                      ID
                      {sortField === 'id' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={styles.tableCell}>
                    <div className={styles.sortableHeader} onClick={() => handleSort('userId')}>
                      Usuário
                      {sortField === 'userId' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={styles.tableCell}>
                    <div className={styles.sortableHeader} onClick={() => handleSort('planId')}>
                      Plano
                      {sortField === 'planId' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={styles.tableCell}>
                    <div className={styles.sortableHeader} onClick={() => handleSort('startDate')}>
                      Início
                      {sortField === 'startDate' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={styles.tableCell}>
                    <div className={styles.sortableHeader} onClick={() => handleSort('endDate')}>
                      Término
                      {sortField === 'endDate' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={styles.tableCell}>
                    <div className={styles.sortableHeader} onClick={() => handleSort('status')}>
                      Status
                      {sortField === 'status' && (
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.loadingCell}>
                      <div className={styles.loadingIndicator}>
                        <div className={styles.loadingSpinner}></div>
                        <span>Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyIcon}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6C3 4.34315 4.34315 3 6 3H14C15.6569 3 17 4.34315 17 6V18C17 19.6569 15.6569 21 14 21H6C4.34315 21 3 19.6569 3 18V6Z" stroke="currentColor" strokeWidth="2" />
                            <path d="M17 6H19C20.6569 6 22 7.34315 22 9V15C22 17.2091 20.2091 19 18 19H17" stroke="currentColor" strokeWidth="2" />
                            <path d="M7 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M7 11H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p>Nenhuma assinatura encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedSubscriptions.map(subscription => (
                    <tr key={subscription.id} 
                        className={styles.subscriptionRow}
                        onClick={() => handleSelectSubscription(subscription)}>
                      <td className={styles.tableCell}>
                        <span className={styles.idBadge}>#{subscription.id}</span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatar}>
                            {getUserInitials(subscription.user?.name || `U${subscription.userId}`)}
                          </div>
                          <div>
                            <div className={styles.userName}>{subscription.user?.name || `Usuário #${subscription.userId}`}</div>
                            {subscription.user?.email && <div className={styles.userEmail}>{subscription.user.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.planTag}>{subscription.plan?.name || `Plano #${subscription.planId}`}</span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          <span className={styles.dateValue}>{formatDate(subscription.startDate)}</span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          <span className={styles.dateValue}>{formatDate(subscription.endDate)}</span>
                          {isSubscriptionExpiringSoon(subscription) && 
                            <span className={styles.expiryBadge}>Expira em breve</span>
                          }
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(subscription.status)}`}>
                          {getStatusText(subscription.status)}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubscription(subscription);
                              setIsEditModalOpen(true);
                            }}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            disabled={subscription.status !== 'ACTIVE'}
                            title={subscription.status !== 'ACTIVE' ? 'Não é possível editar assinaturas não ativas' : 'Editar assinatura'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Editar</span>
                          </button>
                          {subscription.status === 'ACTIVE' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubscription(subscription);
                                setIsCancelModalOpen(true);
                              }}
                              className={`${styles.actionButton} ${styles.cancelButton}`}
                              title="Cancelar assinatura"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>Cancelar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className={styles.tabContent}>
          <div className={styles.actionBar}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar plano..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
              <button onClick={applyFilters} className={styles.searchButton}>
                Buscar
              </button>
            </div>
            
            <button 
              onClick={() => {
                setSelectedPlan(null);
                setIsPlanModalOpen(true);
              }} 
              className={styles.addButton}
            >
              Adicionar Plano
            </button>
          </div>
          
          {/* Plans Table */}
          <div className={styles.tableContainer}>
            <table className={styles.subscriptionsTable}>
              <thead>
                <tr className={`${styles.subscriptionRow} ${styles.tableHeader}`}>
                  <th className={styles.tableCell}>ID</th>
                  <th className={styles.tableCell}>Nome</th>
                  <th className={styles.tableCell}>Descrição</th>
                  <th className={styles.tableCell}>Preço</th>
                  <th className={styles.tableCell}>Duração (dias)</th>
                  <th className={styles.tableCell}>Status</th>
                  <th className={styles.tableCell}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.loadingCell}>Carregando...</td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>Nenhum plano encontrado</td>
                  </tr>
                ) : (
                  plans
                    .filter(plan => !searchTerm || plan.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(plan => (
                      <tr key={plan.id} className={styles.subscriptionRow}>
                        <td className={styles.tableCell}>
                          <span className={styles.idBadge}>#{plan.id}</span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.planTag}>{plan.name}</span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.descriptionText}>
                            {plan.description.length > 30 ? `${plan.description.substring(0, 30)}...` : plan.description}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.priceBadge}>{Number(plan.price).toFixed(0)}R$</span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.durationTag}>{plan.duration} dias</span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.statusBadge} ${plan.active ? styles.statusActive : styles.statusInactive}`}>
                            {plan.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actionButtons}>
                            <button 
                              className={`${styles.actionButton} ${styles.editButton}`}
                              onClick={() => {
                                setSelectedPlan(plan);
                                setIsPlanModalOpen(true);
                              }}
                            >
                              Editar
                            </button>
                            <button 
                              className={`${styles.actionButton} ${plan.active ? styles.cancelButton : styles.editButton}`}
                              onClick={() => handleTogglePlanStatus(plan.id)}
                            >
                              {plan.active ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <div className={styles.tabContent}>
          {!selectedSubscription ? (
            <div className={styles.emptyState}>
              <p>Selecione uma assinatura na aba "Assinaturas" para visualizar seu histórico de pagamentos</p>
            </div>
          ) : (
            <>
              <div className={styles.contentHeader}>
                <h2 className={styles.sectionTitle}>
                  Histórico de Pagamentos - 
                  {selectedSubscription.user?.name || `Usuário #${selectedSubscription.userId}`} 
                  ({selectedSubscription.plan?.name || `Plano #${selectedSubscription.planId}`})
                </h2>
              </div>
              
              <div className={styles.tableContainer}>
                <table className={styles.subscriptionsTable}>
                  <thead>
                    <tr className={`${styles.subscriptionRow} ${styles.tableHeader}`}>
                      <th className={styles.tableCell}>ID</th>
                      <th className={styles.tableCell}>Data</th>
                      <th className={styles.tableCell}>Valor</th>
                      <th className={styles.tableCell}>Método</th>
                      <th className={styles.tableCell}>Status</th>
                      <th className={styles.tableCell}>Transação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className={styles.loadingCell}>Carregando...</td>
                      </tr>
                    ) : paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={styles.emptyCell}>Nenhum pagamento encontrado</td>
                      </tr>
                    ) : (
                      paymentHistory.map(payment => (
                        <tr key={payment.id} className={styles.subscriptionRow}>
                          <td className={styles.tableCell}>{payment.id}</td>
                          <td className={styles.tableCell}>{formatDate(payment.paymentDate)}</td>
                          <td className={styles.tableCell}>R$ {Number(payment.amount).toFixed(2)}</td>
                          <td className={styles.tableCell}>{
                            payment.paymentMethod === 'credit_card' 
                              ? 'Cartão de Crédito' 
                              : payment.paymentMethod === 'pix' 
                                ? 'PIX' 
                                : payment.paymentMethod
                          }</td>
                          <td className={styles.tableCell}>
                            <span className={`${styles.statusBadge} ${payment.status === 'completed' ? styles.statusActive : styles.statusPending}`}>
                              {payment.status === 'completed' ? 'Concluído' : payment.status}
                            </span>
                          </td>
                          <td className={styles.tableCell}>{payment.transactionId || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Adicionar Nova Assinatura</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const planId = Number(formData.get('planId'));
              
              // Get the selected plan
              const selectedPlan = plans.find(p => p.id === planId);
              if (!selectedPlan) return;
              
              // Calculate end date based on plan duration
              const startDate = new Date();
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + selectedPlan.duration);
                handleAddSubscription({
                userId: Number(formData.get('userId')),
                planId: planId,
                startDate,
                endDate,
                status: 'ACTIVE',
                paymentMethod: formData.get('paymentMethod') as string,
              });
            }}>

              <div className={styles.formGroup}>
                <label>ID do Usuário</label>
                <input type="number" name="userId" required />
              </div>
              <div className={styles.formGroup}>
                <label>Plano</label>
                <select name="planId" required>
                  {plans.filter(p => p.active).map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - R$ {Number(plan.price).toFixed(2)}
                    </option>
                  ))} 
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Método de Pagamento</label>
                <select name="paymentMethod" required>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                  <option value="pix">PIX</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Subscription Modal */}
      {isEditModalOpen && selectedSubscription && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Renovar Assinatura</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditSubscription({
                duration: Number(formData.get('duration'))
              });
            }}>
              <div className={styles.subscriptionSummary}>
                <p><strong>Usuário:</strong> {selectedSubscription.user?.name || `ID: ${selectedSubscription.userId}`}</p>
                <p><strong>Plano:</strong> {selectedSubscription.plan?.name || `ID: ${selectedSubscription.planId}`}</p>
                <p><strong>Expira em:</strong> {formatDate(selectedSubscription.endDate)}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Duração da Renovação (dias)</label>
                <input 
                  type="number" 
                  name="duration" 
                  required 
                  min="1"
                  defaultValue={selectedSubscription.plan?.duration || 30}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  Renovar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Cancel Subscription Modal */}
      {isCancelModalOpen && selectedSubscription && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Cancelar Assinatura</h2>
            <div className={styles.subscriptionSummary}>
              <p><strong>Usuário:</strong> {selectedSubscription.user?.name || `ID: ${selectedSubscription.userId}`}</p>
              <p><strong>Plano:</strong> {selectedSubscription.plan?.name || `ID: ${selectedSubscription.planId}`}</p>
              <p><strong>Expira em:</strong> {formatDate(selectedSubscription.endDate)}</p>
            </div>
            <p className={styles.warningText}>
              Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.
            </p>
            <div className={styles.modalActions}>
              <button onClick={() => setIsCancelModalOpen(false)} className={styles.cancelButton}>
                Voltar
              </button>
              <button onClick={handleCancelSubscription} className={styles.confirmDeleteButton}>
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Plan Modal (Add/Edit) */}
      {isPlanModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>{selectedPlan ? 'Editar Plano' : 'Adicionar Novo Plano'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              // Split features string into array
              const featuresString = formData.get('features') as string;
              const features = featuresString.split('\n')
                .map(feature => feature.trim())
                .filter(feature => feature.length > 0);
              
              const planData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: Number(formData.get('price')),
                duration: Number(formData.get('duration')),
                features,
                active: true
              };
              
              if (selectedPlan) {
                handleEditPlan(planData);
              } else {
                handleAddPlan(planData);
              }
            }}>
              <div className={styles.formGroup}>
                <label>Nome do Plano</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  defaultValue={selectedPlan?.name || ''}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <textarea 
                  name="description" 
                  required 
                  defaultValue={selectedPlan?.description || ''}
                  rows={3}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Preço (R$)</label>
                  <input 
                    type="number" 
                    name="price" 
                    required 
                    min="0" 
                    step="0.01"
                    defaultValue={selectedPlan?.price || ''}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Duração (dias)</label>
                  <input 
                    type="number" 
                    name="duration" 
                    required 
                    min="1"
                    defaultValue={selectedPlan?.duration || 30}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Recursos (um por linha)</label>
                <textarea 
                  name="features" 
                  required 
                  defaultValue={selectedPlan?.features.join('\n') || ''}
                  rows={5}
                  placeholder="Acesso a todos os componentes&#10;Download ilimitado&#10;Suporte prioritário"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => {
                  setIsPlanModalOpen(false);
                  setSelectedPlan(null);
                }} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  {selectedPlan ? 'Salvar Alterações' : 'Adicionar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
