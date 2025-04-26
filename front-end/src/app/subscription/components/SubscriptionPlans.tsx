import React from 'react';
import styles from '../subscription.module.css';
import { Plan } from '@/types/subscription';

interface SubscriptionPlansProps {
  plans: Plan[];
  currentPlanId?: number | null;
  onSelectPlan: (plan: Plan) => void;
}

export default function SubscriptionPlans({ plans, currentPlanId, onSelectPlan }: SubscriptionPlansProps) {
  // Validate that we have plans to display
  if (!plans || plans.length === 0) {
    return null; // The parent component will handle the empty state
  }

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

  return (
    <div className={styles.plansSection}>
      <h2 className={styles.sectionTitle}>Escolha seu plano</h2>
      
      <div className={styles.plansContainer}>
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`${styles.planCard} ${plan.highlighted ? styles.highlightedPlan : ''} ${currentPlanId === plan.id ? styles.currentPlan : ''}`}
          >
            <div className={styles.planHeader}>
              {plan.highlighted && <span className={styles.popularBadge}>Mais popular</span>}
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPrice}>
                <span className={styles.currency}>{formatPrice(plan.price)}</span>
                <span className={styles.interval}>/{formatDuration(plan.duration)}</span>
              </div>
            </div>
            
            <div className={styles.planFeatures}>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <svg className={styles.featureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={styles.planFooter}>
              <button 
                className={`${styles.selectPlanButton} ${currentPlanId === plan.id ? styles.currentPlanButton : ''}`}
                onClick={() => onSelectPlan(plan)}
                disabled={currentPlanId === plan.id}
              >
                {currentPlanId === plan.id ? 'Plano Atual' : 'Selecionar Plano'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
