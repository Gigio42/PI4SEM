import api from '@/services/api';
import { Plan, Subscription } from '@/types/subscription';

export class SubscriptionService {
  static async getPlans(): Promise<Plan[]> {
    try {
      // Fix the endpoint to match the actual backend URL structure
      const response = await api.get('/subscriptions/plans?onlyActive=true');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching plans:', error);
      
      // Instead of throwing the error, return an empty array to prevent UI errors
      return [];
    }
  }

  static async getPlanById(planId: number): Promise<Plan> {
    try {
      const response = await api.get(`/subscriptions/plans/${planId}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching plan ${planId}:`, error);
      throw error;
    }
  }

  static async getCurrentSubscription(userId: number): Promise<Subscription | null> {
    try {
      const response = await api.get(`/subscriptions/user/${userId}`);
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
        status: true,
        type: plan.name.toLowerCase(),
        paymentMethod: subscriptionData.paymentMethod,
        paymentStatus: 'paid'
      });
      
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await api.patch(`/subscriptions/${subscriptionId}/cancel`);
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
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }
}
