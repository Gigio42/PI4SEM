"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminStyles from "../admin.module.css";
import styles from "./stats.module.css";

// Mock chart data - this would come from an API
const mockChartData = {
  users: {
    "7days": [110, 115, 118, 125, 130, 135, 142],
    "30days": [90, 95, 105, 110, 115, 118, 125, 130, 132, 135, 138, 140, 142, 146, 150, 155, 160, 165, 168, 170, 173, 175, 178, 180, 182, 185, 188, 190, 192, 194],
    "3months": [50, 60, 75, 85, 90, 100, 110, 120, 130, 142, 150, 165, 178, 190, 200],
    "6months": [20, 35, 45, 60, 75, 90, 105, 115, 125, 140, 155, 165, 180, 194, 210],
    "year": [0, 15, 25, 35, 50, 65, 80, 95, 110, 125, 140, 160, 175, 194, 210]
  },
  downloads: {
    "7days": [245, 285, 310, 340, 375, 410, 450],
    "30days": [100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3500, 4000, 4500, 5000, 5324],
    "3months": [500, 800, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600, 3900, 4500, 4900, 5324],
    "6months": [200, 500, 800, 1100, 1400, 1700, 2000, 2300, 2600, 2900, 3200, 3800, 4400, 4900, 5324],
    "year": [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2800, 3200, 3800, 4500, 5000, 5324]
  },
  revenue: {
    "7days": [1200, 1350, 1400, 1550, 1700, 1850, 2000],
    "30days": [500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2400, 2700, 3000, 3400, 3800, 4200, 4600, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9200, 9400, 9600, 9800, 10000],
    "3months": [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 14000, 16000, 18000, 20000, 22000],
    "6months": [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 12000, 15000, 18000, 21000, 24000, 28000],
    "year": [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 25000, 28450]
  },
  conversion: {
    "7days": [4.2, 4.3, 4.1, 4.4, 4.3, 4.5, 4.5],
    "30days": [3.8, 3.9, 4.0, 4.1, 4.0, 4.2, 4.3, 4.2, 4.4, 4.3, 4.5, 4.4, 4.6, 4.5, 4.7, 4.6, 4.8, 4.7, 4.9, 4.8, 5.0, 4.9, 4.8, 4.7, 4.6, 4.5, 4.6, 4.5, 4.6, 4.5],
    "3months": [3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.5],
    "6months": [3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.5],
    "year": [2.5, 2.8, 3.0, 3.2, 3.5, 3.8, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.5]
  }
};

// Top components data
const mockTopComponents = [
  { id: '1', name: 'Card Moderno', color: '#6366F1', downloads: 1245 },
  { id: '2', name: 'Botão Glassmórfico', color: '#8B5CF6', downloads: 876 },
  { id: '3', name: 'Input Animado', color: '#10B981', downloads: 654 },
  { id: '4', name: 'Navbar Responsiva', color: '#F59E0B', downloads: 532 },
  { id: '5', name: 'Alerta Toast', color: '#EF4444', downloads: 428 }
];

// Subscription plan distribution
const mockPlanDistribution = [
  { name: 'Básico', percentage: 45, color: '#6366F1' },
  { name: 'Profissional', percentage: 32, color: '#8B5CF6' },
  { name: 'Empresarial', percentage: 23, color: '#10B981' }
];

export default function Statistics() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [chartType, setChartType] = useState("line");
  const [stats, setStats] = useState({
    users: 0,
    usersChange: 0,
    downloads: 0,
    downloadsChange: 0,
    revenue: 0,
    revenueChange: 0,
    conversion: 0,
    conversionChange: 0
  });
  const [chartData, setChartData] = useState({
    users: [],
    downloads: [],
    revenue: [],
    conversion: []
  });
  const [topComponents, setTopComponents] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);
  
  // Calculate the date strings based on selected period
  const dateRangeLabels = useMemo(() => {
    const today = new Date();
    let startDate = new Date();
    
    switch(selectedPeriod) {
      case "7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "3months":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  }, [selectedPeriod]);

  // Effect to update date inputs when period changes
  useEffect(() => {
    setDateRange(dateRangeLabels);
  }, [dateRangeLabels]);

  // Load data when component mounts or filters change
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real scenario, this would be API calls like:
        // const response = await fetch(`/api/stats?period=${selectedPeriod}&start=${dateRange.start}&end=${dateRange.end}`);
        // const data = await response.json();
        
        // For now, we'll use our mock data
        setChartData({
          users: mockChartData.users[selectedPeriod],
          downloads: mockChartData.downloads[selectedPeriod],
          revenue: mockChartData.revenue[selectedPeriod],
          conversion: mockChartData.conversion[selectedPeriod]
        });
        
        // Set current stats (latest values)
        const latestData = {
          users: mockChartData.users[selectedPeriod][mockChartData.users[selectedPeriod].length - 1],
          downloads: mockChartData.downloads[selectedPeriod][mockChartData.downloads[selectedPeriod].length - 1],
          revenue: mockChartData.revenue[selectedPeriod][mockChartData.revenue[selectedPeriod].length - 1],
          conversion: mockChartData.conversion[selectedPeriod][mockChartData.conversion[selectedPeriod].length - 1]
        };
        
        // Calculate percentage change
        const previousData = {
          users: mockChartData.users[selectedPeriod][0],
          downloads: mockChartData.downloads[selectedPeriod][0],
          revenue: mockChartData.revenue[selectedPeriod][0],
          conversion: mockChartData.conversion[selectedPeriod][0]
        };
        
        const calculateChange = (current, previous) => {
          if (previous === 0) return 100; // If starting from zero, it's a 100% increase
          return ((current - previous) / previous) * 100;
        };
        
        setStats({
          users: latestData.users,
          usersChange: calculateChange(latestData.users, previousData.users),
          downloads: latestData.downloads,
          downloadsChange: calculateChange(latestData.downloads, previousData.downloads),
          revenue: latestData.revenue,
          revenueChange: calculateChange(latestData.revenue, previousData.revenue),
          conversion: latestData.conversion,
          conversionChange: calculateChange(latestData.conversion, previousData.conversion)
        });
        
        // Set other data
        setTopComponents(mockTopComponents);
        setPlanDistribution(mockPlanDistribution);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setIsLoading(false);
      }
    };
    
    fetchStats();
    setLoaded(true);
  }, [selectedPeriod, dateRange.start, dateRange.end]);

  // Handle custom date range submission
  const handleDateFilterSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a new API request with the custom date range
    setSelectedPeriod("custom");
  };

  // Simple chart rendering function (in a real app, you would use a chart library)
  const renderChart = (data, type) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const height = 100; // Chart height in percentage
    
    return (
      <div className={styles.chartContainer} aria-hidden="true">
        {type === "line" && (
          <svg className={styles.lineChart} viewBox={`0 0 ${data.length} ${height}`} preserveAspectRatio="none">
            <path
              d={data.map((val, i) => {
                const x = i;
                const normalizedY = height - ((val - min) / range) * height || 0;
                return `${i === 0 ? 'M' : 'L'} ${x} ${normalizedY}`;
              }).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
        {type === "bar" && (
          <div className={styles.barChart}>
            {data.map((val, i) => {
              const normalizedHeight = ((val - min) / range) * height || 0;
              return (
                <div 
                  key={i}
                  className={styles.bar}
                  style={{height: `${normalizedHeight}%`}}
                ></div>
              );
            })}
          </div>
        )}
        {type === "area" && (
          <svg className={styles.areaChart} viewBox={`0 0 ${data.length} ${height}`} preserveAspectRatio="none">
            <path
              d={`
                ${data.map((val, i) => {
                  const x = i;
                  const normalizedY = height - ((val - min) / range) * height || 0;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${normalizedY}`;
                }).join(' ')}
                L ${data.length - 1} ${height}
                L 0 ${height}
                Z
              `}
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
    );
  };

  // Render donut chart for plan distribution
  const renderDonutChart = () => {
    if (!planDistribution || planDistribution.length === 0) return null;
    
    let cumulativePercentage = 0;
    
    return (
      <div className={styles.donutChartContainer} aria-hidden="true">
        <div className={styles.donutChart}>
          {planDistribution.map((segment, index) => {
            const startAngle = cumulativePercentage * 3.6; // Convert to degrees (360 / 100)
            cumulativePercentage += segment.percentage;
            const endAngle = cumulativePercentage * 3.6;
            
            const x1 = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
            
            return (
              <svg key={index} viewBox="0 0 100 100" className={styles.donutSegment} style={{zIndex: index}}>
                <path
                  d={`
                    M 50 50
                    L ${x1} ${y1}
                    A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
                    Z
                  `}
                  fill={segment.color}
                />
              </svg>
            );
          })}
          <div className={styles.donutHole}></div>
        </div>
      </div>
    );
  };

  return (
    <div className={adminStyles.pageWrapper}>
      <Header />
      <div className={adminStyles.layoutContainer}>
        <Sidebar isAdmin={true} />
        <main className={`${adminStyles.mainContent} ${loaded ? adminStyles.loaded : ""}`}>
          <div className={adminStyles.contentHeader}>
            <h1 className={adminStyles.pageTitle}>Estatísticas</h1>
            <p className={adminStyles.pageDescription}>
              Visualize métricas e tendências da plataforma
            </p>
          </div>

          <div className={styles.dateFilter} role="form">
            <select 
              className={styles.periodSelect}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Selecionar período"
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="year">Último ano</option>
              {selectedPeriod === "custom" && <option value="custom">Personalizado</option>}
            </select>
            
            <form onSubmit={handleDateFilterSubmit} className={styles.dateRangeForm}>
              <div className={styles.dateRangePicker}>
                <input 
                  type="date" 
                  className={styles.dateInput}
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  aria-label="Data inicial"
                />
                <span className={styles.dateRangeSeparator}>até</span>
                <input 
                  type="date" 
                  className={styles.dateInput}
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  aria-label="Data final"
                  max={new Date().toISOString().split('T')[0]} // Today's date as max
                />
              </div>
              <button 
                type="submit" 
                className={styles.filterButton}
                aria-label="Aplicar filtro de datas"
                disabled={!dateRange.start || !dateRange.end}
              >
                Aplicar Filtro
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando estatísticas...</p>
            </div>
          ) : (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Usuários Registrados</h3>
                    <button className={styles.infoButton} aria-label="Informações sobre usuários registrados">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.statsCardBody}>
                    <div className={styles.statsNumber}>{stats.users}</div>
                    <div className={`${styles.statsChange} ${stats.usersChange >= 0 ? styles.positive : styles.negative}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d={stats.usersChange >= 0 
                            ? "M12 19V5M12 5L5 12M12 5L19 12" 
                            : "M12 5V19M12 19L5 12M12 19L19 12"}
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      {Math.abs(stats.usersChange).toFixed(1)}%
                    </div>
                  </div>
                  <div className={styles.statsChart}>
                    {renderChart(chartData.users, "line")}
                  </div>
                </div>
                
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Downloads de Componentes</h3>
                    <button className={styles.infoButton} aria-label="Informações sobre downloads de componentes">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.statsCardBody}>
                    <div className={styles.statsNumber}>{stats.downloads.toLocaleString()}</div>
                    <div className={`${styles.statsChange} ${stats.downloadsChange >= 0 ? styles.positive : styles.negative}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d={stats.downloadsChange >= 0 
                            ? "M12 19V5M12 5L5 12M12 5L19 12" 
                            : "M12 5V19M12 19L5 12M12 19L19 12"}
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      {Math.abs(stats.downloadsChange).toFixed(1)}%
                    </div>
                  </div>
                  <div className={styles.statsChart}>
                    {renderChart(chartData.downloads, "line")}
                  </div>
                </div>
                
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Receita Total</h3>
                    <button className={styles.infoButton} aria-label="Informações sobre receita total">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.statsCardBody}>
                    <div className={styles.statsNumber}>
                      R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`${styles.statsChange} ${stats.revenueChange >= 0 ? styles.positive : styles.negative}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d={stats.revenueChange >= 0 
                            ? "M12 19V5M12 5L5 12M12 5L19 12" 
                            : "M12 5V19M12 19L5 12M12 19L19 12"}
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      {Math.abs(stats.revenueChange).toFixed(1)}%
                    </div>
                  </div>
                  <div className={styles.statsChart}>
                    {renderChart(chartData.revenue, "area")}
                  </div>
                </div>
                
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Taxa de Conversão</h3>
                    <button className={styles.infoButton} aria-label="Informações sobre taxa de conversão">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.statsCardBody}>
                    <div className={styles.statsNumber}>{stats.conversion.toFixed(1)}%</div>
                    <div className={`${styles.statsChange} ${stats.conversionChange >= 0 ? styles.positive : styles.negative}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d={stats.conversionChange >= 0 
                            ? "M12 19V5M12 5L5 12M12 5L19 12" 
                            : "M12 5V19M12 19L5 12M12 19L19 12"}
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      {Math.abs(stats.conversionChange).toFixed(1)}%
                    </div>
                  </div>
                  <div className={styles.statsChart}>
                    {renderChart(chartData.conversion, "bar")}
                  </div>
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.wideStatsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Tendências de Downloads</h3>
                    <div className={styles.cardActions}>
                      <select 
                        className={styles.chartTypeSelect}
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        aria-label="Tipo de gráfico"
                      >
                        <option value="line">Linha</option>
                        <option value="bar">Barras</option>
                        <option value="area">Área</option>
                      </select>
                      <button 
                        className={styles.exportButton}
                        aria-label="Exportar dados"
                        onClick={() => alert('Funcionalidade de exportação será implementada futuramente.')}
                      >
                        Exportar
                      </button>
                    </div>
                  </div>
                  <div className={styles.largeChart}>
                    {renderChart(chartData.downloads, chartType)}
                    <div className={styles.chartLabels}>
                      <div className={styles.chartAxisX}>
                        <span>{new Date(dateRange.start).toLocaleDateString('pt-BR')}</span>
                        <span>{new Date(dateRange.end).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.halfStatsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Componentes Mais Populares</h3>
                    <button 
                      className={styles.viewAllButton}
                      aria-label="Ver todos os componentes"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className={styles.statsList}>
                    {topComponents.map((component, index) => (
                      <div className={styles.statsListItem} key={component.id}>
                        <div className={styles.statsListRank}>#{index + 1}</div>
                        <div className={styles.statsListItemContent}>
                          <div className={styles.componentPreview} style={{backgroundColor: component.color}}></div>
                          <div className={styles.statsListItemName}>{component.name}</div>
                        </div>
                        <div className={styles.statsListItemValue}>{component.downloads.toLocaleString()} downloads</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.halfStatsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Usuários por Plano</h3>
                    <button 
                      className={styles.viewAllButton}
                      aria-label="Ver detalhes de usuários por plano"
                    >
                      Detalhes
                    </button>
                  </div>
                  <div className={styles.donutChartContainer}>
                    {renderDonutChart()}
                    <div className={styles.donutLegend}>
                      {planDistribution.map((plan, index) => (
                        <div className={styles.legendItem} key={index}>
                          <div className={styles.legendColor} style={{backgroundColor: plan.color}}></div>
                          <div className={styles.legendLabel}>{plan.name}</div>
                          <div className={styles.legendValue}>{plan.percentage}%</div>
                        </div>
                      ))}
                    </div>
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
