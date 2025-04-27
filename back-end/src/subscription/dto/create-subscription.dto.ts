export class CreateSubscriptionDto {
  userId: number;
  planId: number;
  startDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
}
