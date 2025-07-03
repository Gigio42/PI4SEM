"use client";

import React, { useState, useEffect } from 'react';
import styles from './statistics.module.css';
import Header from "@/app/components/Header/Header";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import adminStyles from "../admin.module.css";
import { formatCurrency } from '@/utils/formatters';
import { useStatistics } from '@/hooks/useStatistics';
import { TopComponent, MostFavoritedComponent } from '@/services/statistics.service';
import StatCard from '@/app/components/statistics/StatCard';
import TopComponentsChart from '@/app/components/statistics/TopComponentsChart';
import TimeChart from '@/app/components/statistics/TimeChart';

export default function StatisticsPage() {
  const {
    loading,
    error,
    overview,
    topViewed,
    topFavorited,
    dateRange,
    loadStatisticsByDateRange,
  } = useStatistics();

  const [loaded, setLoaded] = useState(false);
  const [startDate, setStartDate] = useState<string>(
    dateRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    dateRange.endDate || new Date().toISOString().split('T')[0]
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Função para aplicar o filtro de data
  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setDateError('Por favor, selecione as datas de início e fim');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setDateError('A data de início deve ser anterior à data de fim');
      return;
    }

    setDateError(null);
    loadStatisticsByDateRange(startDate, endDate);
  };

  // Formatar dados para o gráfico de componentes mais vistos
  const formatTopViewedData = (data: TopComponent[]) => {
    return data.map(item => ({
      name: item.name,
      value: item.views,
    })).sort((a, b) => b.value - a.value);
  };

  // Formatar dados para o gráfico de componentes mais favoritados
  const formatTopFavoritedData = (data: MostFavoritedComponent[]) => {
    return data.map(item => ({
      name: item.name,
      value: item.favorites,
    })).sort((a, b) => b.value - a.value);
  };

  // Formatar dados para o gráfico de séries temporais
  const formatTimeSeriesData = () => {
    if (!overview?.dailyStats) return [];
    
    return overview.dailyStats.map(stat => ({
      date: stat.date,
      'Novos Usuários': stat.newUsers,
      'Usuários Ativos': stat.activeUsers,
      'Assinaturas': stat.totalSubscriptions,
    }));
  };

  // Formatar dados para o gráfico de receitas
  const formatRevenueData = () => {
    if (!overview?.dailyStats) return [];
    
    return overview.dailyStats.map(stat => ({
      date: stat.date,
      'Receita': stat.revenue,
    }));
  };

  // Formatar dados para o gráfico de taxa de conversão
  const formatConversionRateData = () => {
    if (!overview?.dailyStats) return [];
    
    return overview.dailyStats.map(stat => ({
      date: stat.date,
      'Taxa de Conversão': stat.conversionRate,
    }));
  };

  // Função para lidar com a mudança de tabs
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""} ${styles.statisticsPage}`}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Dashboard de Estatísticas</h1>
              <p className={styles.pageDescription}>
                Visualize e analise o desempenho da plataforma e comportamento dos usuários
              </p>
            </div>
          </div>

          {loading && !overview ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Carregando estatísticas...</p>
            </div>
          ) : error ? (
            <div className={styles.errorAlert}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Cards de estatísticas gerais */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.statIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.statLabel}>Total de Usuários</div>
                  </div>
                  <div className={styles.statValue}>{overview?.totalUsers || 0}</div>
                  {overview?.userGrowth !== undefined && (
                    <div className={`${styles.statTrend} ${overview.userGrowth >= 0 ? styles.positive : styles.negative}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d={overview.userGrowth >= 0 
                          ? "M18 15L12 9L6 15" 
                          : "M6 9L12 15L18 9"} 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{Math.abs(overview.userGrowth)}% nos últimos 30 dias</span>
                    </div>
                  )}
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.statIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.statLabel}>Assinaturas Ativas</div>
                  </div>
                  <div className={styles.statValue}>{overview?.totalActiveSubscriptions || 0}</div>
                  <div className={styles.statSubtext}>Assinaturas ativas atualmente</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.statIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1V23M17 5H9.5C8.5717 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.5717 6 8.5C6 9.4283 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.5717 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.statLabel}>Receita Total</div>
                  </div>
                  <div className={styles.statValue}>{formatCurrency(overview?.totalRevenue || 0)}</div>
                  {overview?.revenueGrowth !== undefined && (
                    <div className={`${styles.statTrend} ${overview.revenueGrowth >= 0 ? styles.positive : styles.negative}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d={overview.revenueGrowth >= 0 
                          ? "M18 15L12 9L6 15" 
                          : "M6 9L12 15L18 9"} 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{Math.abs(overview.revenueGrowth)}% nos últimos 30 dias</span>
                    </div>
                  )}
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.statIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8V4M12 8V4M8 8V4M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.statLabel}>Taxa de Conversão</div>
                  </div>
                  <div className={styles.statValue}>
                    {overview?.dailyStats?.length ? 
                      (typeof overview.dailyStats[overview.dailyStats.length - 1].conversionRate === 'number' 
                        ? overview.dailyStats[overview.dailyStats.length - 1].conversionRate.toFixed(2) 
                        : Number(overview.dailyStats[overview.dailyStats.length - 1].conversionRate).toFixed(2)) + '%' 
                      : '0%'}
                  </div>
                  <div className={styles.statSubtext}>Usuários convertidos em assinantes</div>
                </div>
              </div>

              {/* Filtro de Data */}
              <div className={styles.dateFilterCard}>
                <div className={styles.dateFilterHeader}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3>Filtrar por Período</h3>
                </div>
                
                <div className={styles.dateFilterContent}>
                  <div className={styles.dateInputs}>
                    <div className={styles.dateInputGroup}>
                      <label htmlFor="startDate">Data de Início</label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                    
                    <div className={styles.dateInputGroup}>
                      <label htmlFor="endDate">Data de Fim</label>
                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={styles.dateInput}
                        min={startDate}
                      />
                    </div>
                    
                    <button
                      onClick={handleDateFilter}
                      className={styles.applyDateButton}
                    >
                      Aplicar Filtro
                    </button>
                  </div>
                  
                  {dateError && (
                    <div className={styles.dateError}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{dateError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs de Gráficos */}
              <div className={styles.chartContainer}>
                <div className={styles.chartTabs}>
                  <button 
                    className={`${styles.chartTab} ${activeTab === 0 ? styles.active : ''}`}
                    onClick={() => handleTabChange(0)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Usuários e Assinaturas
                  </button>
                  <button 
                    className={`${styles.chartTab} ${activeTab === 1 ? styles.active : ''}`}
                    onClick={() => handleTabChange(1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1V23M17 5H9.5C8.5717 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.5717 6 8.5C6 9.4283 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.5717 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Receita
                  </button>
                  <button 
                    className={`${styles.chartTab} ${activeTab === 2 ? styles.active : ''}`}
                    onClick={() => handleTabChange(2)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 3H21V8M21 16V21H16M8 21H3V16M3 8V3H8M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Taxa de Conversão
                  </button>
                </div>
                
                <div className={styles.chartContent}>
                  {activeTab === 0 && (
                    <div className={styles.chart}>
                      {overview?.dailyStats && overview.dailyStats.length > 0 ? (
                        <TimeChart
                          title="Evolução de Usuários e Assinaturas"
                          data={formatTimeSeriesData()}
                          dataKeys={[
                            { key: 'Novos Usuários', color: 'var(--primary)' },
                            { key: 'Usuários Ativos', color: 'var(--action-send)' },
                            { key: 'Assinaturas', color: 'var(--action-withdraw)' },
                          ]}
                          type="area"
                          height={350}
                        />
                      ) : (
                        <div className={styles.noDataMessage}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M7 17V13M12 17V9M17 17V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p>Dados insuficientes para exibir o gráfico</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 1 && (
                    <div className={styles.chart}>
                      {overview?.dailyStats && overview.dailyStats.length > 0 ? (
                        <TimeChart
                          title="Evolução da Receita"
                          data={formatRevenueData()}
                          dataKeys={[
                            { key: 'Receita', color: 'var(--action-payment)' },
                          ]}
                          type="area"
                          height={350}
                        />
                      ) : (
                        <div className={styles.noDataMessage}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M7 17V13M12 17V9M17 17V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p>Dados insuficientes para exibir o gráfico</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 2 && (
                    <div className={styles.chart}>
                      {overview?.dailyStats && overview.dailyStats.length > 0 ? (
                        <TimeChart
                          title="Evolução da Taxa de Conversão"
                          data={formatConversionRateData()}
                          dataKeys={[
                            { key: 'Taxa de Conversão', color: 'var(--action-packages)' },
                          ]}
                          type="area"
                          height={350}
                        />
                      ) : (
                        <div className={styles.noDataMessage}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M7 17V13M12 17V9M17 17V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p>Dados insuficientes para exibir o gráfico</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Componentes mais populares */}
              <h2 className={styles.sectionTitle}>
                Análise de Componentes
                <span className={styles.sectionTitleAccent}></span>
              </h2>

              <div className={styles.componentsGrid}>
                <div className={styles.componentCard}>
                  <div className={styles.componentCardHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>Componentes Mais Visualizados</h3>
                  </div>
                  <div className={styles.componentChart}>
                    <TopComponentsChart
                      title=""
                      data={formatTopViewedData(topViewed)}
                      horizontal={true}
                    />
                  </div>
                </div>
                
                <div className={styles.componentCard}>
                  <div className={styles.componentCardHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.favoriteIcon}>
                      <path d="M20.8401 4.60987C20.3294 4.09888 19.7229 3.69352 19.0555 3.41696C18.388 3.14039 17.6726 2.99805 16.9501 2.99805C16.2276 2.99805 15.5122 3.14039 14.8448 3.41696C14.1773 3.69352 13.5709 4.09888 13.0601 4.60987L12.0001 5.66987L10.9401 4.60987C9.90843 3.57818 8.50915 2.99858 7.05012 2.99858C5.59109 2.99858 4.19181 3.57818 3.16012 4.60987C2.12843 5.64156 1.54883 7.04084 1.54883 8.49987C1.54883 9.95891 2.12843 11.3582 3.16012 12.3899L4.22012 13.4499L12.0001 21.2299L19.7801 13.4499L20.8401 12.3899C21.3511 11.8791 21.7565 11.2727 22.033 10.6052C22.3096 9.93777 22.4519 9.22236 22.4519 8.49987C22.4519 7.77738 22.3096 7.06198 22.033 6.39452C21.7565 5.72706 21.3511 5.12063 20.8401 4.60987V4.60987Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>Componentes Mais Favoritados</h3>
                  </div>
                  <div className={styles.componentChart}>
                    <TopComponentsChart
                      title=""
                      data={formatTopFavoritedData(topFavorited)}
                      color="var(--google-red)"
                      horizontal={true}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
