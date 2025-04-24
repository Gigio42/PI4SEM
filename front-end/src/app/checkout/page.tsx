"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header/Header';
import { subscriptionsService, PlanType } from '@/services/SubscriptionsService';
import { useToast } from '@/hooks/useToast';
import styles from './checkout.module.css';

// Mock do usuário atual - Em produção, isso viria do contexto de autenticação
const currentUserId = 1;

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');

  useEffect(() => {
    if (!planId) {
      showToast("Nenhum plano selecionado. Redirecionando para a página de planos.");
      router.push('/plans');
      return;
    }

    fetchPlanDetails(Number(planId));
  }, [planId, router, showToast]);

  const fetchPlanDetails = async (id: number) => {
    try {
      setLoading(true);
      const plan = await subscriptionsService.getPlanById(id);
      setSelectedPlan(plan);
    } catch (error) {
      console.error("Erro ao carregar detalhes do plano:", error);
      showToast("Erro ao carregar detalhes do plano. Redirecionando para a página de planos.");
      router.push('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) return;
    
    try {
      setProcessing(true);
      
      // Em um cenário real, você enviaria os dados do cartão para um gateway de pagamento
      // e só depois de processar o pagamento com sucesso, criaria a assinatura
      
      // Aqui estamos simulando isso criando a assinatura diretamente
      const newSubscription = await subscriptionsService.createSubscription({
        userId: currentUserId,
        planId: selectedPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000),
        status: true,
        paymentMethod: paymentMethod,
        paymentStatus: 'completed'
      });
      
      // Registro de pagamento
      await subscriptionsService.registerPayment(
        newSubscription.id,
        selectedPlan.price,
        paymentMethod
      );
      
      showToast("Assinatura realizada com sucesso!");
      router.push('/subscription');
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      showToast("Erro ao processar pagamento. Por favor, verifique seus dados e tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.checkoutContainer}>
          <div className={styles.orderSummary}>
            <h2>Resumo do pedido</h2>
            
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Carregando detalhes do plano...</p>
              </div>
            ) : selectedPlan ? (
              <>
                <div className={styles.planDetails}>
                  <h3>{selectedPlan.name}</h3>
                  <p className={styles.planDescription}>{selectedPlan.description}</p>
                  
                  <div className={styles.planFeatures}>
                    <h4>O que está incluído:</h4>
                    <ul>
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index}>
                          <svg className={styles.checkIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.planDuration}>
                    <p>Duração: <strong>{selectedPlan.duration} dias</strong></p>
                  </div>
                </div>
                
                <div className={styles.priceSummary}>
                  <div className={styles.priceRow}>
                    <span>Subtotal</span>
                    <span>R$ {selectedPlan.price.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Taxa de processamento</span>
                    <span>R$ 0.00</span>
                  </div>
                  <div className={`${styles.priceRow} ${styles.totalRow}`}>
                    <span>Total</span>
                    <span>R$ {selectedPlan.price.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p>Nenhum plano selecionado.</p>
            )}
          </div>
          
          <div className={styles.paymentForm}>
            <h2>Informações de pagamento</h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.paymentMethods}>
                <h3>Método de pagamento</h3>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={handlePaymentMethodChange}
                    />
                    <div className={styles.optionContent}>
                      <svg className={styles.optionIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                      <span>Cartão de Crédito</span>
                    </div>
                  </label>
                  
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit_card"
                      checked={paymentMethod === 'debit_card'}
                      onChange={handlePaymentMethodChange}
                    />
                    <div className={styles.optionContent}>
                      <svg className={styles.optionIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                      <span>Cartão de Débito</span>
                    </div>
                  </label>
                  
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={handlePaymentMethodChange}
                    />
                    <div className={styles.optionContent}>
                      <svg className={styles.optionIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      <span>PIX</span>
                    </div>
                  </label>
                </div>
              </div>
              
              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className={styles.cardDetails}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cardNumber">Número do cartão</label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="cardHolder">Nome no cartão</label>
                    <input
                      type="text"
                      id="cardHolder"
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="expiryDate">Validade</label>
                      <input
                        type="text"
                        id="expiryDate"
                        placeholder="MM/AA"
                        value={expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          setExpiryDate(value);
                        }}
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'pix' && (
                <div className={styles.pixInstructions}>
                  <p>Ao finalizar o pedido, um QR Code PIX será gerado para pagamento.</p>
                  <div className={styles.pixInfo}>
                    <svg className={styles.infoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>O acesso será liberado assim que confirmarmos o pagamento.</span>
                  </div>
                </div>
              )}
              
              <div className={styles.formActions}>
                <a href="/plans" className={styles.backLink}>
                  Voltar para planos
                </a>
                <button 
                  type="submit" 
                  className={styles.payButton}
                  disabled={processing || loading || !selectedPlan}
                >
                  {processing ? 'Processando...' : `Pagar R$ ${selectedPlan?.price.toFixed(2) || '0.00'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
