import React, { useState } from 'react';
import styles from '../subscription.module.css';
import { Subscription } from '@/types/subscription';

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onCancelSubscription: () => void;
}

export default function SubscriptionDetails({ subscription, onCancelSubscription }: SubscriptionDetailsProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const remainingDays = getRemainingDays(subscription.endDate);

  const handleCancelClick = () => {
    setIsConfirmingCancel(true);
  };

  const handleConfirmCancel = () => {
    onCancelSubscription();
    setIsConfirmingCancel(false);
  };

  const handleCancelConfirmation = () => {
    setIsConfirmingCancel(false);
  };

  return (
    <div className={styles.currentSubscriptionSection}>
      <div className={styles.currentSubscriptionHeader}>
        <h2 className={styles.sectionTitle}>Seu plano atual</h2>
        {/* Can add history button here if needed */}
      </div>
      
      <div className={styles.currentSubscriptionCard}>
        <div className={styles.currentSubscriptionDetails}>
          <h3 className={styles.currentPlanName}>
            {subscription.plan?.name || subscription.type}
          </h3>
          <div className={styles.subscriptionMeta}>
            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Valor:</span>
              <span className={styles.metaValue}>
                {subscription.plan ? subscription.plan.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }) : 'N/A'}
              </span>
            </div>
            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Válido até:</span>
              <span className={styles.metaValue}>{formatDate(subscription.endDate)}</span>
            </div>
            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Dias restantes:</span>
              <span className={styles.metaValue}>{remainingDays} dias</span>
            </div>
            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Status:</span>
              <span className={`${styles.metaValue} ${styles.activeStatus}`}>
                {subscription.status ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          
          <div className={styles.subscriptionActions}>
            {!isConfirmingCancel ? (
              <button 
                className={styles.cancelSubscriptionButton}
                onClick={handleCancelClick}
              >
                Cancelar assinatura
              </button>
            ) : (
              <div className={styles.confirmCancelContainer}>
                <p className={styles.confirmCancelText}>
                  Tem certeza que deseja cancelar sua assinatura? Você terá acesso até {formatDate(subscription.endDate)}.
                </p>
                <div className={styles.confirmCancelActions}>
                  <button 
                    className={styles.cancelConfirmButton}
                    onClick={handleCancelConfirmation}
                  >
                    Não, manter assinatura
                  </button>
                  <button 
                    className={styles.confirmCancelButton}
                    onClick={handleConfirmCancel}
                  >
                    Sim, cancelar assinatura
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
