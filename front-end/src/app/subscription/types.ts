export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  highlighted?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'pix' | 'bank_slip';
  lastDigits?: string;
  expiryDate?: string;
  cardBrand?: string;
}

export interface SubscriptionHistory {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'canceled' | 'expired';
  price: number;
}
