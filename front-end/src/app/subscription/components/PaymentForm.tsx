import React, { useState } from 'react';
import styles from '../subscription.module.css';
import { Plan } from '@/types/subscription';

interface PaymentFormProps {
  plan: Plan;
  onComplete: (paymentMethod: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({ plan, onComplete, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'bank_slip'>('credit_card');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Credit card form state
  const [cardInfo, setCardInfo] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateCreditCardForm = () => {
    if (!cardInfo.number.trim()) {
      setFormError('O número do cartão é obrigatório');
      return false;
    }
    if (!cardInfo.name.trim()) {
      setFormError('O nome no cartão é obrigatório');
      return false;
    }
    if (!cardInfo.expiry.trim()) {
      setFormError('A data de validade é obrigatória');
      return false;
    }
    if (!cardInfo.cvc.trim()) {
      setFormError('O código de segurança é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate form based on payment method
    if (paymentMethod === 'credit_card' && !validateCreditCardForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would process the payment here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the onComplete with the selected payment method
      onComplete(paymentMethod);
    } catch (error) {
      console.error('Payment error:', error);
      setFormError('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Format price to Brazilian currency
  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Format duration
  const formatDuration = (days: number): string => {
    if (days % 30 === 0) {
      const months = days / 30;
      return months === 1 ? '1 mês' : `${months} meses`;
    } else if (days % 7 === 0) {
      const weeks = days / 7;
      return weeks === 1 ? '1 semana' : `${weeks} semanas`;
    } else {
      return `${days} dias`;
    }
  };

  return (
    <div className={styles.paymentSection}>
      <h2 className={styles.sectionTitle}>Finalizar assinatura</h2>
      
      <div className={styles.paymentContainer}>
        <div className={styles.planSummary}>
          <h3 className={styles.planSummaryTitle}>Resumo do plano</h3>
          <div className={styles.planSummaryDetails}>
            <div className={styles.planName}>{plan.name}</div>
            <div className={styles.planPrice}>
              {formatPrice(plan.price)}
              <span className={styles.planInterval}>/{formatDuration(plan.duration)}</span>
            </div>
          </div>
          <div className={styles.planFeaturesSummary}>
            <ul>
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className={styles.paymentFormContainer}>
          {formError && (
            <div className={styles.formError}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {formError}
            </div>
          )}
          
          <div className={styles.paymentOptions}>
            <button 
              type="button"
              className={`${styles.paymentOptionButton} ${paymentMethod === 'credit_card' ? styles.activePaymentOption : ''}`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 15H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Cartão de Crédito
            </button>
            <button 
              type="button"
              className={`${styles.paymentOptionButton} ${paymentMethod === 'pix' ? styles.activePaymentOption : ''}`}
              onClick={() => setPaymentMethod('pix')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 9.5L14.5 14.5M14.5 9.5L9.5 14.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              PIX
            </button>
            <button 
              type="button"
              className={`${styles.paymentOptionButton} ${paymentMethod === 'bank_slip' ? styles.activePaymentOption : ''}`}
              onClick={() => setPaymentMethod('bank_slip')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Boleto
            </button>
          </div>
          
          {paymentMethod === 'credit_card' && (
            <form onSubmit={handleSubmit} className={styles.creditCardForm}>
              <div className={styles.formGroup}>
                <label htmlFor="card-number" className={styles.formLabel}>Número do Cartão</label>
                <input
                  type="text"
                  id="card-number"
                  name="number"
                  placeholder="0000 0000 0000 0000"
                  className={styles.formInput}
                  value={cardInfo.number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="card-name" className={styles.formLabel}>Nome no Cartão</label>
                <input
                  type="text"
                  id="card-name"
                  name="name"
                  placeholder="Nome completo"
                  className={styles.formInput}
                  value={cardInfo.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="card-expiry" className={styles.formLabel}>Validade</label>
                  <input
                    type="text"
                    id="card-expiry"
                    name="expiry"
                    placeholder="MM/AA"
                    className={styles.formInput}
                    value={cardInfo.expiry}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="card-cvc" className={styles.formLabel}>CVV</label>
                  <input
                    type="text"
                    id="card-cvc"
                    name="cvc"
                    placeholder="123"
                    className={styles.formInput}
                    value={cardInfo.cvc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton} 
                  onClick={onCancel}
                  disabled={loading}
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.buttonSpinner}></span>
                      Processando...
                    </>
                  ) : (
                    `Pagar ${formatPrice(plan.price)}`
                  )}
                </button>
              </div>
            </form>
          )}
          
          {paymentMethod === 'pix' && (
            <div className={styles.pixContainer}>
              <div className={styles.pixQrCode}>
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" fill="white"/>
                  <g transform="translate(40, 40)">
                    <rect x="0" y="0" width="120" height="120" fill="white"/>
                    <path d="M0 0h32v8h-24v24h-8zM88 0h32v32h-8v-24h-24zM0 88h8v24h24v8h-32zM88 112h24v8h-32v-32h8z" fill="black"/>
                    <rect x="16" y="16" width="88" height="88" fill="white"/>
                    <rect x="32" y="32" width="56" height="56" fill="black"/>
                    <rect x="40" y="40" width="40" height="40" fill="white"/>
                    <rect x="48" y="48" width="24" height="24" fill="black"/>
                  </g>
                </svg>
              </div>
              <p className={styles.pixInstructions}>Escaneie o QR Code com seu aplicativo de banco para efetuar o pagamento via PIX.</p>
              <button 
                className={styles.pixCopyButton}
                onClick={() => {
                  navigator.clipboard.writeText("ASAD57AS4D7AS4D7A4DS");
                  setFormError("Código PIX copiado para a área de transferência!");
                  setTimeout(() => setFormError(null), 3000);
                }}
              >
                Copiar código PIX
              </button>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton} 
                  onClick={onCancel}
                >
                  Voltar
                </button>
                <button 
                  type="button" 
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.buttonSpinner}></span>
                      Verificando pagamento...
                    </>
                  ) : 'Confirmar pagamento'}
                </button>
              </div>
            </div>
          )}
          
          {paymentMethod === 'bank_slip' && (
            <div className={styles.bankSlipContainer}>
              <p className={styles.bankSlipInstructions}>Um boleto será gerado após a confirmação. Ele será enviado para seu e-mail e ficará disponível em seu painel.</p>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton} 
                  onClick={onCancel}
                >
                  Voltar
                </button>
                <button 
                  type="button" 
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.buttonSpinner}></span>
                      Gerando boleto...
                    </>
                  ) : 'Gerar boleto'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
