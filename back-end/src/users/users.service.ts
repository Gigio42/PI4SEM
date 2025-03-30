import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmailAndPassword(email: string, password: string) {
    return this.prisma.user.findFirst({
      where: { email, password },
    });
  }

  async createUser(email: string, password: string) {
    return this.prisma.user.create({
      data: { email, password },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  // Adiciona uma Subscription a um usuário
  async addSubscriptionToUser(userId: number, subscriptionData: { type: string; startDate: Date; endDate: Date; status: boolean }) {
    // Verifica se o ID do usuário é válido
    if (!userId || isNaN(userId)) {
      throw new Error('ID do usuário inválido.');
    }

    // Verifica se o usuário existe
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado.`);
    }

    // Valida os dados da assinatura
    if (!subscriptionData.type || !subscriptionData.startDate || !subscriptionData.endDate) {
      throw new Error('Dados da assinatura incompletos.');
    }

    if (new Date(subscriptionData.startDate) >= new Date(subscriptionData.endDate)) {
      throw new Error('A data de início deve ser anterior à data de término.');
    }

    // Cria a assinatura
    return this.prisma.subscription.create({
      data: {
        ...subscriptionData,
        userId,
      },
    });
  }

  // Verifica se um usuário já possui uma Subscription
  async getUserSubscription(userId: number) {
    // Verifica se o ID do usuário é válido
    if (!userId || isNaN(userId)) {
      throw new Error('ID do usuário inválido.');
    }

    // Verifica se o usuário existe
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado.`);
    }

    // Busca a assinatura do usuário
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      include: { user: true }, // Inclui os dados do usuário
    });

    // Retorna a assinatura ou uma mensagem indicando que não há assinatura
    if (!subscription) {
      throw new Error(`O usuário com ID ${userId} não possui uma assinatura.`);
    }

    return subscription;
  }
}