import { CreateSubscriptionDto } from './create-subscription.dto';

export class UpdateSubscriptionDto {
  userId?: number;
  planId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  cancelDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
}
