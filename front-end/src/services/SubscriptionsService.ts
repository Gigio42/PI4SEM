import { apiBaseUrl } from '@/services/config';
import { Plan, Subscription, CreateSubscriptionDto } from '@/types/subscription';

// Define and export types needed for components using this service
export interface PlanType extends Plan {}

export interface SubscriptionType extends Subscription {
  user?: {
    id: number;
    name?: string;
    email?: string;
  };
}

export interface PaymentType {
  id: number;
  subscriptionId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

// This interface is for internal use in this file
interface PlanTypeInternal {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string | string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class SubscriptionsServiceClass {
  // Improved server-side rendering detection method
  private isServer() {
    return typeof window === 'undefined';
  }

  // Enhanced getAuthHeaders to handle missing tokens gracefully
  private getAuthHeaders(isAdminOperation = false) {
    // If in server environment, return just the content-type header
    if (this.isServer()) {
      return {
        'Content-Type': 'application/json'
      };
    }

    let token = null;
    
    try {
      // Safe localStorage access
      token = localStorage.getItem('token');
      
      // Fallback options for token retrieval especially for admin operations
      if (!token && isAdminOperation) {
        // Try to get from session storage
        token = sessionStorage.getItem('token');
        
        // Try to get from cookie
        if (!token) {
          try {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name === 'token' || name === 'auth_token') {
                token = value;
                break;
              }
            }
          } catch (error) {
            console.warn('Error accessing cookies:', error);
          }
        }
        
        // For admin, try getting from the user object if available
        if (!token) {
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              if (user && typeof user.token === 'string') {
                token = user.token;
                // Save token for future use
                if (token) {
                  localStorage.setItem('token', token);
                }
              }
            }
          } catch (error) {
            console.warn('Error accessing user data:', error);
          }
        }
      }
    } catch (error) {
      console.warn('Error retrieving authentication token:', error);
    }

    // Even if token is not found, return headers with Content-Type
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }
  // Enhanced fetch method with error handling and SSR safety
  private async safeFetch(url: string, options: RequestInit = {}) {
    // Skip API calls during SSR to avoid fetch errors
    if (this.isServer()) {
      console.log('Skipping fetch in server environment:', url);
      return new Response(JSON.stringify([]), {
        headers: {
          'content-type': 'application/json'
        },
        status: 200
      });
    }

    try {
      console.log(`Making request to: ${url}`, { 
        method: options.method || 'GET',
        withCredentials: options.credentials === 'include'
      });
      
      // For development environment, use the proxy if URL is absolute
      const isProduction = process.env.NODE_ENV === 'production';
      let effectiveUrl = url;
      
      if (!isProduction && url.startsWith('http')) {
        // Convert absolute URL to relative for proxy
        try {
          const urlObj = new URL(url);
          // Use the path portion for the proxy
          effectiveUrl = `/api${urlObj.pathname}${urlObj.search}`;
          console.log(`Using proxy URL instead: ${effectiveUrl}`);
        } catch (e) {
          console.warn('Failed to parse URL for proxy, using original:', url);
        }
      }
      
      return await fetch(effectiveUrl, {
        ...options,
        // Always include these options for CORS
        credentials: 'include',
        headers: {
          ...options.headers,
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      console.error(`Network error fetching ${url}:`, error);
      // Provide more helpful error message for CORS issues
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('This appears to be a CORS or network connectivity issue.');
      }
      throw error;
    }
  }

  // === Plans API ===
    // Enhanced getPlans method to handle missing tokens gracefully
  async getPlans(onlyActive = true) {
    try {
      const url = `${apiBaseUrl}/subscriptions/plans?onlyActive=${onlyActive}`;
      console.log('Fetching plans from URL:', url);
      
      const response = await this.safeFetch(url, {
        headers: this.getAuthHeaders(),
        credentials: 'include' // Importante para enviar cookies de autenticação
      });
      
      if (!response.ok) {
        // Special handling for auth errors (401/403)
        if (response.status === 401 || response.status === 403) {
          console.warn('Authentication required for fetching plans. Returning empty array.');
          return [];
        }
        
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error fetching plans');
      }
      
      const plans = await response.json();
      console.log('Raw plans from API:', plans);
      
      if (!Array.isArray(plans)) {
        console.warn('API returned non-array response for plans:', plans);
        return [];
      }
      
      // Map backend field names to frontend field names
      return plans.map((plan: any) => ({
        ...plan,
        active: plan.isActive, // Map isActive to active
        duration: plan.durationDays, // Map durationDays to duration
        features: Array.isArray(plan.features) ? plan.features : 
                 (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])
      }));
    } catch (error) {
      console.error('Error fetching plans:', error);
      
      // Return empty array for any network or auth error
      if (error instanceof TypeError || 
          (error instanceof Error && 
           (error.message.includes('Failed to fetch') || 
            error.message.includes('Network Error') ||
            error.message.includes('No token provided')))) {
        console.warn('Network or token error when fetching plans. Returning empty array.');
        return [];
      }
      
      // Return empty array for all errors to prevent UI breakage
      return [];
    }
  }

  async getPlanById(id: number) {
    try {
      const response = await this.safeFetch(`${apiBaseUrl}/subscriptions/plans/${id}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching plan ${id}`);
      }
      const plan = await response.json();
      
      // Map backend field names to frontend field names
      return {
        ...plan,
        active: plan.isActive, // Map isActive to active
        duration: plan.durationDays, // Map durationDays to duration
        features: Array.isArray(plan.features) ? plan.features : 
                 (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])
      };
    } catch (error) {
      console.error(`Error fetching plan ${id}:`, error);
      throw error;
    }
  }

  async createPlan(planData: Omit<PlanTypeInternal, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      // Ensure the duration value is present and positive
      const duration = planData.duration || 30; // Default to 30 days if missing
      
      // Transform frontend model to match backend schema
      const backendPlanData = {
        name: planData.name,
        description: planData.description,
        price: planData.price,
        duration: duration, // Backend will map this to durationDays
        features: Array.isArray(planData.features) ? planData.features : 
                 (typeof planData.features === 'string' ? JSON.parse(planData.features) : []),
        isActive: planData.active // Map active to isActive
      };
      
      console.log('Creating plan with data:', backendPlanData);
      
      // Mark this as an admin operation to try all token fallbacks
      const headers = this.getAuthHeaders(true);
      
      // Skip sensitive data when logging headers
      const logHeaders = {...headers};
      if (logHeaders.Authorization) {
        logHeaders.Authorization = logHeaders.Authorization.substring(0, 10) + '...';
      }
      console.log('Creating plan with auth headers:', logHeaders);
      
      // Add credentials:include to ensure cookies are sent
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(backendPlanData),
        credentials: 'include' // Include cookies in the request
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Special handling for authentication errors
          throw new Error('Admin authentication required to create plans. Please login with an admin account.');
        }
        
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error creating plan');
      }
      
      const plan = await response.json();
      
      // Map backend field names to frontend field names
      return {
        ...plan,
        active: plan.isActive,
        duration: plan.durationDays,
        features: Array.isArray(plan.features) ? plan.features : 
                 (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])
      };
    } catch (error) {
      console.error('Error creating plan:', error);
      
      // Provide more helpful error message for auth issues
      if (error instanceof Error) {
        if (error.message.includes('authentication') || 
            error.message.includes('auth') || 
            error.message.includes('token') || 
            error.message.includes('401') || 
            error.message.includes('403')) {
          throw new Error('Authentication error: Please login as an administrator to create plans.');
        }
      }
      
      throw error;
    }
  }

  async updatePlan(id: number, planData: Partial<PlanType>) {
    try {
      // Transform frontend model to match backend schema
      const backendPlanData: any = { ...planData };
      
      // Mapear campos do frontend para o backend
      if ('active' in backendPlanData) {
        backendPlanData.isActive = backendPlanData.active;
        delete backendPlanData.active;
      }
      
      if ('duration' in backendPlanData) {
        // O backend vai mapear 'duration' para 'durationDays' automaticamente
        // Não precisamos converter aqui
      }
      
      console.log(`Updating plan ${id} with data:`, backendPlanData);
      
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(true),
        body: JSON.stringify(backendPlanData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Admin authentication required to update plans. Please login with an admin account.');
        }
        
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error updating plan ${id}`);
      }
      
      const plan = await response.json();
      
      // Map backend field names to frontend field names
      return {
        ...plan,
        active: plan.isActive,
        duration: plan.durationDays,
        features: Array.isArray(plan.features) ? plan.features : 
                 (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])
      };
    } catch (error) {
      console.error(`Error updating plan ${id}:`, error);
      throw error;
    }
  }

  async togglePlanStatus(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}/toggle`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(true), // Mark as admin operation
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error toggling plan status ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error toggling plan status ${id}:`, error);
      throw error;
    }
  }
  // === Subscriptions API ===
  async getAllSubscriptions(status?: string | boolean) {
    try {
      // Converter status boolean para string ACTIVE/CANCELLED se necessário
      let statusParam = status;
      if (typeof status === 'boolean') {
        statusParam = status ? 'ACTIVE' : 'CANCELLED';
      }
      
      const url = statusParam !== undefined 
        ? `${apiBaseUrl}/subscriptions?status=${statusParam}` 
        : `${apiBaseUrl}/subscriptions`;
      
      console.log('Fetching subscriptions from URL:', url);
      
      // Use safeFetch instead of direct fetch for better error handling
      const response = await this.safeFetch(url, {
        headers: this.getAuthHeaders(),
        credentials: 'include' // Importante para enviar cookies de autenticação
      });
      
      if (!response.ok) {
        // Special case for 401/403 authentication errors
        if (response.status === 401 || response.status === 403) {
          console.warn('Authentication required for fetching subscriptions. Returning empty array.');
          return [];
        }
        
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error fetching subscriptions');
      }
      
      const subscriptions = await response.json();
      console.log('Raw subscriptions from API:', subscriptions);
      
      if (!Array.isArray(subscriptions)) {
        console.warn('API returned non-array response for subscriptions:', subscriptions);
        return [];
      }
      
      // Map backend subscription data to frontend format
      return subscriptions.map((sub: any) => {
        // Process plan data if it exists
        const plan = sub.plan ? {
          ...sub.plan,
          active: sub.plan.isActive,
          duration: sub.plan.durationDays,
          features: Array.isArray(sub.plan.features) ? sub.plan.features :
                   (typeof sub.plan.features === 'string' ? JSON.parse(sub.plan.features) : [])
        } : null;
        
        // Map database field names to frontend field names
        return {
          ...sub,
          // Convert string 'ACTIVE'/'CANCELLED' to boolean
          status: sub.status === 'ACTIVE',
          // Map cancelDate to canceledAt if it exists
          canceledAt: sub.cancelDate,
          plan: plan
        };
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Return empty array instead of throwing to prevent UI errors
      if (error instanceof TypeError || 
          (error instanceof Error && 
           (error.message.includes('No token provided') || 
            error.message.includes('Failed to fetch')))) {
        console.warn('Network or token error when fetching subscriptions. Returning empty array.');
        return [];
      }
      // For other errors, also return empty array to avoid breaking the UI
      return [];
    }
  }

  async getUserSubscription(userId: number) {
    try {
      const response = await this.safeFetch(`${apiBaseUrl}/subscriptions/user/${userId}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        // Handle 404 specifically - user has no subscription
        if (response.status === 404) {
          return null;
        }
        
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching subscription for user ${userId}`);
      }
      
      const subscription = await response.json();
      
      // Map backend fields to frontend fields
      return {
        ...subscription,
        status: subscription.status === 'ACTIVE',
        canceledAt: subscription.cancelDate,
        plan: subscription.plan ? {
          ...subscription.plan,
          active: subscription.plan.isActive,
          duration: subscription.plan.durationDays,
          features: Array.isArray(subscription.plan.features) ? subscription.plan.features :
                   (typeof subscription.plan.features === 'string' ? JSON.parse(subscription.plan.features) : [])
        } : null
      };
    } catch (error) {
      console.error(`Error fetching user subscription ${userId}:`, error);
      // Return null instead of throwing for better user experience
      return null;
    }
  }

  async getSubscriptionById(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching subscription ${id}`);
      }
      
      const subscription = await response.json();
      
      // Map backend field names to frontend field names
      return {
        ...subscription,
        status: subscription.status === 'ACTIVE',
        canceledAt: subscription.cancelDate,
        plan: subscription.plan ? {
          ...subscription.plan,
          active: subscription.plan.isActive,
          duration: subscription.plan.durationDays,
          features: Array.isArray(subscription.plan.features) ? subscription.plan.features :
                   (typeof subscription.plan.features === 'string' ? JSON.parse(subscription.plan.features) : [])
        } : null
      };
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw error;
    }
  }

  async createSubscription(subscriptionData: any) {
    try {
      // Ajustar dados para o formato esperado pelo backend
      const adjustedData = {
        ...subscriptionData,
        // Garantir que os campos boolean são enviados corretamente
        status: subscriptionData.status === true ? 'ACTIVE' : 'CANCELLED'
      };
      
      console.log('Creating subscription with data:', adjustedData);
      
      const response = await fetch(`${apiBaseUrl}/subscriptions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(adjustedData)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error creating subscription');
      }
      
      const subscription = await response.json();
      
      // Mapear campos do backend para o frontend
      return {
        ...subscription,
        status: subscription.status === 'ACTIVE',
        canceledAt: subscription.cancelDate,
        plan: subscription.plan ? {
          ...subscription.plan,
          active: subscription.plan.isActive,
          duration: subscription.plan.durationDays,
          features: Array.isArray(subscription.plan.features) ? subscription.plan.features :
                   (typeof subscription.plan.features === 'string' ? JSON.parse(subscription.plan.features) : [])
        } : null
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: number, updateData: any) {
    try {
      // Ajustar dados para o formato esperado pelo backend
      const adjustedData = { ...updateData };
      
      // Converter status boolean para string se existir
      if (typeof adjustedData.status === 'boolean') {
        adjustedData.status = adjustedData.status ? 'ACTIVE' : 'CANCELLED';
      }
      
      console.log(`Updating subscription ${id} with data:`, adjustedData);
      
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(adjustedData)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error updating subscription ${id}`);
      }
      
      const subscription = await response.json();
      
      // Mapear campos do backend para o frontend
      return {
        ...subscription,
        status: subscription.status === 'ACTIVE',
        canceledAt: subscription.cancelDate,
        plan: subscription.plan ? {
          ...subscription.plan,
          active: subscription.plan.isActive,
          duration: subscription.plan.durationDays,
          features: Array.isArray(subscription.plan.features) ? subscription.plan.features :
                   (typeof subscription.plan.features === 'string' ? JSON.parse(subscription.plan.features) : [])
        } : null
      };
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw error;
    }
  }

  async cancelSubscription(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}/cancel`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error canceling subscription ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error canceling subscription ${id}:`, error);
      throw error;
    }
  }

  async renewSubscription(id: number, duration: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}/renew`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ duration })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error renewing subscription ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error renewing subscription ${id}:`, error);
      throw error;
    }
  }

  // === Payments API ===

  async registerPayment(subscriptionId: number, amount: number, paymentMethod: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${subscriptionId}/payment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amount, paymentMethod })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error registering payment for subscription ${subscriptionId}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error registering payment for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  async getPaymentsBySubscription(subscriptionId: number) {
    try {
      const url = `${apiBaseUrl}/subscriptions/${subscriptionId}/payments`;
      console.log('Fetching payment history from URL:', url);
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        credentials: 'include' // Importante para enviar cookies de autenticação
      });
      
      if (!response.ok) {
        // Retornar array vazio para erro 404 (sem pagamentos)
        if (response.status === 404) {
          console.warn(`No payments found for subscription ${subscriptionId}`);
          return [];
        }
        
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching payments for subscription ${subscriptionId}`);
      }
      
      const payments = await response.json();
      console.log('Raw payments from API:', payments);
      
      if (!Array.isArray(payments)) {
        console.warn('API returned non-array response for payments:', payments);
        return [];
      }
      
      // Garantir que todos os campos necessários estejam presentes
      return payments.map((payment: any) => ({
        ...payment,
        // Certificar que o status está no formato correto
        status: payment.status || 'PAID',
        // Formatar data se necessário
        paymentDate: payment.paymentDate || new Date().toISOString()
      }));
    } catch (error) {
      console.error(`Error fetching payments for subscription ${subscriptionId}:`, error);
      // Retornar array vazio em vez de lançar erro para evitar quebrar a UI
      return [];
    }
  }
}

export const subscriptionsService = new SubscriptionsServiceClass();
