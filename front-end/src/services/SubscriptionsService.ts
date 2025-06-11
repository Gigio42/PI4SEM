import { apiBaseUrl } from './config';

export interface SubscriptionType {
  id: number;
  userId: number;
  planId: number;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  plan?: PlanType;
  payments?: PaymentType[];
}

export interface PlanType {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentType {
  id: number;
  subscriptionId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  userId: number;
  planId: number;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionData {
  status?: 'active' | 'inactive' | 'cancelled' | 'expired';
  autoRenew?: boolean;
  endDate?: string;
}

export interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  features?: string[];
  isActive?: boolean;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

class SubscriptionsService {
  private baseUrl = `${apiBaseUrl}/subscriptions`;

  // Subscription methods
  async getAllSubscriptions(): Promise<SubscriptionType[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  async getSubscriptionById(id: number): Promise<SubscriptionType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  async createSubscription(data: CreateSubscriptionData): Promise<SubscriptionType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: number, data: UpdateSubscriptionData): Promise<SubscriptionType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  async deleteSubscription(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  // Plan methods
  async getAllPlans(): Promise<PlanType[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  async getPlanById(id: number): Promise<PlanType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/plans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  async createPlan(data: CreatePlanData): Promise<PlanType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  async updatePlan(id: number, data: UpdatePlanData): Promise<PlanType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  async deletePlan(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Payment methods
  async getSubscriptionPayments(subscriptionId: number): Promise<PaymentType[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${subscriptionId}/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async getAllPayments(): Promise<PaymentType[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Statistics methods
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  }

  // Utility methods
  async renewSubscription(id: number): Promise<SubscriptionType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${id}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to renew subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(id: number): Promise<SubscriptionType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(id: number): Promise<SubscriptionType> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${id}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }
}

// Export the service instance (lowercase for the import error)
export const subscriptionsService = new SubscriptionsService();
