import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== PLANOS =====
  
  async createPlan(createPlanDto: CreatePlanDto) {
    try {
      // Esta função estará disponível após aplicar a migração
      return await this.prisma.$transaction(async (tx) => {
        return tx.plan.create({
          data: createPlanDto,
        });
      });
    } catch (error) {
      throw new BadRequestException('Não foi possível criar o plano: ' + error.message);
    }
  }

  async getAllPlans(onlyActive = true) {
    // Esta função estará disponível após aplicar a migração
    return this.prisma.$transaction(async (tx) => {
      const where = onlyActive ? { active: true } : {};
      return tx.plan.findMany({
        where,
        orderBy: { price: 'asc' },
      });
    });
  }

  async getPlanById(id: number) {
    // Esta função estará disponível após aplicar a migração
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: { id },
      });
      
      if (!plan) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      return plan;
    });
  }

  async updatePlan(id: number, updateData: Partial<CreatePlanDto>) {
    // Esta função estará disponível após aplicar a migração
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: { id },
      });
      
      if (!plan) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      return tx.plan.update({
        where: { id },
        data: updateData,
      });
    });
  }

  async togglePlanStatus(id: number) {
    // Esta função estará disponível após aplicar a migração
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: { id },
      });
      
      if (!plan) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      return tx.plan.update({
        where: { id },
        data: { active: !plan.active },
      });
    });
  }

  // ===== ASSINATURAS =====

  async createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      // Verificar usuário
      const user = await this.prisma.user.findUnique({ 
        where: { id: createSubscriptionDto.userId },
        include: { subscriptions: true }
      });
      
      if (!user) {
        throw new NotFoundException(`Usuário com ID ${createSubscriptionDto.userId} não encontrado`);
      }

      // Verificar se usuário já tem assinatura ativa
      const activeSubscription = user.subscriptions.find(sub => 
        sub.status === true && 
        new Date(sub.endDate) > new Date()
      );

      if (activeSubscription) {
        throw new BadRequestException('O usuário já possui uma assinatura ativa');
      }

      // Cria a assinatura
      return this.prisma.subscription.create({
        data: {
          type: createSubscriptionDto.type || 'premium',
          startDate: createSubscriptionDto.startDate,
          endDate: createSubscriptionDto.endDate,
          status: createSubscriptionDto.status,
          userId: createSubscriptionDto.userId,
          planId: createSubscriptionDto.planId,
          paymentMethod: createSubscriptionDto.paymentMethod,
          paymentStatus: createSubscriptionDto.paymentStatus || 'pending',
          nextPaymentDate: createSubscriptionDto.nextPaymentDate || createSubscriptionDto.endDate
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              picture: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Não foi possível criar a assinatura: ' + error.message);
    }
  }

  async getUserSubscription(userId: number) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('ID do usuário inválido');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        userId,
        status: true,
        endDate: { gt: new Date() }
      },
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            picture: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return subscription;
  }

  async getAllSubscriptions(filter?: { status?: boolean }) {
    const where: any = {};
    
    if (filter?.status !== undefined) {
      where.status = filter.status;
    }
    
    return this.prisma.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            picture: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async getSubscriptionById(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            picture: true
          }
        }
      }
    });
    
    if (!subscription) {
      throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
    }
    
    return subscription;
  }

  async cancelSubscription(id: number) {
    const subscription = await this.getSubscriptionById(id);
    
    return this.prisma.subscription.update({
      where: { id },
      data: { 
        status: false,
        canceledAt: new Date()
      }
    });
  }

  async renewSubscription(id: number, duration: number) {
    const subscription = await this.getSubscriptionById(id);
    
    const endDate = new Date(subscription.endDate);
    endDate.setDate(endDate.getDate() + duration);
    
    return this.prisma.subscription.update({
      where: { id },
      data: { 
        endDate,
        status: true,
        nextPaymentDate: endDate,
        canceledAt: null
      }
    });
  }
  
  // ===== PAGAMENTOS =====
  
  async registerPayment(subscriptionId: number, amount: number, paymentMethod: string) {
    const subscription = await this.getSubscriptionById(subscriptionId);
    
    // Esta função estará disponível após aplicar a migração
    return this.prisma.$transaction(async (tx) => {
      return tx.payment.create({
        data: {
          subscriptionId,
          amount,
          status: 'completed',
          paymentMethod,
          paymentDate: new Date(),
          transactionId: `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`
        }
      });
    });
  }

  async getPaymentsBySubscription(subscriptionId: number) {
    const subscription = await this.getSubscriptionById(subscriptionId);
    
    // Esta função estará disponível após aplicar a migração
    return this.prisma.$transaction(async (tx) => {
      return tx.payment.findMany({
        where: { subscriptionId },
        orderBy: { paymentDate: 'desc' }
      });
    });
  }
}