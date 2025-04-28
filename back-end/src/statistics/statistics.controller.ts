import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Public()
  @Post('view')
  async registerComponentView(
    @Body() data: { componentId: number; sessionId?: string },
    @Req() req,
  ) {
    const userId = req.user?.userId;
    return this.statisticsService.registerComponentView(
      data.componentId,
      userId,
      data.sessionId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily')
  async getDailyStatistics(@Query('date') dateString?: string) {
    const date = dateString ? new Date(dateString) : new Date();
    return this.statisticsService.getDailyStatistics(date);
  }

  @UseGuards(JwtAuthGuard)
  @Get('range')
  async getStatisticsByDateRange(
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string,
  ) {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    return this.statisticsService.getStatisticsByDateRange(startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  async getOverviewStatistics() {
    return this.statisticsService.getOverviewStatistics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('most-viewed')
  async getMostViewedComponents(
    @Query('startDate') startDateString?: string,
    @Query('endDate') endDateString?: string,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    const startDate = startDateString ? new Date(startDateString) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = endDateString ? new Date(endDateString) : new Date();
    return this.statisticsService.getMostViewedComponents(startDate, endDate, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('most-favorited')
  async getMostFavoritedComponents(
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.statisticsService.getMostFavoritedComponents(limit);
  }
}
