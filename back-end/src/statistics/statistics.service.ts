import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async registerComponentView(componentId: number, userId?: number, sessionId?: string) {
    // Registra a visualização do componente
    return this.prisma.componentView.create({
      data: {
        componentId,
        userId,
        sessionId,
      },
    });
  }

  async getDailyStatistics(date: Date = new Date()) {
    // Formata a data para pegar apenas o dia atual
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Busca estatísticas existentes ou cria novas
    const existingStats = await this.prisma.statistics.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingStats) {
      return existingStats;
    }

    // Calcular estatísticas do dia
    const [
      componentViews,
      newUsers,
      activeUsers,
      totalSubscriptions,
      revenue,
      mostFavorited,
    ] = await Promise.all([
      this.getComponentViewsForDay(startOfDay, endOfDay),
      this.getNewUsersForDay(startOfDay, endOfDay),
      this.getActiveUsersForDay(startOfDay, endOfDay),
      this.getTotalActiveSubscriptions(),
      this.getDailyRevenue(startOfDay, endOfDay),
      this.getMostFavoritedComponents(),
    ]);

    const mostViewed = await this.getMostViewedComponents(startOfDay, endOfDay);
    
    // Calcular taxa de conversão (usuários que assinaram / usuários ativos) * 100
    let conversionRate = new Decimal(0);
    if (activeUsers > 0) {
      conversionRate = new Decimal(totalSubscriptions / activeUsers * 100);
    }

    // Criar novo registro de estatísticas
    return this.prisma.statistics.create({
      data: {
        date: startOfDay,
        componentViews: componentViews,
        newUsers,
        activeUsers,
        totalSubscriptions,
        revenue,
        mostViewedComponents: mostViewed,
        mostFavoritedComponents: mostFavorited,
        conversionRate,
      },
    });
  }

  async getComponentViewsForDay(startOfDay: Date, endOfDay: Date) {
    const views = await this.prisma.componentView.groupBy({
      by: ['componentId'],
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: {
        componentId: true,
      },
    });

    // Transformar para o formato {componentId: count}
    return views.reduce((acc, item) => {
      acc[item.componentId] = item._count.componentId;
      return acc;
    }, {});
  }

  async getNewUsersForDay(startOfDay: Date, endOfDay: Date) {
    return this.prisma.user.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async getActiveUsersForDay(startOfDay: Date, endOfDay: Date) {
    return this.prisma.user.count({
      where: {
        lastLogin: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async getTotalActiveSubscriptions() {
    return this.prisma.subscription.count({
      where: {
        status: 'ACTIVE',
      },
    });
  }

  async getDailyRevenue(startOfDay: Date, endOfDay: Date) {
    const payments = await this.prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'COMPLETED',
      },
      select: {
        amount: true,
      },
    });

    return payments.reduce(
      (total, payment) => total.add(payment.amount),
      new Decimal(0),
    );
  }

  async getMostViewedComponents(startOfDay: Date, endOfDay: Date, limit = 10) {
    const viewCounts = await this.prisma.componentView.groupBy({
      by: ['componentId'],
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: {
        componentId: true,
      },
      orderBy: {
        _count: {
          componentId: 'desc',
        },
      },
      take: limit,
    });

    // Buscar os detalhes dos componentes
    const componentIds = viewCounts.map((item) => item.componentId);
    
    if (componentIds.length === 0) return [];

    const components = await this.prisma.component.findMany({
      where: {
        id: {
          in: componentIds,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    // Combinar contagens com detalhes
    return viewCounts.map((viewCount) => {
      const component = components.find((c) => c.id === viewCount.componentId);
      return {
        ...component,
        views: viewCount._count.componentId,
      };
    });
  }

  async getMostFavoritedComponents(limit = 10) {
    const favoriteCount = await this.prisma.favorito.groupBy({
      by: ['componentId'],
      _count: {
        componentId: true,
      },
      orderBy: {
        _count: {
          componentId: 'desc',
        },
      },
      take: limit,
    });

    // Buscar os detalhes dos componentes
    const componentIds = favoriteCount.map((item) => item.componentId);
    
    if (componentIds.length === 0) return [];

    const components = await this.prisma.component.findMany({
      where: {
        id: {
          in: componentIds,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    // Combinar contagens com detalhes
    return favoriteCount.map((favCount) => {
      const component = components.find((c) => c.id === favCount.componentId);
      return {
        ...component,
        favorites: favCount._count.componentId,
      };
    });
  }

  async getStatisticsByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.statistics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getOverviewStatistics() {
    // Estatísticas dos últimos 30 dias
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Estatísticas gerais
    const [
      totalUsers,
      totalActiveSubscriptions,
      totalRevenue,
      dailyStats,
      topComponents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      this.getTotalRevenue(),
      this.getStatisticsByDateRange(thirtyDaysAgo, today),
      this.getMostViewedComponents(thirtyDaysAgo, today, 5),
    ]);

    // Calcular crescimento
    const userGrowth = await this.calculateUserGrowth();
    const revenueGrowth = await this.calculateRevenueGrowth();

    return {
      totalUsers,
      totalActiveSubscriptions,
      totalRevenue,
      userGrowth,
      revenueGrowth,
      dailyStats,
      topComponents,
    };
  }

  async getTotalRevenue() {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
      },
      select: {
        amount: true,
      },
    });

    return payments.reduce(
      (total, payment) => total.add(payment.amount),
      new Decimal(0),
    );
  }

  async calculateUserGrowth() {
    const today = new Date();
    
    // Período atual: últimos 30 dias
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Período anterior: 60-30 dias atrás
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const [currentPeriodUsers, previousPeriodUsers] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    if (previousPeriodUsers === 0) {
      return currentPeriodUsers > 0 ? 100 : 0;
    }

    return ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100;
  }

  async calculateRevenueGrowth() {
    const today = new Date();
    
    // Período atual: últimos 30 dias
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Período anterior: 60-30 dias atrás
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const [currentPeriodRevenue, previousPeriodRevenue] = await Promise.all([
      this.getDailyRevenue(thirtyDaysAgo, today),
      this.getDailyRevenue(sixtyDaysAgo, thirtyDaysAgo),
    ]);

    if (previousPeriodRevenue.equals(0)) {
      return currentPeriodRevenue.greaterThan(0) ? 100 : 0;
    }

    return currentPeriodRevenue
      .minus(previousPeriodRevenue)
      .dividedBy(previousPeriodRevenue)
      .times(100)
      .toNumber();
  }
}
