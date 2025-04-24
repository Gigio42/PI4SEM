"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import PlanCard from "./components/PlanCard";
import SubscriptionDetails from "./components/SubscriptionDetails";
import styles from './subscription.module.css';
import { subscriptionsService, PlanType, SubscriptionType } from "@/services/SubscriptionsService";
import { useToast } from "@/hooks/useToast";

export default function SubscriptionPage() {
  const [loaded, setLoaded] = useState(false);
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [userSubscription, setUserSubscription] = useState<SubscriptionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  
  // Mock do usuário atual - Em produção, isso viria do contexto de autenticação
  const currentUserId = 1;

  useEffect(() => {
    setLoaded(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar planos disponíveis
      const availablePlans = await subscriptionsService.getPlans(true);
      setPlans(availablePlans);
      
      // Verificar se o usuário já tem uma assinatura
      try {
        const subscription = await subscriptionsService.getUserSubscription(currentUserId);
        setUserSubscription(subscription);
      } catch (error) {
        // Se não encontrar assinatura, apenas continua sem erro
        console.log("Usuário não possui assinatura ativa");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast("Erro ao carregar planos de assinatura. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCancelCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  const handleSubscribe = async (paymentMethod: string) => {
    if (!selectedPlan) return;
    
    try {
      setLoading(true);
      
      // Criar nova assinatura
      const newSubscription = await subscriptionsService.createSubscription({
        userId: currentUserId,
        planId: selectedPlan.id,
        paymentMethod
      });
      
      // Atualizar estado
      setUserSubscription(newSubscription);
      setShowCheckout(false);
      setSelectedPlan(null);
      
      showToast("Assinatura realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao processar assinatura:", error);
      showToast("Erro ao processar sua assinatura. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userSubscription) return;
    
    try {
      setLoading(true);
      
      await subscriptionsService.cancelSubscription(userSubscription.id);
      
      // Atualizar informação da assinatura
      const updatedSubscription = await subscriptionsService.getUserSubscription(currentUserId);
      setUserSubscription(updatedSubscription);
      
      showToast("Sua assinatura foi cancelada");
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      showToast("Erro ao cancelar assinatura. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layoutContainer}>
        <Sidebar />
        <main className={`${styles.mainContent} ${loaded ? styles.loaded : ""}`}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Planos e Assinaturas</h1>
            <p className={styles.pageDescription}>
              Escolha o plano ideal para você e tenha acesso a recursos premium
            </p>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Carregando planos...</p>
            </div>
          ) : (
            <>
              {/* Exibir detalhes da assinatura atual se existir */}
              {userSubscription && (
                <SubscriptionDetails 
                  subscription={userSubscription} 
                  onCancel={handleCancelSubscription}
                />
              )}

              {/* Exibir planos disponíveis se não houver assinatura ativa */}
              {(!userSubscription || !userSubscription.status) && (
                <div className={styles.plansContainer}>
                  {plans.map(plan => (
                    <PlanCard 
                      key={plan.id} 
                      plan={plan} 
                      onSelect={() => handleSelectPlan(plan)}
                    />
                  ))}
                </div>
              )}

              {/* Modal de checkout */}
              {showCheckout && selectedPlan && (
                <div className={styles.checkoutOverlay}>
                  <div className={styles.checkoutModal}>
                    <h2>Finalizar Assinatura</h2>
                    <div className={styles.planSummary}>
                      <h3>{selectedPlan.name}</h3>
                      <p className={styles.price}>
                        R$ {selectedPlan.price} <span>/{selectedPlan.duration} dias</span>
                      </p>
                      <div className={styles.features}>
                        {selectedPlan.features.map((feature, index) => (
                          <div key={index} className={styles.featureItem}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.paymentOptions}>
                      <h3>Método de Pagamento</h3>
                      <div className={styles.paymentButtonsContainer}>
                        <button 
                          className={styles.paymentButton}
                          onClick={() => handleSubscribe('credit_card')}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                            <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Cartão de Crédito
                        </button>
                        <button 
                          className={styles.paymentButton}
                          onClick={() => handleSubscribe('pix')}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9H5C3.89543 9 3 9.89543 3 11V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V11C21 9.89543 20.1046 9 19 9H18M6 9H18M6 9C6 7.34315 7.34315 6 9 6H15C16.6569 6 18 7.34315 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          PIX
                        </button>
                      </div>
                    </div>

                    <div className={styles.checkoutActions}>
                      <button 
                        className={styles.cancelButton}
                        onClick={handleCancelCheckout}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
