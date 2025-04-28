import api from '@/services/api';
import { Plan, Subscription } from '@/types/subscription';

// Helper to ensure API calls have the authorization token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export class SubscriptionService {  static async getPlans(): Promise<Plan[]> {
    try {
      // Include auth headers in the request
      const response = await api.get('/subscriptions/plans?onlyActive=true', {
        headers: getAuthHeader()
      });
      
      // Garante que cada plano tenha a propriedade features como um array
      const plans = response.data.map((plan: any) => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : 
                 (typeof plan.features === 'string' ? plan.features.split(',').map((f: string) => f.trim()) : [])
      }));
      
      return plans;
    } catch (error: unknown) {
      console.error('Error fetching plans:', error);
      
      // Instead of throwing the error, return an empty array to prevent UI errors
      return [];
    }
  }

  static async getPlanById(planId: number): Promise<Plan> {
    try {
      const response = await api.get(`/subscriptions/plans/${planId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching plan ${planId}:`, error);
      throw error;
    }
  }

  static async getCurrentSubscription(userId: number): Promise<Subscription | null> {
    try {
      const response = await api.get(`/subscriptions/user/${userId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: unknown) {
      // Type guard for response error
      const axiosError = error as { response?: { status?: number } };
      
      // If 404 is returned, the user has no subscription
      if (axiosError.response && axiosError.response.status === 404) {
        return null;
      }
      console.error('Error fetching user subscription:', error);
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
