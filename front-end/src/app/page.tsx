"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header/Header';
import FeaturedComponents from './components/FeaturedComponents/FeaturedComponents';
import styles from './page.module.css';
import { SubscriptionService } from '@/services/SubscriptionService';
import { Plan } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    // Fetch available subscription plans
    const fetchPlans = async () => {
      try {
        setLoading(true);
        console.log("🏠 Home: Starting to fetch plans...");
        
        const plansData = await SubscriptionService.getPlans();
        
        console.log("🏠 Home: Plans received:", plansData);
        console.log("🏠 Home: Plans count:", plansData?.length || 0);
        
        // Add UI highlight to middle/recommended plan
        if (plansData && Array.isArray(plansData) && plansData.length > 0) {
          console.log("🏠 Home: Processing plans...");
          
          const sortedPlans = [...plansData].sort((a, b) => (a.price || 0) - (b.price || 0));
          const highlightIndex = sortedPlans.length === 2 ? 1 : Math.floor(sortedPlans.length / 2);
          
          const enhancedPlans = sortedPlans.map((plan, index) => ({
            ...plan,
            highlighted: index === highlightIndex
          }));
          
          console.log("🏠 Home: Enhanced plans:", enhancedPlans);
          setPlans(enhancedPlans);
          console.log("🏠 Home: Plans set successfully");
        } else {
          console.log("🏠 Home: No valid plans data received");
          setPlans([]);
        }
      } catch (error) {
        console.error('🏠 Home: Error fetching plans:', error);
        setPlans([]); // Set empty array to prevent UI breakage
      } finally {
        setLoading(false);
      }
    };

    // Check if user has an active subscription
    const checkSubscription = async () => {
      if (isAuthenticated && user?.id) {
        try {
          console.log("🏠 Home: Checking user subscription...");
          const subscription = await SubscriptionService.getCurrentSubscription(user.id);
          setHasActiveSubscription(!!subscription);
          console.log("🏠 Home: Subscription check complete:", !!subscription);
        } catch (error) {
          console.error('🏠 Home: Error checking subscription:', error);
          setHasActiveSubscription(false);
        }
      }
    };

    fetchPlans();
    checkSubscription();
  }, [isAuthenticated, user]);

  const handleSelectPlan = (planId: number) => {
    if (!isAuthenticated) {
      // If not logged in, redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?planId=${planId}`)}`);
    } else {
      // If logged in, go directly to checkout
      router.push(`/checkout?planId=${planId}`);
    }
  };

  return (
    <main className={styles.main}>
      <Header />
      
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Crie Interfaces Modernas com Facilidade</h1>
          <p className={styles.heroDescription}>
            Acesse componentes React prontos para uso, personalizáveis e de alta qualidade para acelerar seu desenvolvimento.
          </p>
          <div className={styles.heroCta}>
            <button 
              className={styles.primaryButton}
              onClick={() => router.push('/components')}
            >
              Explorar Componentes
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={() => router.push('/docs')}
            >
              Ver Documentação
            </button>
          </div>
        </div>
        <div className={styles.heroImage}>
          {/* Hero illustration would go here */}
        </div>
      </div>

      <FeaturedComponents />
      
      {/* Subscription Plans section would go here */}
      <section className={styles.subscriptionSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Planos de Assinatura</h2>
          <p className={styles.sectionDescription}>
            Escolha o plano ideal para suas necessidades e tenha acesso a todos os nossos recursos
          </p>
        </div>
        
        {hasActiveSubscription ? (
          <div className={styles.subscriptionBanner}>
            <div className={styles.bannerIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.bannerContent}>
              <h3 className={styles.bannerTitle}>Você já possui uma assinatura ativa</h3>
              <p className={styles.bannerText}>
                Acesse sua área de assinatura para gerenciar seu plano atual.
              </p>
            </div>
            <button 
              className={styles.bannerButton}
              onClick={() => router.push('/subscription')}
            >
              Gerenciar Assinatura
            </button>
          </div>
        ) : (
          <div className={styles.plansContainer}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Carregando planos disponíveis...</p>
              </div>
            ) : plans.length > 0 ? (
              <div className={styles.plansGrid}>
                {plans.map(plan => {
                  console.log("🏠 Rendering plan:", plan);
                  return (
                    <div 
                      key={plan.id}
                      className={`${styles.planCard} ${plan.highlighted ? styles.highlightedPlan : ''}`}
                    >
                      {plan.highlighted && (
                        <div className={styles.recommendedBadge}>Recomendado</div>
                      )}
                      
                      <h3 className={styles.planName}>{plan.name}</h3>
                      
                      <div className={styles.planPrice}>
                        <span>{(plan.price || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}</span>
                        <span className={styles.planPeriod}>
                          /{plan.duration === 30 ? 'mês' : 
                            plan.duration === 365 ? 'ano' : 
                            `${plan.duration} dias`}
                        </span>
                      </div>
                      
                      <ul className={styles.featuresList}>
                        {(plan.features || []).map((feature, index) => (
                          <li key={index} className={styles.featureItem}>
                            <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button 
                        className={styles.selectPlanButton}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        Assinar Agora
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Nenhum plano disponível no momento.</p>
                <button onClick={() => window.location.reload()} style={{marginTop: '10px'}}>
                  Tentar Novamente
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
