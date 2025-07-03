import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

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
      console.log('PlansService: Getting all plans, onlyActive:', onlyActive);
      
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
      
      console.log('PlansService: Found', plans.length, 'plans');
      
      // Parse features JSON string back to array for each plan
      const processedPlans = plans.map(plan => {
        try {
          let features = [];
          
          if (plan.features) {
            try {
              features = JSON.parse(plan.features as string);
            } catch (parseError) {
              console.error('Error parsing features for plan', plan.id, ':', parseError);
              features = [];
            }
          }
          
          return {
            ...plan,
            features: features
          };
        } catch (planError) {
          console.error('Error processing plan', plan.id, ':', planError);
          return {
            ...plan,
            features: []
          };
        }
      });
      
      return processedPlans;
    } catch (error) {
      console.error('Error fetching plans:', error);
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
      
      // Parse features JSON string back to array
      return {
        ...updatedPlan,
        features: updatedPlan.features ? JSON.parse(updatedPlan.features as string) : [],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar plano: ' + error.message);
    }
  }

  async togglePlanStatus(id: number) {
    try {
      // Get the current plan
      const plan = await this.prisma.plan.findUnique({
        where: { id },
      });
      
      if (!plan) {
        throw new NotFoundException(`Plano com ID ${id} não encontrado`);
      }
      
      // Toggle the isActive status
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
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao alterar status do plano: ' + error.message);
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
      throw new BadRequestException('Erro ao remover plano: ' + error.message);
    }
  }
}