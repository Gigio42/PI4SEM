import React from 'react';
import { SubscriptionType } from '@/services/SubscriptionsService';
import styles from '../subscription.module.css';

interface SubscriptionDetailsProps {
  subscription: SubscriptionType;
  onCancel: () => void;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ subscription, onCancel }) => {
  // Formatar datas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Verificar status da assinatura
  const isActive = subscription.status && new Date(subscription.endDate) > new Date();
  
  // Calcular dias restantes
  const calculateRemainingDays = () => {
    const today = new Date();
    const endDate = new Date(subscription.endDate);
    const differenceInTime = endDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays > 0 ? differenceInDays : 0;
  };
  
  const remainingDays = calculateRemainingDays();
  
  // Status de pagamento formato amigável 
  const getPaymentStatusText = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'completed': return 'Confirmado';
      case 'failed': return 'Falhou';
      default: return 'Desconhecido';
    }
  };

  // Badge de status baseado no estado da assinatura
  const getStatusBadge = () => {
    if (!subscription.status) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusCanceled}`}>
          Cancelada
        </span>
      );
    }
    
    if (remainingDays <= 0) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusExpired}`}>
          Expirada
        </span>
      );
    }
    
    if (remainingDays <= 5) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusWarning}`}>
          Expira em breve
        </span>
      );
    }
    
    return (
      <span className={`${styles.statusBadge} ${styles.statusActive}`}>
        Ativa
      </span>
    );
  };

  return (
    <div className={styles.subscriptionDetails}>
      <div className={styles.subscriptionHeader}>
        <div>
          <h2 className={styles.subscriptionTitle}>Sua Assinatura</h2>
          {getStatusBadge()}
        </div>
        {isActive && (
          <button 
            onClick={onCancel} 
            className={styles.cancelSubscriptionButton}
          >
            Cancelar Assinatura
          </button>
        )}
      </div>
      
      <div className={styles.subscriptionCard}>
        <div className={styles.subscriptionInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Plano:</span>
            <span className={styles.infoValue}>
              {subscription.plan?.name || subscription.type || 'Premium'}
            </span>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Data de início:</span>
            <span className={styles.infoValue}>{formatDate(subscription.startDate)}</span>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Data de término:</span>
            <span className={styles.infoValue}>{formatDate(subscription.endDate)}</span>
          </div>
          
          {isActive && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Dias restantes:</span>
              <span className={styles.infoValue}>{remainingDays} dias</span>
            </div>
          )}
          
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Método de pagamento:</span>
            <span className={styles.infoValue}>
              {subscription.paymentMethod === 'credit_card' 
                ? 'Cartão de Crédito' 
                : subscription.paymentMethod === 'pix' 
                  ? 'PIX' 
                  : subscription.paymentMethod || 'Não especificado'}
            </span>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Status de pagamento:</span>
            <span className={styles.infoValue}>
              {getPaymentStatusText(subscription.paymentStatus)}
            </span>
          </div>
          
          {subscription.nextPaymentDate && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Próxima cobrança:</span>
              <span className={styles.infoValue}>{formatDate(subscription.nextPaymentDate)}</span>
            </div>
          )}
        </div>
        
        {isActive && subscription.plan && (
          <div className={styles.planBenefits}>
            <h3>Benefícios do seu plano</h3>
            <ul className={styles.benefitsList}>
              {subscription.plan.features.map((feature, index) => (
                <li key={index} className={styles.benefitItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {!isActive && (
          <div className={styles.renewSection}>
            <h3>Sua assinatura expirou</h3>
            <p>Renove sua assinatura para continuar aproveitando todos os benefícios.</p>
            <button className={styles.renewButton}>
              Renovar Assinatura
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
