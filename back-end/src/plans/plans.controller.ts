import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.createPlan(createPlanDto);
  }

  @Public()
  @Get()
  async getAllPlans(@Query('onlyActive') onlyActive: string) {
    const showOnlyActive = onlyActive === 'true';
    return this.plansService.getAllPlans(showOnlyActive);
  }

  @Public()
  @Get(':id')
  async getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(Number(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.updatePlan(Number(id), updatePlanDto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  async togglePlanStatus(@Param('id') id: string) {
    return this.plansService.togglePlanStatus(Number(id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePlan(@Param('id') id: string) {
    return this.plansService.deletePlan(Number(id));
  }
}
