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
    
    try {
      setProcessing(true);
      
      if (paymentMethod === 'pix') {
        // Generate PIX code and set pending status
        setPixCode('00020126580014BR.GOV.BCB.PIX01361234567890123456789012345802BR5925UXPERIMENT LABS ASSINATU6009SAO PAULO62070503***63041234');
        setPaymentStatus('pending');
        return;
      }
      
      // Process credit card or boleto payment
      const subscription = await SubscriptionService.createSubscription({
        userId: user.id,
        planId: selectedPlan.id,
        paymentMethod
      });
      
      setPaymentStatus('success');
      showToast("Assinatura realizada com sucesso!");
      
      // Redirect after payment success
      setTimeout(() => {
        router.push('/subscription');
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
      
      // Process the subscription after PIX payment
      const subscription = await SubscriptionService.createSubscription({
        userId: user.id,
        planId: selectedPlan.id,
        paymentMethod: 'pix'
      });
      
      setPaymentStatus('success');
      showToast("Assinatura realizada com sucesso!");
      
      // Redirect after payment success
      setTimeout(() => {
        router.push('/subscription');
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
