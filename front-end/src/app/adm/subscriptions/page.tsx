"use client";

import { useState, useEffect } from 'react';
import { subscriptionsService, SubscriptionType, PlanType, PaymentType } from '@/services/SubscriptionsService';
import styles from './subscriptions.module.css';

// Types for filter and pagination
interface FilterOptions {
  status?: boolean;
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
  
  // Filter and pagination states
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions and plans in parallel
      const [fetchedSubscriptions, fetchedPlans] = await Promise.all([
        subscriptionsService.getAllSubscriptions(filters.status),
        subscriptionsService.getPlans(false) // Get all plans including inactive ones
      ]);
      
      setSubscriptions(fetchedSubscriptions);
      setPlans(fetchedPlans);
    } catch (error) {
      console.error('Error fetching data:', error);
      // In a real app, show error toast here
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
      // In a real app, show error toast here
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
      
      await subscriptionsService.createSubscription(data);
      
      // Refresh the subscriptions list
      await fetchData();
      
      // Close the modal
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding subscription:', error);
      // In a real app, show error toast here
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
      // For now, I'll assume we can renew the subscription
      await subscriptionsService.renewSubscription(
        selectedSubscription.id,
        data.duration
      );
      
      // Refresh the subscriptions list
      await fetchData();
      
      // Close the modal
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error editing subscription:', error);
      // In a real app, show error toast here
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
    } catch (error) {
      console.error('Error canceling subscription:', error);
      // In a real app, show error toast here
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
    // In a real implementation, this would trigger fetchData() with the new filters
    // For now, we'll just filter the client-side data
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

  return (
    <div className={styles.container}>
      <h1>Gerenciamento de Assinaturas</h1>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'subscriptions' ? styles.active : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Assinaturas
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'plans' ? styles.active : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Planos
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico
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
                value={filters.status?.toString() || 'all'} 
                onChange={(e) => setFilters({
                  ...filters, 
                  status: e.target.value === 'all' ? undefined : e.target.value === 'true'
                })}
                className={styles.filterSelect}
              >
                <option value="all">Todos os status</option>
                <option value="true">Ativas</option>
                <option value="false">Canceladas</option>
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
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuário</th>
                  <th>Plano</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.loadingCell}>Carregando...</td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>Nenhuma assinatura encontrada</td>
                  </tr>
                ) : (
                  filteredSubscriptions.map(subscription => (
                    <tr key={subscription.id} onClick={() => handleSelectSubscription(subscription)}>
                      <td>{subscription.id}</td>
                      <td>{subscription.user?.name || `Usuário #${subscription.userId}`}</td>
                      <td>{subscription.plan?.name || `Plano #${subscription.planId}`}</td>
                      <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
                      <td>{new Date(subscription.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${subscription.status ? styles.active : styles.inactive}`}>
                          {subscription.status ? 'Ativa' : 'Cancelada'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubscription(subscription);
                              setIsEditModalOpen(true);
                            }}
                            className={styles.editButton}
                            disabled={!subscription.status}
                          >
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubscription(subscription);
                              setIsCancelModalOpen(true);
                            }}
                            className={styles.cancelButton}
                            disabled={!subscription.status}
                          >
                            Cancelar
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
            
            <button className={styles.addButton}>
              Adicionar Plano
            </button>
          </div>
          
          {/* Plans Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço</th>
                  <th>Duração (dias)</th>
                  <th>Status</th>
                  <th>Ações</th>
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
                      <tr key={plan.id}>
                        <td>{plan.id}</td>
                        <td>{plan.name}</td>
                        <td>{plan.description}</td>
                        <td>R$ {plan.price.toFixed(2)}</td>
                        <td>{plan.duration}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${plan.active ? styles.active : styles.inactive}`}>
                            {plan.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button className={styles.editButton}>
                              Editar
                            </button>
                            <button className={styles.toggleButton}>
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
            <div className={styles.selectPrompt}>
              Selecione uma assinatura para ver seu histórico de pagamentos
            </div>
          ) : (
            <>
              <h2>
                Histórico de Pagamentos - 
                {selectedSubscription.user?.name || `Usuário #${selectedSubscription.userId}`} 
                ({selectedSubscription.plan?.name || `Plano #${selectedSubscription.planId}`})
              </h2>
              
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Método</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className={styles.loadingCell}>Carregando...</td>
                      </tr>
                    ) : paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyCell}>Nenhum pagamento encontrado</td>
                      </tr>
                    ) : (
                      paymentHistory.map(payment => (
                        <tr key={payment.id}>
                          <td>{payment.id}</td>
                          <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td>R$ {payment.amount.toFixed(2)}</td>
                          <td>{payment.paymentMethod}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${payment.status === 'completed' ? styles.active : styles.pending}`}>
                              {payment.status === 'completed' ? 'Concluído' : payment.status}
                            </span>
                          </td>
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
      
      {/* Add Subscription Modal - Simplified for illustration */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Adicionar Nova Assinatura</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // In a real app, get form values and pass to handleAddSubscription
              const formData = new FormData(e.currentTarget);
              handleAddSubscription({
                userId: Number(formData.get('userId')),
                planId: Number(formData.get('planId')),
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                status: true,
                paymentMethod: formData.get('paymentMethod')
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
                      {plan.name} - R$ {plan.price.toFixed(2)}
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
              <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Subscription Modal - Simplified for illustration */}
      {isEditModalOpen && selectedSubscription && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Editar Assinatura #{selectedSubscription.id}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditSubscription({
                duration: Number(formData.get('duration'))
              });
            }}>
              <div className={styles.formGroup}>
                <label>Renovar por (dias)</label>
                <input type="number" name="duration" min="1" defaultValue="30" required />
              </div>
              <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Cancel Subscription Modal */}
      {isCancelModalOpen && selectedSubscription && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Cancelar Assinatura</h2>
            <p>
              Tem certeza que deseja cancelar a assinatura do usuário{' '}
              <strong>{selectedSubscription.user?.name || `#${selectedSubscription.userId}`}</strong>?
            </p>
            <p>Esta ação não pode ser desfeita.</p>
            <div className={styles.modalButtons}>
              <button onClick={() => setIsCancelModalOpen(false)} className={styles.cancelButton}>
                Não, manter assinatura
              </button>
              <button onClick={handleCancelSubscription} className={styles.dangerButton}>
                Sim, cancelar assinatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
