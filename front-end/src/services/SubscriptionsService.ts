import { apiBaseUrl } from './config';

// Types for the service
export interface PlanType {
  id: number;
  name: string;
  description: string;
  price: number | string;
  duration: number;
  features: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionType {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: boolean;
  userId: number;
  planId: number;
  paymentMethod: string;
  paymentStatus: string;
  nextPaymentDate: string;
  canceledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    picture?: string;
  };
  plan?: PlanType;
}

export interface PaymentType {
  id: number;
  subscriptionId: number;
  amount: number | string;
  status: string;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

class SubscriptionsServiceClass {
  // === Plans API ===
  
  async getPlans(onlyActive = true) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans?onlyActive=${onlyActive}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error fetching plans');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  async getPlanById(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching plan ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching plan ${id}:`, error);
      throw error;
    }
  }

  async createPlan(planData: Omit<PlanType, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error creating plan');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  async updatePlan(id: number, planData: Partial<PlanType>) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error updating plan ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating plan ${id}:`, error);
      throw error;
    }
  }

  async togglePlanStatus(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}/toggle`, {
        method: 'PATCH'
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

  async getAllSubscriptions(status?: boolean) {
    try {
      const url = status !== undefined 
        ? `${apiBaseUrl}/subscriptions?status=${status}` 
        : `${apiBaseUrl}/subscriptions`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error fetching subscriptions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/user/${userId}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching subscription for user ${userId}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user subscription ${userId}:`, error);
      throw error;
    }
  }

  async getSubscriptionById(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching subscription ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw error;
    }
  }

  async createSubscription(subscriptionData: any) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || 'Error creating subscription');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: number, updateData: any) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error updating subscription ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw error;
    }
  }

  async cancelSubscription(id: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}/cancel`, {
        method: 'PATCH'
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
        headers: {
          'Content-Type': 'application/json'
        },
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
        headers: {
          'Content-Type': 'application/json'
        },
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
      const response = await fetch(`${apiBaseUrl}/subscriptions/${subscriptionId}/payments`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        throw new Error(error.message || `Error fetching payments for subscription ${subscriptionId}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching payments for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }
}

export const subscriptionsService = new SubscriptionsServiceClass();
