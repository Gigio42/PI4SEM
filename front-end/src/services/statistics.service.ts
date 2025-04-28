import axios from 'axios';

// Definição de tipos para estatísticas
export interface ComponentView {
  componentId: number;
  sessionId?: string;
}

export interface StatisticsOverview {
  totalUsers: number;
  totalActiveSubscriptions: number;
  totalRevenue: number;
  userGrowth: number;
  revenueGrowth: number;
  dailyStats: DailyStatistics[];
  topComponents: TopComponent[];
}

export interface DailyStatistics {
  id: number;
  date: string;
  componentViews: Record<string, number>;
  newUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  revenue: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopComponent {
  id: number;
  name: string;
  category: string;
  views: number;
}

export interface MostFavoritedComponent {
  id: number;
  name: string;
  category: string;
  favorites: number;
}

// Classe do serviço
class StatisticsService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Registra visualização de um componente
  async registerComponentView(componentId: number) {
    try {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('sessionId', sessionId);
      }

      await axios.post(`${this.apiUrl}/statistics/view`, {
        componentId,
        sessionId,
      });
    } catch (error) {
      console.error('Error registering component view:', error);
    }
  }

  // Obtém estatísticas diárias
  async getDailyStatistics(date?: string) {
    try {
      const params = date ? { date } : {};
      const response = await axios.get(`${this.apiUrl}/statistics/daily`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily statistics:', error);
      throw error;
    }
  }

  // Obtém estatísticas por intervalo de datas
  async getStatisticsByDateRange(startDate: string, endDate: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/statistics/range`, {
        params: { startDate, endDate },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics by date range:', error);
      throw error;
    }
  }

  // Obtém visão geral das estatísticas
  async getOverviewStatistics(): Promise<StatisticsOverview> {
    try {
      const response = await axios.get(`${this.apiUrl}/statistics/overview`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching overview statistics:', error);
      throw error;
    }
  }

  // Obtém componentes mais visualizados
  async getMostViewedComponents(
    startDate?: string,
    endDate?: string,
    limit = 10
  ): Promise<TopComponent[]> {
    try {
      const params: any = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${this.apiUrl}/statistics/most-viewed`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching most viewed components:', error);
      throw error;
    }
  }

  // Obtém componentes mais favoritados
  async getMostFavoritedComponents(
    limit = 10
  ): Promise<MostFavoritedComponent[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/statistics/most-favorited`,
        {
          params: { limit },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching most favorited components:', error);
      throw error;
    }
  }
}

export default new StatisticsService();
