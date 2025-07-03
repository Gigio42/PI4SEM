import api from '@/services/api';
import { Plan, Subscription } from '@/types/subscription';

// Helper to ensure API calls have the authorization token
const getAuthHeader = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export class SubscriptionService {  static async getPlans(): Promise<Plan[]> {
    try {
      console.log('SubscriptionService: Fetching plans...');
      
      // Include auth headers in the request
      const response = await api.get('/subscriptions/plans?onlyActive=true', {
        headers: getAuthHeader(),
        timeout: 15000 // Aumentando o timeout para 15 segundos
      });
      
      console.log('SubscriptionService: Plans response received:', response.status, response.data);
      
      if (!response.data) {
        console.warn('SubscriptionService: No data in response');
        return [];
      }
      
      // Handle both array and object responses
      let plansData = response.data;
      if (!Array.isArray(plansData)) {
        console.warn('SubscriptionService: Response is not an array:', plansData);
        // If it's an object with a plans property, use that
        if (plansData.plans && Array.isArray(plansData.plans)) {
          plansData = plansData.plans;
        } else {
          return [];
        }
      }
      
      // Validação adicional para garantir que temos dados válidos
      if (!plansData || plansData.length === 0) {
        console.warn('SubscriptionService: No plans data found');
        return [];
      }
      
      // Ensure each plan has the features property as an array
      const plans = plansData.map((plan: any) => {
        console.log('Processing plan:', plan);
        return {
          ...plan,
          // Handle different feature formats
          features: this.normalizeFeatures(plan.features),
          // Map backend field to frontend field for consistency
          duration: plan.durationDays || plan.duration || 30,
          active: plan.isActive !== undefined ? plan.isActive : (plan.active !== undefined ? plan.active : true)
        };
      });
      
      console.log('SubscriptionService: Processed plans:', plans);
      return plans;
    } catch (error: unknown) {
      console.error('SubscriptionService: Error fetching plans:', error);
      
      // Log the full error for debugging
      if (error && typeof error === 'object') {
        const axiosError = error as any;
        console.error('SubscriptionService: Full error details:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          config: axiosError.config
        });
      }
      
      // Instead of throwing the error, return an empty array to prevent UI errors
      return [];
    }
  }

  private static normalizeFeatures(features: any): string[] {
    if (Array.isArray(features)) {
      return features;
    }
    
    if (typeof features === 'string') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // If JSON parsing fails, split by comma
        return features.split(',').map((f: string) => f.trim()).filter(Boolean);
      }
    }
    
    return [];
  }

  static async getPlanById(planId: number): Promise<Plan> {
    try {
      const response = await api.get(`/subscriptions/plans/${planId}`, {
        headers: getAuthHeader(),
        timeout: 10000
      });
      
      const plan = response.data;
      return {
        ...plan,
        features: this.normalizeFeatures(plan.features),
        duration: plan.durationDays || plan.duration || 30,
        active: plan.isActive !== undefined ? plan.isActive : plan.active !== undefined ? plan.active : true
      };
    } catch (error: unknown) {
      console.error(`SubscriptionService: Error fetching plan ${planId}:`, error);
      throw error;
    }
  }

  static async getCurrentSubscription(userId: number): Promise<Subscription | null> {
    try {
      const response = await api.get(`/subscriptions/user/${userId}`, {
        headers: getAuthHeader(),
        timeout: 10000
      });
      
      const subscriptions = response.data;
      
      // If response is an array, find the active subscription
      if (Array.isArray(subscriptions)) {
        const activeSubscription = subscriptions.find(sub => sub.status === 'ACTIVE');
        return activeSubscription || null;
      }
      
      // If response is a single subscription
      return subscriptions || null;
    } catch (error: unknown) {
      // Type guard for response error
      const axiosError = error as { response?: { status?: number } };
      
      // If 404 is returned, the user has no subscription
      if (axiosError.response && axiosError.response.status === 404) {
        return null;
      }
      console.error('SubscriptionService: Error fetching user subscription:', error);
      // Return null instead of throwing to prevent UI errors
      return null;
    }
  }
  static async createSubscription(subscriptionData: {
    userId: number;
    planId: number;
    paymentMethod: string;
  }): Promise<Subscription> {
    try {
      console.log('SubscriptionService: Creating subscription...', subscriptionData);
      
      // Calculate dates
      const startDate = new Date();
      const plan = await this.getPlanById(subscriptionData.planId);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration);

      const response = await api.post('/subscriptions', {
        userId: subscriptionData.userId,
        planId: subscriptionData.planId,
        startDate,
        endDate,
        status: 'ACTIVE',
        paymentMethod: subscriptionData.paymentMethod
      }, {
        headers: getAuthHeader()
      });
      
      console.log('SubscriptionService: Subscription created successfully:', response.data);
      
      // Atualizar cache local para refletir que o usuário tem uma assinatura ativa
      if (typeof window !== 'undefined') {
        // Definir flags para forçar recarregamento dos dados
        localStorage.setItem('forceRefreshSubscription', 'true');
        localStorage.setItem('forceRefreshComponents', 'true');
        
        // Atualizar status de assinatura imediatamente no cache local
        localStorage.setItem('userHasActiveSubscription', 'true');
        localStorage.setItem('subscriptionStatusTime', Date.now().toString());
        
        // Atualizar também os dados da assinatura para uso futuro
        try {
          localStorage.setItem('userSubscription', JSON.stringify({
            id: response.data.id,
            planId: response.data.planId,
            userId: response.data.userId,
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            status: 'ACTIVE'
          }));
        } catch (cacheError) {
          console.error('Error saving subscription to cache:', cacheError);
        }
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await api.patch(`/subscriptions/${subscriptionId}/cancel`, {}, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  static async renewSubscription(subscriptionId: number, planId: number): Promise<Subscription> {
    try {
      const plan = await this.getPlanById(planId);
      const response = await api.patch(`/subscriptions/${subscriptionId}/renew`, {
        duration: plan.duration
      }, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }  static async checkUserHasActiveSubscription(userId: number): Promise<boolean> {
    try {
      console.log('SubscriptionService: Checking subscription status for user:', userId);
      
      if (!userId) {
        console.log('SubscriptionService: No userId provided, returning false');
        return false;
      }
      
      // Verificar se há uma flag para forçar o recarregamento do status de assinatura
      const forceRefresh = localStorage.getItem('forceRefreshSubscription') === 'true';
      if (forceRefresh) {
        // Limpar a flag após usar
        localStorage.removeItem('forceRefreshSubscription');
        console.log('SubscriptionService: Force refresh subscription status detected');
      }
      
      // Primeiro, verificar cache no localStorage
      if (typeof window !== 'undefined' && !forceRefresh) {
        const cachedStatus = localStorage.getItem('userHasActiveSubscription');
        const cacheTime = localStorage.getItem('subscriptionStatusTime');
        
        // Se temos um cache recente (menos de 2 minutos), retornamos o valor cacheado
        if (cachedStatus && cacheTime) {
          const cacheAge = Date.now() - parseInt(cacheTime);
          if (cacheAge < 2 * 60 * 1000) { // 2 minutos em milissegundos
            console.log('SubscriptionService: Using cached status:', cachedStatus === 'true');
            return cachedStatus === 'true';
          }
        }
      }
      
      // Se não temos cache ou está desatualizado, fazemos a chamada API
      const response = await api.get(`/subscriptions/user/${userId}/has-active`, {
        headers: getAuthHeader(),
        timeout: 10000 // Aumentando o timeout para garantir resposta em redes lentas
      });
      
      console.log('SubscriptionService: Subscription check response:', response.data);
      const hasSubscription = response.data?.hasActiveSubscription === true;
      
      // Salvar o resultado em cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('userHasActiveSubscription', hasSubscription ? 'true' : 'false');
        localStorage.setItem('subscriptionStatusTime', Date.now().toString());
      }
      
      return hasSubscription;
    } catch (error: any) { // Usando any para obter acesso aos campos específicos do Axios
      console.error('SubscriptionService: Error checking subscription status:', error);
      
      // Adicionando detalhes sobre o erro para debug
      if (error.response) {
        console.error('SubscriptionService: Error response details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('SubscriptionService: No response received, request details:', {
          url: error.request.url,
          method: error.request.method
        });
      }
      
      // Em caso de erro, verificar se temos um valor cacheado e retornar
      if (typeof window !== 'undefined') {
        const cachedStatus = localStorage.getItem('userHasActiveSubscription');
        if (cachedStatus) {
          console.log('SubscriptionService: Using cached status due to API error:', cachedStatus === 'true');
          return cachedStatus === 'true';
        }
      }
      
      return false;
    }
  }
}
