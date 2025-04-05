import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async addSubscriptionToUser(
    userId: number,
    subscriptionData: { type: string; startDate: Date; endDate: Date; status: boolean },
  ) {
    if (!userId || isNaN(userId)) {
      throw new Error('ID do usuário inválido.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado.`);
    }

    if (!subscriptionData.type || !subscriptionData.startDate || !subscriptionData.endDate) {
      throw new Error('Dados da assinatura incompletos.');
    }

    if (new Date(subscriptionData.startDate) >= new Date(subscriptionData.endDate)) {
      throw new Error('A data de início deve ser anterior à data de término.');
    }

    return this.prisma.subscription.create({
      data: {
        ...subscriptionData,
        userId,
      },
    });
  }

  async getUserSubscription(userId: number) {
    if (!userId || isNaN(userId)) {
      throw new Error('ID do usuário inválido.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado.`);
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      include: { user: true },
    });

    if (!subscription) {
      throw new Error(`O usuário com ID ${userId} não possui uma assinatura.`);
    }

    return subscription;
  }
}