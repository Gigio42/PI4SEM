import { apiBaseUrl } from './config';

// Tipos para planos
export interface PlanType {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos para assinaturas
export interface SubscriptionType {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: boolean;
  userId: number;
  planId?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  nextPaymentDate?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    email: string;
    name: string;
    picture: string;
  };
  plan?: PlanType;
  payments?: PaymentType[];
}

// Tipos para pagamentos
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

// Serviço para gerenciar assinaturas
export class SubscriptionsService {
  // === PLANOS ===
  async getPlans(onlyActive = true): Promise<PlanType[]> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans?onlyActive=${onlyActive}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || 'Erro ao buscar planos');
      }
      
      // Check if response is empty
      const text = await response.text();
      if (!text || text.trim() === '') {
        return [];
      }
      
      // Try to parse the response as JSON
      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Resposta inválida do servidor ao buscar planos');
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }
  }

  async getPlanById(id: number): Promise<PlanType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao buscar plano ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar plano ${id}:`, error);
      throw error;
    }
  }

  async createPlan(planData: Omit<PlanType, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || 'Erro ao criar plano');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  }

  async updatePlan(id: number, planData: Partial<PlanType>): Promise<PlanType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao atualizar plano ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar plano ${id}:`, error);
      throw error;
    }
  }

  async togglePlanStatus(id: number): Promise<PlanType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/plans/${id}/toggle`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao alternar status do plano ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao alternar status do plano ${id}:`, error);
      throw error;
    }
  }

  // === ASSINATURAS ===
  async getUserSubscription(userId: number): Promise<SubscriptionType | null> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/user/${userId}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao buscar assinatura do usuário ${userId}`);
      }
      
      // Check if response is empty
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }
      
      // Try to parse the response as JSON
      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error('Invalid JSON response:', text);
        throw new Error(`Resposta inválida do servidor para usuário ${userId}`);
      }
    } catch (error) {
      console.error(`Erro ao buscar assinatura do usuário ${userId}:`, error);
      throw error;
    }
  }

  async createSubscription(subscriptionData: {
    userId: number;
    planId: number;
    paymentMethod: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SubscriptionType> {
    try {
      // Se não houver datas, calcula com base no plano (deve ser implementado após a migração)
      const startDate = subscriptionData.startDate || new Date();
      let endDate = subscriptionData.endDate;

      if (!endDate) {
        // Busca a duração do plano e calcula a data de término
        const plan = await this.getPlanById(subscriptionData.planId);
        if (plan) {
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + plan.duration);
        } else {
          // Se não conseguir buscar o plano, usa um período padrão de 30 dias
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);
        }
      }

      const payload = {
        ...subscriptionData,
        startDate,
        endDate,
        status: true,
      };

      const response = await fetch(`${apiBaseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || 'Erro ao criar assinatura');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }

  async getAllSubscriptions(status?: boolean): Promise<SubscriptionType[]> {
    try {
      const url = status !== undefined 
        ? `${apiBaseUrl}/subscriptions?status=${status}` 
        : `${apiBaseUrl}/subscriptions`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || 'Erro ao buscar assinaturas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  }

  async getSubscriptionById(id: number): Promise<SubscriptionType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao buscar assinatura ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar assinatura ${id}:`, error);
      throw error;
    }
  }

  async cancelSubscription(id: number): Promise<SubscriptionType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}/cancel`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao cancelar assinatura ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao cancelar assinatura ${id}:`, error);
      throw error;
    }
  }

  async renewSubscription(id: number, duration: number): Promise<SubscriptionType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${id}/renew`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao renovar assinatura ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao renovar assinatura ${id}:`, error);
      throw error;
    }
  }

  // === PAGAMENTOS ===
  async registerPayment(
    subscriptionId: number, 
    amount: number, 
    paymentMethod: string
  ): Promise<PaymentType> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${subscriptionId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, paymentMethod }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao registrar pagamento para assinatura ${subscriptionId}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao registrar pagamento para assinatura ${subscriptionId}:`, error);
      throw error;
    }
  }

  async getPaymentsBySubscription(subscriptionId: number): Promise<PaymentType[]> {
    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/${subscriptionId}/payments`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `Erro ao buscar pagamentos da assinatura ${subscriptionId}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar pagamentos da assinatura ${subscriptionId}:`, error);
      throw error;
    }
  }
}

export const subscriptionsService = new SubscriptionsService();
