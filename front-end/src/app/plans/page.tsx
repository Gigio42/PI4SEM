"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header/Header';
import { subscriptionsService, PlanType } from '@/services/SubscriptionsService';
import { useToast } from '@/hooks/useToast';
import styles from './plans.module.css';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const availablePlans = await subscriptionsService.getPlans(true);
      setPlans(availablePlans);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      showToast("Erro ao carregar planos. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: PlanType) => {
    // Redirect to checkout page with the selected plan
    router.push(`/checkout?planId=${plan.id}`);
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <section className={styles.plansSection}>
          <div className={styles.plansHeader}>
            <h1>Escolha o plano ideal para você</h1>
            <p>Acesse recursos exclusivos e impulsione seus projetos</p>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando planos disponíveis...</p>
            </div>
          ) : (
            <div className={styles.plansGrid}>
              {plans.map((plan) => (
                <div key={plan.id} className={styles.planCard}>
                  <div className={styles.planHeader}>
                    <h2>{plan.name}</h2>
                    <p className={styles.planPrice}>
                      <span className={styles.currency}>R$</span>
                      <span className={styles.amount}>{plan.price.toFixed(2)}</span>
                      <span className={styles.period}>/{plan.duration} dias</span>
                    </p>
                  </div>
                  
                  <div className={styles.planDescription}>
                    <p>{plan.description}</p>
                  </div>
                  
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, index) => (
                      <li key={index} className={styles.featureItem}>
                        <svg className={styles.checkIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => handleSelectPlan(plan)} 
                    className={styles.selectButton}
                  >
                    Assinar agora
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section className={styles.faqSection}>
          <h2>Dúvidas Frequentes</h2>
          
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>Como funciona a assinatura?</h3>
              <p>Ao assinar um plano, você terá acesso imediato a todos os recursos exclusivos durante o período contratado. A renovação acontece automaticamente ao final do período.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>Posso cancelar a qualquer momento?</h3>
              <p>Sim, você pode cancelar sua assinatura a qualquer momento pela sua área de usuário. O acesso permanecerá ativo até o final do período já pago.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>Quais formas de pagamento são aceitas?</h3>
              <p>Aceitamos cartões de crédito, débito, transferência bancária e PIX.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>Posso mudar de plano?</h3>
              <p>Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entrarão em vigor no próximo ciclo de faturamento.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
