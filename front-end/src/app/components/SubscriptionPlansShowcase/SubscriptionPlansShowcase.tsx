import React from 'react';
import styles from './SubscriptionPlansShowcase.module.css';
import { Plan } from '@/types/subscription';

interface SubscriptionPlansShowcaseProps {
  plans: Plan[];
  loading: boolean;
  onSelectPlan: (planId: number) => void;
}

export default function SubscriptionPlansShowcase({ 
  plans, 
  loading, 
  onSelectPlan 
}: SubscriptionPlansShowcaseProps) {
  
  // Format price to Brazilian currency
  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Format duration in days to a readable format
  const formatDuration = (days: number): string => {
    if (days % 30 === 0) {
      const months = days / 30;
      return months === 1 ? '1 mês' : `${months} meses`;
    } else if (days % 7 === 0) {
      const weeks = days / 7;
      return weeks === 1 ? '1 semana' : `${weeks} semanas`;
    } else if (days === 365 || days === 366) {
      return '1 ano';
    }
    return `${days} dias`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Carregando planos disponíveis...</p>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>Nenhum plano disponível no momento</h3>
        <p>Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className={styles.plansContainer}>
      {plans.map((plan) => (
        <div 
          key={plan.id}
          className={`${styles.planCard} ${plan.highlighted ? styles.highlightedPlan : ''}`}
        >
          {plan.highlighted && (
            <div className={styles.recommendedBadge}>Recomendado</div>
          )}
          
          <h3 className={styles.planName}>{plan.name}</h3>
          
          <div className={styles.planPrice}>
            <span className={styles.priceCurrency}>{formatPrice(plan.price)}</span>
            <span className={styles.pricePeriod}>/{formatDuration(plan.duration)}</span>
          </div>
          
          <p className={styles.planDescription}>{plan.description}</p>
          
          <ul className={styles.featuresList}>
            {plan.features.map((feature, index) => (
              <li key={index} className={styles.featureItem}>
                <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <button 
            className={`${styles.selectPlanButton} ${plan.highlighted ? styles.highlightedButton : ''}`}
            onClick={() => onSelectPlan(plan.id)}
          >
            Assinar Agora
          </button>
        </div>
      ))}
    </div>
  );
}
