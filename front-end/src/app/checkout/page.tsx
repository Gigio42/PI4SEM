"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header/Header';
import { SubscriptionService } from '@/services/SubscriptionService';
import { useAuth } from '@/contexts/AuthContext';
import { Plan } from '@/types/subscription';
import { useToast } from '@/hooks/useToast';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error' | 'pending'>('idle');
  const [pixCode, setPixCode] = useState('');
  
  const { showToast } = useToast();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/checkout?planId=' + planId));
      return;
    }

    if (!planId) {
      showToast("Nenhum plano selecionado. Redirecionando para a página de planos.");
      router.push('/subscription');
      return;
    }

    fetchPlanDetails(Number(planId));
  }, [planId, router, showToast, isAuthenticated]);

  const fetchPlanDetails = async (id: number) => {
    try {
      setLoading(true);
      const plan = await SubscriptionService.getPlanById(id);
      setSelectedPlan(plan);
    } catch (error) {
      console.error("Erro ao carregar detalhes do plano:", error);
      showToast("Erro ao carregar detalhes do plano. Redirecionando para a página de planos.");
      router.push('/subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'expiry') {
      // Format expiry date (MM/YY)
      const expiry = value.replace(/\D/g, '');
      if (expiry.length <= 2) {
        setCardDetails(prev => ({ ...prev, [name]: expiry }));
      } else {
        setCardDetails(prev => ({ ...prev, [name]: `${expiry.slice(0, 2)}/${expiry.slice(2, 4)}` }));
      }
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !selectedPlan) {
      showToast("Informações de usuário ou plano não disponíveis");
      return;
    }
    
    // Validar dados do cartão se o método de pagamento for cartão de crédito
    if (paymentMethod === 'credit_card') {
      // Validar número do cartão (remover espaços e verificar se tem 16 dígitos)
      const cardNumber = cardDetails.number.replace(/\s/g, '');
      if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        showToast("Número de cartão inválido. Insira os 16 dígitos do seu cartão.");
        return;
      }
      
      // Validar nome no cartão
      if (cardDetails.name.trim().length < 3) {
        showToast("Nome no cartão inválido.");
        return;
      }
      
      // Validar data de expiração
      const expiryMatch = cardDetails.expiry.match(/^(\d{2})\/(\d{2})$/);
      if (!expiryMatch) {
        showToast("Data de expiração deve estar no formato MM/YY.");
        return;
      }
      
      const expiryMonth = parseInt(expiryMatch[1]);
      const expiryYear = parseInt(expiryMatch[2]) + 2000; // Assumindo 20XX
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // getMonth é 0-indexed
      const currentYear = now.getFullYear();
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        showToast("Cartão expirado.");
        return;
      }
      
      // Validar CVC
      if (cardDetails.cvc.length < 3 || !/^\d+$/.test(cardDetails.cvc)) {
        showToast("Código de segurança inválido.");
        return;
      }
    }
    
    try {
      setProcessing(true);
      
      if (paymentMethod === 'pix') {
        // Generate PIX code and set pending status
        setPixCode('00020126580014BR.GOV.BCB.PIX01361234567890123456789012345802BR5925UXPERIMENT LABS ASSINATU6009SAO PAULO62070503***63041234');
        setPaymentStatus('pending');
        return;
      }
      
      // Verificar se o usuário já possui uma assinatura ativa
      const hasActiveSubscription = await SubscriptionService.checkUserHasActiveSubscription(user.id);
      if (hasActiveSubscription) {
        showToast("Você já possui uma assinatura ativa. Verifique na página de assinaturas.");
        router.push('/subscription');
        return;
      }
      
      // Process credit card payment
      const subscription = await SubscriptionService.createSubscription({
        userId: user.id,
        planId: selectedPlan.id,
        paymentMethod
      });
      
      setPaymentStatus('success');
      showToast("Assinatura realizada com sucesso!");
      
      // Definir flags para forçar recarregamento dos dados
      localStorage.setItem('forceRefreshSubscription', 'true');
      localStorage.setItem('forceRefreshComponents', 'true');
      
      // Forçar atualização do estado de assinatura no localStorage para reflexão imediata
      localStorage.setItem('userHasActiveSubscription', 'true');
      localStorage.setItem('subscriptionStatusTime', Date.now().toString());
      
      // Redireciona para a página de componentes após o sucesso para mostrar os componentes desbloqueados
      setTimeout(() => {
        router.push('/components');
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      showToast("Erro ao processar pagamento. Por favor, verifique seus dados e tente novamente.");
      setPaymentStatus('error');
    } finally {
      setProcessing(false);
    }
  };
  const handleConfirmPixPayment = async () => {
    if (!user?.id || !selectedPlan) return;
    
    try {
      setProcessing(true);
      
      // Verificar se o usuário já possui uma assinatura ativa
      const hasActiveSubscription = await SubscriptionService.checkUserHasActiveSubscription(user.id);
      if (hasActiveSubscription) {
        showToast("Você já possui uma assinatura ativa. Verifique na página de assinaturas.");
        router.push('/subscription');
        return;
      }
      
      // Process the subscription after PIX payment
      const subscription = await SubscriptionService.createSubscription({
        userId: user.id,
        planId: selectedPlan.id,
        paymentMethod: 'pix'
      });
      
      // Definir flags para forçar recarregamento dos dados
      localStorage.setItem('forceRefreshSubscription', 'true');
      localStorage.setItem('forceRefreshComponents', 'true');
      
      // Forçar atualização do estado de assinatura no localStorage para reflexão imediata
      localStorage.setItem('userHasActiveSubscription', 'true');
      localStorage.setItem('subscriptionStatusTime', Date.now().toString());
      
      setPaymentStatus('success');
      showToast("Pagamento confirmado! Sua assinatura está ativa.");
      
      setTimeout(() => {
        router.push('/components');
      }, 2000);
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      showToast("Erro ao confirmar pagamento. Por favor, tente novamente.");
      setPaymentStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  // Rest of the component with UI for different payment states...
  // This would include rendering the payment form, success, error, and pending states

  // Simplified return statement
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        {/* Payment UI goes here */}
        {/* This would be similar to the existing checkout page from the files */}
      </main>
    </div>
  );
}
