import React from 'react';
import { PlanType } from '@/services/SubscriptionsService';
import styles from '../subscription.module.css';

interface PlanCardProps {
  plan: PlanType;
  onSelect: () => void;
  isPopular?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isPopular = false }) => {
  return (
    <div className={`${styles.planCard} ${isPopular ? styles.popularPlan : ''}`}>
      {isPopular && (
        <div className={styles.popularBadge}>Popular</div>
      )}
      
      <h2 className={styles.planName}>{plan.name}</h2>
      
      <div className={styles.planPrice}>
        <span className={styles.currency}>R$</span>
        <span className={styles.amount}>{Number(plan.price).toFixed(2).replace('.', ',')}</span>
        <span className={styles.duration}>/{plan.duration} dias</span>
      </div>
      
      <p className={styles.planDescription}>{plan.description}</p>
      
      <ul className={styles.featuresList}>
        {plan.features.map((feature, index) => (
          <li key={index} className={styles.featureItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        className={`${styles.subscribeButton} ${isPopular ? styles.popularButton : ''}`}
        onClick={onSelect}
      >
        Assinar Plano
      </button>
    </div>
  );
};

export default PlanCard;
