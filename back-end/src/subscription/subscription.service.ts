import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PlansService } from '../plans/plans.service';
import { CreatePlanDto, UpdatePlanDto } from '../plans/dto/plan.dto';

// Presumindo que seu Prisma Client tem esses tipos (adapte se necessário)
// Geralmente, esses tipos são gerados pelo Prisma.
// type Plan = { id: number; name: string; price: number; durationDays: number; features: string | string[]; isActive: boolean; /* ...outros campos */ };
// type User = { id: number; name: string; email: string; /* ...outros campos */ };
// type Subscription = { id: number; userId: number; planId: number; startDate: Date; endDate: Date; status: string; cancelDate?: Date | null; createdAt: Date; plan?: Plan; user?: User; /* ...outros campos */ };
// type Payment = { id: number; subscriptionId: number; amount: number; status: string; paymentMethod: string; transactionId?: string | null; paymentDate: Date; /* ...outros campos */ };


@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService
  ) {}
  // ===== MÉTODOS PARA PLANOS (Delegando para PlansService) =====
  // A lógica de parsing de 'features' e 'active' deve estar DENTRO do PlansService.
  // O SubscriptionService apenas consome os métodos do PlansService.

  async createPlan(createPlanDto: CreatePlanDto) {
    return this.plansService.createPlan(createPlanDto);
  }

  async getAllPlans(onlyActive: boolean = false) {
    return this.plansService.getAllPlans(onlyActive);
  }

  async getPlanById(id: number) {
    return this.plansService.getPlanById(id);
  }

  async updatePlan(id: number, updateData: UpdatePlanDto) {
    return this.plansService.updatePlan(id, updateData);
  }

  async togglePlanStatus(id: number) {
    return this.plansService.togglePlanStatus(id);
  }

  async deletePlan(id: number) {
    return this.plansService.deletePlan(id);
  }
      
  // ===== MÉTODOS PARA ASSINATURAS =====

  async createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      // Verificar se o plano existe e está ativo (ou buscar conforme a regra de negócio)
      const plan = await this.plansService.getPlanById(createSubscriptionDto.planId); // Usa o PlansService
      if (!plan) { // PlansService.getPlanById já deve lançar NotFoundException
        throw new NotFoundException(`Plano com ID ${createSubscriptionDto.planId} não encontrado ou inacessível.`);
      }
      // Poderia adicionar uma verificação se o plano está ativo, se necessário:
      // if (!plan.isActive && !plan.active) { // 'active' é o campo que você adicionou para compatibilidade
      //   throw new BadRequestException(`Plano com ID ${createSubscriptionDto.planId} não está ativo.`);
      // }

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
          status: 'ACTIVE', // Ou qualquer status que impeça uma nova assinatura
        },
      });
      
      if (existingSubscription) {
        throw new BadRequestException(`Usuário já possui uma assinatura ativa (ID: ${existingSubscription.id})`);
      }
      
      // Preparar os dados para a criação da assinatura
      const startDate = createSubscriptionDto.startDate ? new Date(createSubscriptionDto.startDate) : new Date();
      // Certifique-se que plan.durationDays está disponível. O getPlanById do PlansService deve retornar isso.
      const endDate = createSubscriptionDto.endDate ? new Date(createSubscriptionDto.endDate) : this.calculateEndDate(plan.durationDays, startDate);
      
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
          plan: true, // Prisma vai buscar o plano associado
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
            amount: plan.price, // Usa o preço do plano obtido pelo PlansService
            status: 'PAID', // Ou o status apropriado
            paymentMethod: createSubscriptionDto.paymentMethod || 'N/A',
            transactionId: createSubscriptionDto.transactionId,
            paymentDate: new Date(),
          },
        });
      }
      
      // O plano incluído já deve vir formatado corretamente do PlansService (com features parseadas)
      // Se o include do Prisma não chamar o getter/transformador do PlansService,
      // você pode precisar re-buscar o plano via PlansService para garantir a formatação.
      // No entanto, para consistência, é melhor que `subscription.plan` aqui reflita
      // o estado cru do DB, e o `PlansService.getPlanById` seja usado se a formatação específica for necessária.
      // Ou, o PlansService fornece um método utilitário para formatar um objeto Plan.
      // Por simplicidade, vamos assumir que o `include` do Prisma é suficiente ou que o cliente lida com o parsing.
      // Se o plansService.getPlanById já retorna features como array, e o `include` do Prisma
      // retorna a string JSON, você pode fazer o parse aqui se necessário para a resposta:
      if (subscription.plan && typeof subscription.plan.features === 'string') {
        subscription.plan.features = JSON.parse(subscription.plan.features);
      }
      
      return subscription;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao criar assinatura:', error); // Log para depuração
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
          plan: true, // Prisma vai buscar o plano associado
        },
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
      }
      
      // Similar ao createSubscription, parsear features se vier como string
      if (subscription.plan && typeof subscription.plan.features === 'string') {
        subscription.plan.features = JSON.parse(subscription.plan.features);
      }
      
      return subscription;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar assinatura ${id}:`, error);
      throw new NotFoundException('Erro ao buscar assinatura: ' + error.message);
    }
  }

  async getUserSubscriptions(userId: number) {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId },
        include: {
          plan: true, // Prisma vai buscar o plano associado
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Parse features JSON string back to arrays
      return subscriptions.map(subscription => {
        if (subscription.plan && typeof subscription.plan.features === 'string') {
          subscription.plan.features = JSON.parse(subscription.plan.features);
        }
        return subscription;
      });
    } catch (error) {
      console.error(`Erro ao buscar assinaturas do usuário ${userId}:`, error);
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
          plan: true, // Prisma vai buscar o plano associado
        },
      });
      
      if (!subscription) {
        return null; // Não é um erro, só não tem assinatura ativa
      }
      
      // Parse features JSON string back to array if exists
      if (subscription.plan && typeof subscription.plan.features === 'string') {
        subscription.plan.features = JSON.parse(subscription.plan.features);
      }
      
      return subscription;
    } catch (error) {
      console.error(`Erro ao buscar assinatura ativa do usuário ${userId}:`, error);
      return null; // Em caso de erro inesperado, também retorna null ou lança o erro
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
          plan: true, // Prisma vai buscar o plano associado
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
      if (updatedSubscription.plan && typeof updatedSubscription.plan.features === 'string') {
        updatedSubscription.plan.features = JSON.parse(updatedSubscription.plan.features);
      }
      
      return updatedSubscription;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Erro ao cancelar assinatura ${id}:`, error);
      throw new BadRequestException('Erro ao cancelar assinatura: ' + error.message);
    }
  }
  
  async getAllSubscriptions(filter?: { status?: string }) {
    try {
      const whereClause: any = {};
      if (filter?.status) {
        whereClause.status = filter.status;
      }
      
      const subscriptions = await this.prisma.subscription.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true, // Prisma vai buscar o plano associado
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Parse features JSON string back to arrays
      return subscriptions.map(subscription => {
        if (subscription.plan && typeof subscription.plan.features === 'string') {
          subscription.plan.features = JSON.parse(subscription.plan.features);
        }
        return subscription;
      });
    } catch (error) {
      console.error('Erro ao buscar todas as assinaturas:', error);
      return []; // Retorna array vazio em caso de erro
    }
  }
  
  // Este método é um alias para getUserSubscriptions, pode ser mantido ou removido se redundante.
  async getUserSubscription(userId: number) {
    return this.getUserSubscriptions(userId);
  }

  async renewSubscription(id: number, newDurationDays?: number) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
        include: { plan: true }, // Inclui o plano para obter durationDays original se necessário
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
      }
      if (!subscription.plan) {
         throw new NotFoundException(`Plano associado à assinatura com ID ${id} não encontrado.`);
      }
      
      // Calculate new end date
      const currentEndDate = subscription.endDate > new Date() ? subscription.endDate : new Date(); // Renova a partir do fim atual ou de hoje
      const durationToAdd = newDurationDays || subscription.plan.durationDays;
      const newEndDate = this.calculateEndDate(durationToAdd, currentEndDate);
      
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id },
        data: {
          endDate: newEndDate,
          status: 'ACTIVE', // Garante que está ativa
          cancelDate: null, // Remove data de cancelamento se houver
        },
        include: {
          plan: true, // Prisma vai buscar o plano associado
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
      if (updatedSubscription.plan && typeof updatedSubscription.plan.features === 'string') {
        updatedSubscription.plan.features = JSON.parse(updatedSubscription.plan.features);
      }
      
      return updatedSubscription;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao renovar assinatura ${id}:`, error);
      throw new BadRequestException('Erro ao renovar assinatura: ' + error.message);
    }
  }

  async updateSubscription(id: number, updateData: UpdateSubscriptionDto) {
    try {
      const subscriptionExists = await this.prisma.subscription.findUnique({
        where: { id },
      });
      
      if (!subscriptionExists) {
        throw new NotFoundException(`Assinatura com ID ${id} não encontrada`);
      }
      
      // Validar status se estiver sendo atualizado
      if (updateData.status && !['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'].includes(updateData.status)) {
        throw new BadRequestException(`Status inválido: ${updateData.status}. Use ACTIVE, CANCELLED, EXPIRED ou PENDING.`);
      }
      
      // Se for atualizar datas, converter para Date objects
      const prismaUpdateData: any = { ...updateData };
      if (updateData.startDate) {
        prismaUpdateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        prismaUpdateData.endDate = new Date(updateData.endDate);
      }
      if (updateData.cancelDate) {
        prismaUpdateData.cancelDate = new Date(updateData.cancelDate);
      } else if (updateData.hasOwnProperty('cancelDate') && updateData.cancelDate === null) {
        prismaUpdateData.cancelDate = null;
      }


      const updatedSubscription = await this.prisma.subscription.update({
        where: { id },
        data: prismaUpdateData,
        include: {
          plan: true, // Prisma vai buscar o plano associado
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
      if (updatedSubscription.plan && typeof updatedSubscription.plan.features === 'string') {
        updatedSubscription.plan.features = JSON.parse(updatedSubscription.plan.features);
      }

      return updatedSubscription;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error(`Erro ao atualizar assinatura ${id}:`, error);
      throw new BadRequestException('Erro ao atualizar assinatura: ' + error.message);
    }
  }

  async registerPayment(subscriptionId: number, paymentData: {
    amount?: number;
    status?: string;
    paymentMethod?: string;
    transactionId?: string | null;
    paymentDate?: Date | string;
  }) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true } // Para pegar o preço do plano como default
      });
      
      if (!subscription) {
        throw new NotFoundException(`Assinatura com ID ${subscriptionId} não encontrada`);
      }
      if (!subscription.plan) {
        throw new NotFoundException(`Plano associado à assinatura com ID ${subscriptionId} não encontrado.`);
      }
      
      return await this.prisma.payment.create({
        data: {
          subscriptionId,
          amount: paymentData.amount || subscription.plan.price,
          status: paymentData.status || 'PAID',
          paymentMethod: paymentData.paymentMethod || 'N/A',
          transactionId: paymentData.transactionId,
          paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao registrar pagamento para assinatura ${subscriptionId}:`, error);
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
      console.error(`Erro ao buscar pagamentos da assinatura ${subscriptionId}:`, error);
      return []; // Retorna array vazio em caso de erro ou se não houver pagamentos
    }
  }  async getUserHasActiveSubscription(userId: number): Promise<boolean> {
    try {
      console.log(`Verificando assinatura para usuário com ID ${userId}`);
      
      if (!userId || isNaN(Number(userId))) {
        console.log(`ID de usuário inválido: ${userId}`);
        return false;
      }
      
      // Buscar todas as assinaturas do usuário para diagnóstico
      const allSubscriptions = await this.prisma.subscription.findMany({
        where: {
          userId: Number(userId)
        },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true
        }
      });
      
      console.log(`Todas as assinaturas do usuário ${userId}:`, 
        allSubscriptions.length > 0 ? allSubscriptions : 'Nenhuma assinatura encontrada');
      
      // Verificar a assinatura ativa mais recente
      const now = new Date();
      console.log(`Data atual para comparação: ${now.toISOString()}`);
      
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          userId: Number(userId),
          status: 'ACTIVE',
          endDate: { gte: now } // Verifica se a assinatura ainda é válida
        },
        orderBy: {
          createdAt: 'desc' // Pegar a assinatura ativa mais recente
        }
      });
      
      const hasActiveSubscription = !!subscription;
      console.log(`Usuário ${userId} ${hasActiveSubscription ? 'tem' : 'não tem'} assinatura ativa`);
      
      if (hasActiveSubscription) {
        console.log(`Detalhes da assinatura ativa:`, {
          id: subscription.id,
          status: subscription.status,
          dataInicio: subscription.startDate,
          dataFim: subscription.endDate,
          criado: subscription.createdAt
        });
      }
      
      return hasActiveSubscription;
    } catch (error) {
      console.error(`Erro ao verificar assinatura do usuário ${userId}:`, error);
      return false;
    }
  }
}