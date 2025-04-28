export class CreateSubscriptionDto {
  userId: number;
  planId: number;
  startDate?: Date;
  endDate?: Date;
  status?: string = 'ACTIVE';
  paymentMethod?: string;
  transactionId?: string;
}
