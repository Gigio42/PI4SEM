import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post(':userId')
  async addSubscriptionToUser(
    @Param('userId') userId: string,
    @Body() subscriptionData: { type: string; startDate: Date; endDate: Date; status: boolean },
  ) {
    try {
      return await this.subscriptionService.addSubscriptionToUser(Number(userId), subscriptionData);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get(':userId')
  async getUserSubscription(@Param('userId') userId: string) {
    try {
      return await this.subscriptionService.getUserSubscription(Number(userId));
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}