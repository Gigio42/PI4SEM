import { Controller, Get, Post, Patch, Delete, Param, Body, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Public } from '../auth/public.decorator';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ===== ENDPOINTS PARA PLANOS =====
  
  @Post('plans')
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    try {
      return await this.subscriptionService.createPlan(createPlanDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }  }

  @Public()
  @Get('plans')
  async getAllPlans(@Query('onlyActive') onlyActive: string) {
    const showOnlyActive = onlyActive === 'true';
    return this.subscriptionService.getAllPlans(showOnlyActive);
  }

  @Public()
  @Get('plans/:id')
  async getPlanById(@Param('id') id: string) {
    try {
      return await this.subscriptionService.getPlanById(Number(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }
  @Patch('plans/:id')
  @Public()
  async updatePlan(@Param('id') id: string, @Body() updateData: Partial<CreatePlanDto>) {
    try {
      return await this.subscriptionService.updatePlan(Number(id), updateData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }

  @Patch('plans/:id/toggle')
  @Public()
  async togglePlanStatus(@Param('id') id: string) {
    try {
      return await this.subscriptionService.togglePlanStatus(Number(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }

  // ===== ENDPOINTS PARA ASSINATURAS =====
  
  @Post()
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    try {
      return await this.subscriptionService.createSubscription(createSubscriptionDto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }  @Get()
  @Public()
  async getAllSubscriptions(@Query('status') status: string) {
    const filter: { status?: string } = {};
    
    if (status !== undefined) {
      filter.status = status; // Pass the status string directly
    }
    
    return this.subscriptionService.getAllSubscriptions(filter);
  }

  @Get('user/:userId')
  async getUserSubscription(@Param('userId') userId: string) {
    try {
      return await this.subscriptionService.getUserSubscription(Number(userId));
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }

  @Get(':id')
  async getSubscriptionById(@Param('id') id: string) {
    try {
      return await this.subscriptionService.getSubscriptionById(Number(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id/cancel')
  async cancelSubscription(@Param('id') id: string) {
    try {
      return await this.subscriptionService.cancelSubscription(Number(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id/renew')
  async renewSubscription(@Param('id') id: string, @Body() data: { duration: number }) {
    if (!data.duration || data.duration <= 0) {
      throw new BadRequestException('A duração da renovação deve ser um número positivo');
    }
    
    try {
      return await this.subscriptionService.renewSubscription(Number(id), data.duration);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  async updateSubscription(@Param('id') id: string, @Body() updateData: Partial<CreateSubscriptionDto>) {
    try {
      return await this.subscriptionService.updateSubscription(Number(id), updateData);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Falha ao atualizar assinatura: ' + error.message);
    }
  }

  // ===== ENDPOINTS PARA PAGAMENTOS =====
    @Post(':id/payment')
  async registerPayment(
    @Param('id') id: string,
    @Body() data: { amount: number; paymentMethod: string }
  ) {
    if (!data.amount || data.amount <= 0) {
      throw new BadRequestException('O valor do pagamento deve ser positivo');
    }
    
    if (!data.paymentMethod) {
      throw new BadRequestException('O método de pagamento é obrigatório');
    }
    
    try {
      return await this.subscriptionService.registerPayment(
        Number(id),
        {
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          status: 'PAID'
        }
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }

  @Get(':id/payments')
  async getPaymentsBySubscription(@Param('id') id: string) {
    try {
      return await this.subscriptionService.getPaymentsBySubscription(Number(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(error.message);
    }
  }
}
