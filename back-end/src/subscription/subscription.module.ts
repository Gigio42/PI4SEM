import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PrismaModule, PlansModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
