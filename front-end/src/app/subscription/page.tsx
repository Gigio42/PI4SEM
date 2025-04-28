"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import styles from "./subscription.module.css";
import homeStyles from "../home/home.module.css";
import SubscriptionPlans from "./components/SubscriptionPlans";
import PaymentForm from "./components/PaymentForm";
import SubscriptionDetails from "./components/SubscriptionDetails";
import ErrorState from "./components/ErrorState";
import { SubscriptionService } from "@/services/SubscriptionService";
import { useAuth } from "@/contexts/AuthContext";
import { Plan, Subscription } from "@/types/subscription";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [authDebug, setAuthDebug] = useState<Record<string, unknown>>({});

  // Enhanced loadPlansOnly function with better error handling but without timeout parameter
  const loadPlansOnly = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get plans without passing timeout parameter
      const plansResult = await SubscriptionService.getPlans();
      
      if (plansResult?.length > 0) {
        const sortedPlans = [...plansResult].sort((a, b) => a.price - b.price);
        const highlightIndex = sortedPlans.length === 2 ? 1 : Math.floor(sortedPlans.length / 2);
        
        const enhancedPlans = sortedPlans.map((plan, index) => ({
          ...plan,
          highlighted: index === highlightIndex
        }));
        
        setAvailablePlans(enhancedPlans);
      } else {
        setAvailablePlans([]);
      }
    } catch (err) {
      console.error('Error fetching plans data:', err);
      
      // More specific error message based on error type
      if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        setError('O servidor está demorando para responder. Por favor, verifique sua conexão e tente novamente.');
      } else if (axios.isAxiosError(err) && err.response?.status === 500) {
        setError('Ocorreu um erro no servidor. Por favor, tente novamente mais tarde ou entre em contato com o suporte.');
      } else {
        setError('Ocorreu um erro ao carregar os planos disponíveis. Por favor, tente novamente mais tarde.');
      }
      
      setAuthDebug(prev => ({ ...prev, fetchPlansError: err }));
    } finally {
      setLoading(false);
    }
  };

  // First useEffect to check for user authentication from multiple sources
  useEffect(() => {
    setLoaded(true);
    
    const checkAuthentication = async () => {
      console.log("🔍 Checking authentication state");
      
      try {
        // First check: Auth context
        if (user) {
          console.log("👤 User found in auth context:", user);
          setLocalUser(user);
          setSessionValid(true);
          setAuthChecked(true);
          return;
        }
        
        // Second check: localStorage
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log("👤 User found in localStorage:", parsedUser);
            setLocalUser(parsedUser);
            setSessionValid(true);
            setAuthChecked(true);
            return;
          }
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
        
        // Third check: Try session endpoint
        try {
          const response = await axios.get('/api/auth/session-check', { 
            withCredentials: true,
            timeout: 5000 // 5 second timeout
          });
          
          if (response.data?.authenticated && response.data?.user) {
            console.log("👤 User found from session check:", response.data.user);
            setLocalUser(response.data.user);
            setSessionValid(true);
            // Store for future use
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            console.log("⚠️ No authenticated session found, proceeding as guest");
            setSessionValid(true); // Allow access even without authentication
          }
        } catch (err) {
          console.log("⚠️ Session check failed, proceeding as guest:", err);
          setSessionValid(true); // Allow access even if session check fails
        }
      } catch (err) {
        console.error("❌ Error during authentication check:", err);
      } finally {
        // Always mark auth as checked to proceed
        setAuthChecked(true);
        
        // Always load plans regardless of auth state
        loadPlansOnly();
      }
    };
    
    checkAuthentication();
  }, [user]);

  // Second useEffect to fetch subscription data when auth is checked
  useEffect(() => {
    if (authChecked) {
      const effectiveUser = user || localUser;
      console.log("👤 Auth checked, user state:", { user: effectiveUser, sessionValid });
      
      if (effectiveUser?.id) {
        fetchSubscriptionData(effectiveUser.id);
      }
    }
  }, [user, localUser, authChecked, sessionValid]);

  const fetchSubscriptionData = async (userId: number) => {
    console.log("📊 Fetching subscription data for user:", userId);
    
    try {
      setLoading(true);
      
      // Only fetch user-specific subscription if we have a user ID
      try {
        const subscriptionResult = await SubscriptionService.getCurrentSubscription(userId);
        console.log("🔑 User subscription:", subscriptionResult);
        
        if (subscriptionResult) {
          setCurrentPlan(subscriptionResult);
        } else {
          setCurrentPlan(null);
        }
      } catch (subErr) {
        console.error("❌ Error fetching subscription:", subErr);
        setAuthDebug(prev => ({ ...prev, subscriptionError: subErr }));
        // Don't set an error - this is an expected case for new users
      }
    } catch (err) {
      console.error('❌ Error in fetchSubscriptionData:', err);
      setAuthDebug(prev => ({ ...prev, fetchSubscriptionError: err }));
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    console.log("📊 Fetching all subscription data...");
    
    try {
      setLoading(true);
      setError(null);
      
      // Always fetch plans
      try {
        const plansResult = await SubscriptionService.getPlans();
        console.log("📋 Available plans:", plansResult);
        
        if (plansResult?.length > 0) {
          const sortedPlans = [...plansResult].sort((a, b) => a.price - b.price);
          const highlightIndex = sortedPlans.length === 2 ? 1 : Math.floor(sortedPlans.length / 2);
          
          const enhancedPlans = sortedPlans.map((plan, index) => ({
            ...plan,
            highlighted: index === highlightIndex
          }));
          
          setAvailablePlans(enhancedPlans);
        } else {
          setAvailablePlans([]);
        }
      } catch (planErr) {
        console.error("❌ Error fetching plans:", planErr);
        setError('Ocorreu um erro ao carregar os planos disponíveis. Por favor, verifique se o servidor backend está em execução.');
      }
      
      // Fetch user subscription if we have a user
      const effectiveUser = user || localUser;
      if (effectiveUser?.id) {
        await fetchSubscriptionData(effectiveUser.id);
      }
    } catch (err) {
      console.error('❌ Error fetching subscription data:', err);
      setError('Ocorreu um erro ao carregar os dados da assinatura. Por favor, verifique se o servidor backend está em execução.');
      setAuthDebug(prev => ({ ...prev, fetchDataError: err }));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentComplete = async (paymentMethod: string) => {
    const effectiveUser = user || localUser;
    if (!effectiveUser?.id || !selectedPlan) return;
    
    try {
      setLoading(true);
      
      const newSubscription = await SubscriptionService.createSubscription({
        userId: effectiveUser.id,
        planId: selectedPlan.id,
        paymentMethod
      });
      
      setCurrentPlan(newSubscription);
      setShowPaymentForm(false);
    } catch (error) {
      console.error('Error completing payment:', error);
      setError('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentPlan) return;
    
    try {
      setLoading(true);
      await SubscriptionService.cancelSubscription(currentPlan.id);
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError('Ocorreu um erro ao cancelar a assinatura. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };

  const handleRetry = () => {
    fetchData();
  };

  const handleLogin = () => {
    // Redirect to login page with return URL
    router.push(`/login?returnUrl=${encodeURIComponent('/subscription')}`);
  };

  // Show auth debugging panel in development
  const showDebugInfo = process.env.NODE_ENV === 'development';

  // If no authenticated user is detected
  if (!user && !sessionValid && authChecked && false) { // Added 'false' to always skip this block
    return (
      <div className={homeStyles.pageWrapper}>
        <Header />
        <div className={homeStyles.layoutContainer}>
          <Sidebar isAdmin={false} />
          <main className={`${homeStyles.mainContent} ${loaded ? homeStyles.loaded : ""}`}>
            <div className={homeStyles.contentHeader}>
              <h1 className={homeStyles.pageTitle}>Planos de Assinatura</h1>
              <p className={homeStyles.pageDescription}>
                Faça login para visualizar e gerenciar suas assinaturas
              </p>
            </div>
            
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 3H9C7.34315 3 6 4.34315 6 6V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V6C18 4.34315 16.6569 3 15 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.errorTitle}>Acesso Restrito</h2>
              <p className={styles.errorDescription}>
                Você precisa estar logado para acessar esta página.
              </p>
              <div className={styles.authActions}>
                <button 
                  onClick={handleLogin}
                  className={styles.retryButton}
                >
                  Fazer Login
                </button>
                
                <button 
                  onClick={() => {
                    setAuthChecked(false);
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }}
                  className={styles.retryButton}
                  style={{marginLeft: '10px'}}
                >
                  Verificar Login Novamente
                </button>
              </div>
              
              {/* Debug information in development */}
              {showDebugInfo && (
                <div className={styles.debugInfo}>
                  <h3>Auth Debug Info:</h3>
                  <pre>{JSON.stringify(authDebug, null, 2)}</pre>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show loading state before auth is checked
  if (!authChecked || loading) {
    return (
      <div className={homeStyles.pageWrapper}>
        <Header />
        <div className={homeStyles.layoutContainer}>
          <Sidebar isAdmin={false} />
          <main className={`${homeStyles.mainContent} ${loaded ? homeStyles.loaded : ""}`}>
            <div className={homeStyles.contentHeader}>
              <h1 className={homeStyles.pageTitle}>Planos de Assinatura</h1>
              <p className={homeStyles.pageDescription}>
                Carregando...
              </p>
            </div>
            
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>{!authChecked ? "Verificando sua sessão..." : "Carregando planos de assinatura..."}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Main content for authenticated users
  return (
    <div className={homeStyles.pageWrapper}>
      <Header />
      <div className={homeStyles.layoutContainer}>
        <Sidebar isAdmin={false} />
        <main className={`${homeStyles.mainContent} ${loaded ? homeStyles.loaded : ""}`}>
          <div className={homeStyles.contentHeader}>
            <h1 className={homeStyles.pageTitle}>Planos de Assinatura</h1>
            <p className={homeStyles.pageDescription}>
              Escolha o plano ideal para suas necessidades de desenvolvimento
            </p>
          </div>

          <div className={styles.container}>
            {error ? (
              <ErrorState 
                message={error} 
                onRetry={handleRetry} 
              />
            ) : (
              <>                {!showPaymentForm ? (
                  <>
                    {currentPlan && currentPlan.id && currentPlan.planId && (
                      <SubscriptionDetails 
                        subscription={currentPlan} 
                        onCancelSubscription={handleCancelSubscription}
                      />
                    )}

                    {availablePlans.length > 0 ? (
                      <SubscriptionPlans 
                        plans={availablePlans}
                        currentPlanId={currentPlan?.planId}
                        onSelectPlan={handleSelectPlan}
                      />
                    ) : (
                      <div className={styles.noPlansContainer}>
                        <div className={styles.noPlansIcon}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h2 className={styles.noPlansTitle}>Nenhum plano disponível</h2>
                        <p className={styles.noPlansDescription}>
                          No momento não há planos de assinatura disponíveis. Por favor, tente novamente mais tarde ou entre em contato com o suporte.
                        </p>
                        <button 
                          className={styles.retryButton}
                          onClick={handleRetry}
                        >
                          Tentar novamente
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <PaymentForm 
                    plan={selectedPlan!} 
                    onComplete={handlePaymentComplete}
                    onCancel={handleCancelPayment}
                  />
                )}
              </>
            )}
            
            {/* Debug information in development */}
            {showDebugInfo && (
              <div className={styles.debugInfo}>
                <h3>Auth Debug Info:</h3>
                <pre>{JSON.stringify(authDebug, null, 2)}</pre>
                <h3>User Info:</h3>
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
