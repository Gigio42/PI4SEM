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

export class SubscriptionService {
  static async getPlans(): Promise<Plan[]> {
    try {
      console.log('SubscriptionService: Fetching plans...');
      
      // Include auth headers in the request
      const response = await api.get('/subscriptions/plans?onlyActive=true', {
        headers: getAuthHeader(),
        timeout: 10000 // 10 second timeout
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
  }
}
