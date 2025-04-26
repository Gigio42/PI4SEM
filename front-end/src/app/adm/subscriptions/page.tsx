"use client";

import { useState, useEffect } from 'react';
import { subscriptionsService, SubscriptionType, PlanType, PaymentType } from '@/services/SubscriptionsService';
import styles from './subscriptions.module.css';
import { useToast } from '@/hooks/useToast';

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
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
  // Filter and pagination states
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [filters]);

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

  // Function to format dates consistently
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
          onClick={() => {
            setActiveTab('history');
            if (selectedSubscription) {
              fetchPaymentHistory(selectedSubscription.id);
            }
          }}
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
            <table className={styles.subscriptionsTable}>
              <thead>
                <tr className={`${styles.subscriptionRow} ${styles.tableHeader}`}>
                  <th className={styles.tableCell}>ID</th>
                  <th className={styles.tableCell}>Usuário</th>
                  <th className={styles.tableCell}>Plano</th>
                  <th className={styles.tableCell}>Início</th>
                  <th className={styles.tableCell}>Término</th>
                  <th className={styles.tableCell}>Status</th>
                  <th className={styles.tableCell}>Ações</th>
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
                    <tr key={subscription.id} 
                        className={styles.subscriptionRow}
                        onClick={() => handleSelectSubscription(subscription)}>
                      <td className={styles.tableCell}>{subscription.id}</td>
                      <td className={styles.tableCell}>{subscription.user?.name || `Usuário #${subscription.userId}`}</td>
                      <td className={styles.tableCell}>{subscription.plan?.name || `Plano #${subscription.planId}`}</td>
                      <td className={styles.tableCell}>{formatDate(subscription.startDate)}</td>
                      <td className={styles.tableCell}>{formatDate(subscription.endDate)}</td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${subscription.status ? styles.statusActive : styles.statusInactive}`}>
                          {subscription.status ? 'Ativa' : 'Cancelada'}
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
                            disabled={!subscription.status}
                          >
                            Editar
                          </button>
                          {subscription.status && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubscription(subscription);
                                setIsCancelModalOpen(true);
                              }}
                              className={`${styles.actionButton} ${styles.cancelButton}`}
                            >
                              Cancelar
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
                        <td className={styles.tableCell}>{plan.id}</td>
                        <td className={styles.tableCell}>{plan.name}</td>
                        <td className={styles.tableCell}>{plan.description.length > 50 ? `${plan.description.substring(0, 50)}...` : plan.description}</td>
                        <td className={styles.tableCell}>R$ {Number(plan.price).toFixed(2)}</td>
                        <td className={styles.tableCell}>{plan.duration}</td>
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
                status: true,
                paymentMethod: formData.get('paymentMethod'),
                paymentStatus: 'completed',
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
