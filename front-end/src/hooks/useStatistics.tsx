"use client";

import { useState, useEffect } from 'react';
import statisticsService, { 
  StatisticsOverview, 
  TopComponent, 
  MostFavoritedComponent 
} from '../services/statistics.service';

export function useStatistics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<StatisticsOverview | null>(null);
  const [topViewed, setTopViewed] = useState<TopComponent[]>([]);
  const [topFavorited, setTopFavorited] = useState<MostFavoritedComponent[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Função para registrar a visualização de um componente
  const registerComponentView = async (componentId: number) => {
    await statisticsService.registerComponentView(componentId);
  };

  // Função para carregar todos os dados de estatísticas
  const loadAllStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, viewedData, favoritedData] = await Promise.all([
        statisticsService.getOverviewStatistics(),
        statisticsService.getMostViewedComponents(),
        statisticsService.getMostFavoritedComponents(),
      ]);

      setOverview(overviewData);
      setTopViewed(viewedData);
      setTopFavorited(favoritedData);
    } catch (err) {
      setError('Erro ao carregar estatísticas. Por favor, tente novamente.');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar estatísticas com filtro de data
  const loadStatisticsByDateRange = async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const viewedData = await statisticsService.getMostViewedComponents(
        startDate,
        endDate,
      );
      setTopViewed(viewedData);
      setDateRange({ startDate, endDate });
    } catch (err) {
      setError('Erro ao carregar estatísticas. Por favor, tente novamente.');
      console.error('Error loading statistics by date range:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas ao montar o componente
  useEffect(() => {
    loadAllStatistics();
  }, []);

  return {
    loading,
    error,
    overview,
    topViewed,
    topFavorited,
    dateRange,
    registerComponentView,
    loadAllStatistics,
    loadStatisticsByDateRange,
  };
}
