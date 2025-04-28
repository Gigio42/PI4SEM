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
    const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Verifica se a data é válida
    return !isNaN(date.getTime()) ? date.toLocaleDateString('pt-BR') : 'N/A';
  };

  const getRemainingDays = (endDate?: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    // Verifica se a data é válida
    if (isNaN(end.getTime())) return 0;
    
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const remainingDays = getRemainingDays(subscription?.endDate);

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

  // Helper functions para lidar com o status da assinatura
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'CANCELLED':
        return 'Cancelado';
      case 'EXPIRED':
        return 'Expirado';
      case 'PENDING':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return styles.statusActive;
      case 'CANCELLED':
        return styles.statusCanceled;
      case 'EXPIRED':
        return styles.statusExpired;
      case 'PENDING':
        return styles.statusPending;
      default:
        return '';
    }
  };

  return (
    <div className={styles.currentSubscriptionSection}>
      <div className={styles.currentSubscriptionHeader}>
        <h2 className={styles.sectionTitle}>Seu plano atual</h2>
        {/* Can add history button here if needed */}
      </div>
      
      <div className={styles.currentSubscriptionCard}>
        <div className={styles.currentSubscriptionDetails}>          <h3 className={styles.currentPlanName}>
            {subscription.plan?.name || (subscription.planId ? `Plano #${subscription.planId}` : 'Plano não identificado')}
          </h3>
          <div className={styles.subscriptionMeta}>
            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Valor:</span>
              <span className={styles.metaValue}>
                {subscription.plan && typeof subscription.plan.price === 'number' 
                  ? subscription.plan.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }) 
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Válido até:</span>
              <span className={styles.metaValue}>{formatDate(subscription.endDate)}</span>
            </div>
            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Dias restantes:</span>
              <span className={styles.metaValue}>
                {remainingDays > 0 ? `${remainingDays} dias` : 'Expirado'}
              </span>
            </div>            <div className={styles.subscriptionMetaItem}>
              <span className={styles.metaLabel}>Status:</span>
              <span className={`${styles.metaValue} ${
                subscription.status === 'ACTIVE' 
                  ? styles.activeStatus 
                  : subscription.status === 'CANCELLED' 
                    ? styles.canceledStatus 
                    : styles.expiredStatus
              }`}>
                {getStatusText(subscription.status)}
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
