/**
 * Represents a subscription plan
 */
export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  active: boolean;
  highlighted?: boolean;
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
  type: string;
  startDate: string;
  endDate: string;
  nextPaymentDate?: string;
  status: boolean;
  paymentMethod: string;
  paymentStatus: string;
  canceledAt?: string;
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
  paymentMethod: string;
  type?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: boolean;
  paymentStatus?: string;
}
