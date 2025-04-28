import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  // ===== MÉTODOS PARA PLANOS =====

  async createPlan(createPlanDto: CreatePlanDto) {
    try {
      // Convert features array to JSON string for Prisma
      const prismaData = {
        ...createPlanDto,
        features: createPlanDto.features ? JSON.stringify(createPlanDto.features) : null,
        durationDays: createPlanDto.duration || 30 // Ensure durationDays always has a value
      };
      
      // Remove the duration property since it's not in the Prisma schema
      delete (prismaData as any).duration;
      
      // Log the data being sent to Prisma for debugging
      console.log('Creating plan with data:', prismaData);
      
      return await this.prisma.plan.create({
        data: prismaData,
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      throw new BadRequestException('Erro ao criar plano: ' + error.message);
    }
  }

  async getAllPlans(onlyActive: boolean = false) {
    try {
      // Convert boolean filter to appropriate Prisma where condition
      const where: any = {};
      if (onlyActive) {
        where.isActive = true;
      }
      
      const plans = await this.prisma.plan.findMany({
        where,
        orderBy: {
          price: 'asc',
        },
      });
      
      // Parse features JSON string back to array
      return plans.map(plan => ({
        ...plan,
        features: plan.features ? JSON.parse(plan.features as string) : [],
      }));
    } catch (error) {
      // Se não houver planos, retorna array vazio ao invés de erro
      return [];
    }
  }

  async getPlanById(id: number) {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { id },
      });
      
      if (!plan) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      // Parse features JSON string back to array
      return {
        ...plan,
        features: plan.features ? JSON.parse(plan.features as string) : [],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Erro ao buscar plano: ' + error.message);
    }
  }
  async updatePlan(id: number, updateData: UpdatePlanDto) {
    try {
      // Verificar se o plano existe
      const exists = await this.prisma.plan.findUnique({
        where: { id },
      });
      
      if (!exists) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      // Create a proper Prisma update object
      const prismaUpdateData: any = { ...updateData };
      
      // Convert features array to JSON string if present
      if (updateData.features) {
        prismaUpdateData.features = JSON.stringify(updateData.features);
      }
      
      // Map duration to durationDays if present
      if (updateData.duration !== undefined) {
        prismaUpdateData.durationDays = updateData.duration;
        delete prismaUpdateData.duration; // Remove the original duration field
      }
      
      const updatedPlan = await this.prisma.plan.update({
        where: { id },
        data: prismaUpdateData,
      });
      
      // Parse features JSON string back to array and add active field for frontend
      return {
        ...updatedPlan,
        features: updatedPlan.features ? JSON.parse(updatedPlan.features as string) : [],
        active: updatedPlan.isActive // Adiciona campo "active" para compatibilidade com frontend
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Erro ao atualizar plano: ' + error.message);
    }
  }

  async deletePlan(id: number) {
    try {
      // Verificar se o plano existe
      const exists = await this.prisma.plan.findUnique({
        where: { id },
      });
      
      if (!exists) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      // Verificar se há assinaturas associadas a este plano
      const subscriptionsCount = await this.prisma.subscription.count({
        where: { planId: id },
      });
      
      if (subscriptionsCount > 0) {
        throw new BadRequestException(
          `Não é possível excluir este plano pois existem ${subscriptionsCount} assinaturas associadas a ele.`
        );
      }
      
      await this.prisma.plan.delete({
        where: { id },
      });
      
      return { message: `Plano com ID ${id} foi removido com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new NotFoundException('Erro ao remover plano: ' + error.message);
    }
  }

  // ===== MÉTODOS PARA ASSINATURAS =====

  async createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      // Verificar se o plano existe
      const plan = await this.prisma.plan.findUnique({
        where: { id: createSubscriptionDto.planId },
      });
      
      if (!plan) {
        throw new NotFoundException(`Plano com ID ${createSubscriptionDto.planId} não encontrado`);
      }
      
      // Verificar se o usuário existe
      const user = await this.prisma.user.findUnique({
        where: { id: createSubscriptionDto.userId },
      });
      
      if (!user) {
        throw new NotFoundException(`Usuário com ID ${createSubscriptionDto.userId} não encontrado`);
      }
      
      // Verificar se o usuário já possui uma assinatura ativa
      const existingSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: createSubscriptionDto.userId,
          status: 'ACTIVE',
        },
      });
      
      if (existingSubscription) {
        throw new BadRequestException(`Usuário já possui uma assinatura ativa (ID: ${existingSubscription.id})`);
      }
      
      // Preparar os dados para a criação da assinatura
      const startDate = createSubscriptionDto.startDate || new Date();
      const endDate = createSubscriptionDto.endDate || this.calculateEndDate(plan.durationDays, startDate);
      
      // Criar a nova assinatura
      const subscription = await this.prisma.subscription.create({
        data: {
          userId: createSubscriptionDto.userId,
          planId: createSubscriptionDto.planId,
          startDate: startDate,
          endDate: endDate,
          status: createSubscriptionDto.status || 'ACTIVE',
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Se tiver dados de pagamento, cria o registro de pagamento
      if (createSubscriptionDto.paymentMethod || createSubscriptionDto.transactionId) {
        await this.prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: plan.price,
            status: 'PAID',
            paymentMethod: createSubscriptionDto.paymentMethod || 'N/A',
            transactionId: createSubscriptionDto.transactionId,
            paymentDate: new Date(),
          },
        });
      }
      
      // Processando o plano para o formato esperado pelo frontend
      if (subscription.plan?.features) {
        subscription.plan = {
          ...subscription.plan,
          features: JSON.parse(subscription.plan.features as string),
        };
      }
      
      return subscription;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar assinatura: ' + error.message);
    }
  }
  private calculateEndDate(durationDays: number, startDate: Date = new Date()): Date {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    return endDate;
  }

  async getSubscriptionById(id: number) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
        },
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
      }
      
      // Parse features JSON string back to array if exists
      if (subscription.plan?.features) {
        subscription.plan = {
          ...subscription.plan,
          features: JSON.parse(subscription.plan.features as string),
        };
      }
      
      return subscription;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Erro ao buscar assinatura: ' + error.message);
    }
  }

  async getUserSubscriptions(userId: number) {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Parse features JSON string back to arrays
      return subscriptions.map(subscription => {
        if (subscription.plan?.features) {
          subscription.plan = {
            ...subscription.plan,
            features: JSON.parse(subscription.plan.features as string),
          };
        }
        return subscription;
      });
    } catch (error) {
      // Se não houver assinaturas, retorna array vazio ao invés de erro
      return [];
    }
  }

  async getActiveUserSubscription(userId: number) {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
      });
      
      if (!subscription) {
        return null; // Não é um erro, só não tem assinatura ativa
      }
      
      // Parse features JSON string back to array if exists
      if (subscription.plan?.features) {
        subscription.plan = {
          ...subscription.plan,
          features: JSON.parse(subscription.plan.features as string),
        };
      }
      
      return subscription;
    } catch (error) {
      return null;
    }
  }
  async cancelSubscription(id: number) {
    try {
      // Verificar se a assinatura existe
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
      }
      
      // Verificar se a assinatura já está cancelada
      if (subscription.status === 'CANCELLED') {
        throw new BadRequestException(`Assinatura com ID ${id} já está cancelada`);
      }
      
      // Cancelar a assinatura
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelDate: new Date(),
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Processando o plano para o formato esperado pelo frontend
      if (updatedSubscription.plan?.features) {
        updatedSubscription.plan = {
          ...updatedSubscription.plan,
          features: JSON.parse(updatedSubscription.plan.features as string),
        };
      }
      
      return updatedSubscription;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao cancelar assinatura: ' + error.message);
    }
  }
  
  // Utility methods for handling subscriptions
  async getAllSubscriptions(filter?: { status?: string }) {
    try {
      const where: any = {};
      if (filter?.status) {
        where.status = filter.status;
      }
      
      const subscriptions = await this.prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Parse features JSON string back to arrays
      return subscriptions.map(subscription => {
        if (subscription.plan?.features) {
          subscription.plan = {
            ...subscription.plan,
            features: JSON.parse(subscription.plan.features as string),
          };
        }
        return subscription;
      });
    } catch (error) {
      return [];
    }
  }
  
  async getUserSubscription(userId: number) {
    return this.getUserSubscriptions(userId);
  }
    async renewSubscription(id: number, duration: number) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
        include: { plan: true },
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
      }
      
      // Calculate new end date
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + (duration || subscription.plan.durationDays));
      
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id },
        data: {
          endDate: newEndDate,
          status: 'ACTIVE',
          cancelDate: null,
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Processando o plano para o formato esperado pelo frontend
      if (updatedSubscription.plan?.features) {
        updatedSubscription.plan = {
          ...updatedSubscription.plan,
          features: JSON.parse(updatedSubscription.plan.features as string),
        };
      }
      
      return updatedSubscription;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao renovar assinatura: ' + error.message);
    }
  }
    async updateSubscription(id: number, updateData: UpdateSubscriptionDto) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
      }
      
      // Validar status se estiver sendo atualizado
      if (updateData.status && !['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'].includes(updateData.status)) {
        throw new BadRequestException(`Status inválido: ${updateData.status}. Use ACTIVE, CANCELLED, EXPIRED ou PENDING`);
      }
      
      return await this.prisma.subscription.update({
        where: { id },
        data: updateData,
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar assinatura: ' + error.message);
    }
  }
    async registerPayment(subscriptionId: number, paymentData: any) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${subscriptionId} não encontrada`);
      }
      
      return await this.prisma.payment.create({
        data: {
          subscriptionId,
          amount: paymentData.amount || subscription.plan.price,
          status: paymentData.status || 'PAID',
          paymentMethod: paymentData.paymentMethod || 'N/A',
          transactionId: paymentData.transactionId,
          paymentDate: paymentData.paymentDate || new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao registrar pagamento: ' + error.message);
    }
  }
  
  async getPaymentsBySubscription(subscriptionId: number) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${subscriptionId} não encontrada`);
      }
      
      return await this.prisma.payment.findMany({
        where: { subscriptionId },
        orderBy: {
          paymentDate: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return [];
    }
  }
    async togglePlanStatus(id: number) {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { id },
      });
      
      if (!plan) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      const updatedPlan = await this.prisma.plan.update({
        where: { id },
        data: {
          isActive: !plan.isActive,
        },
      });
      
      // Parse features JSON string back to array
      return {
        ...updatedPlan,
        features: updatedPlan.features ? JSON.parse(updatedPlan.features as string) : [],
        active: updatedPlan.isActive // Adiciona campo "active" para compatibilidade com frontend
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao alterar status do plano: ' + error.message);
    }
  }
}
