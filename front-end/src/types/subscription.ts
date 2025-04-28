/**
 * Represents a subscription plan
 */
export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // Equivalente a durationDays no backend
  features: string[];
  active: boolean; // Equivalente a isActive no backend
  highlighted?: boolean; // Campo apenas para UI
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a user's subscription
 */
export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: string; // 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'
  cancelDate?: string;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

/**
 * Data required to create a new subscription
 */
export interface CreateSubscriptionDto {
  userId: number;
  planId: number;
  paymentMethod?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
  transactionId?: string;
}
