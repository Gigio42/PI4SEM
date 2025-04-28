"use client";

import { useState, useEffect, useMemo, useCallback, useRef, FormEvent, ChangeEvent } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminStyles from "../admin.module.css";
import styles from "./stats.module.css";

// Define interfaces for type checking
interface StatsData {
  users: number;
  usersChange: number;
  downloads: number;
  downloadsChange: number;
  revenue: number;
  revenueChange: number;
  conversion: number;
  conversionChange: number;
}

interface ChartData {
  users: number[];
  downloads: number[];
  revenue: number[];
  conversion: number[];
}

interface ComponentItem {
  id: string | number;
  name: string;
  color: string;
  downloads: number;
}

interface PlanItem {
  name: string;
  percentage: number;
  color: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  value: string | number;
  label: string;
}

interface DateRangeState {
  start: string;
  end: string;
}

type ChartType = "line" | "bar" | "area";
type PeriodType = "7days" | "30days" | "3months" | "6months" | "year" | "custom";
type DataType = "users" | "downloads" | "revenue" | "conversion" | "default";

export default function Statistics() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("30days");
  const [dateRange, setDateRange] = useState<DateRangeState>({ start: '', end: '' });
  const [chartType, setChartType] = useState<ChartType>("line");
  const [activeTooltip, setActiveTooltip] = useState<TooltipState>({ 
    visible: false, 
    x: 0, 
    y: 0, 
    value: 0, 
    label: '' 
  });
  const [error, setError] = useState<string>('');
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState<StatsData>({
    users: 0,
    usersChange: 0,
    downloads: 0,
    downloadsChange: 0,
    revenue: 0,
    revenueChange: 0,
    conversion: 0,
    conversionChange: 0
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    users: [],
    downloads: [],
    revenue: [],
    conversion: []
  });
  
  const [topComponents, setTopComponents] = useState<ComponentItem[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanItem[]>([]);
  
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
        setError('');
        
        // Fetch data from API endpoints
        // Example API calls:
        // const statsResponse = await fetch(`/api/statistics?period=${selectedPeriod}&start=${dateRange.start}&end=${dateRange.end}`);
        // const statsData = await statsResponse.json();
        
        // For demonstration, use empty data
        // In a real application, replace this with actual API calls
        setChartData({
          users: [],
          downloads: [],
          revenue: [],
          conversion: []
        });
        
        setStats({
          users: 0,
          usersChange: 0,
          downloads: 0,
          downloadsChange: 0,
          revenue: 0,
          revenueChange: 0,
          conversion: 0,
          conversionChange: 0
        });
        
        setTopComponents([]);
        setPlanDistribution([]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Ocorreu um erro ao carregar as estatísticas. Por favor, tente novamente.');
        setIsLoading(false);
      }
    };
    
    fetchStats();
    setLoaded(true);
  }, [selectedPeriod, dateRange.start, dateRange.end]);

  // Handle custom date range submission
  const handleDateFilterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // This would trigger a new API request with the custom date range
    setSelectedPeriod("custom");
  };

  // Format values for different data types
  const formatValue = useCallback((value: number, type: DataType): string => {
    switch(type) {
      case 'revenue':
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'conversion':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  }, []);

  // Handle tooltip for chart interaction
  const handleChartHover = useCallback((e: React.MouseEvent<HTMLDivElement>, data: number[], dataType: DataType, label: string) => {
    if (!data || data.length === 0) return;
    
    const chartRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - chartRect.left;
    const width = chartRect.width;
    
    // Calculate which data point is being hovered
    const index = Math.min(Math.floor((x / width) * data.length), data.length - 1);
    const value = data[index];
    
    setActiveTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      value: formatValue(value, dataType),
      label
    });
  }, [formatValue]);

  const handleChartLeave = useCallback(() => {
    setActiveTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Simple chart rendering function with enhanced interactivity
  const renderChart = useCallback((data: number[], type: ChartType, label: string, dataType: DataType = 'default') => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const height = 100; // Chart height in percentage
    
    return (
      <div 
        className={styles.chartContainer} 
        aria-hidden="true"
        onMouseMove={(e) => handleChartHover(e, data, dataType, label)}
        onMouseLeave={handleChartLeave}
        role="img"
        aria-label={`${label} ${type} chart`}
      >
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
                  data-value={formatValue(val, dataType)}
                  aria-label={`${formatValue(val, dataType)}`}
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
  }, [handleChartHover, handleChartLeave, formatValue]);

  // Render donut chart for plan distribution with better interaction
  const renderDonutChart = useCallback(() => {
    if (!planDistribution || planDistribution.length === 0) return null;
    
    let cumulativePercentage = 0;
    const total = planDistribution.reduce((sum, segment) => sum + segment.percentage, 0);
    
    return (
      <div className={styles.donutChartContainer} aria-label="Gráfico de distribuição de planos">
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
                  aria-label={`${segment.name}: ${segment.percentage}%`}
                  tabIndex={0}
                />
              </svg>
            );
          })}
          <div className={styles.donutHole}>
            {total}%
          </div>
        </div>
      </div>
    );
  }, [planDistribution]);

  // Format period label for display
  const getPeriodLabel = useCallback((period: PeriodType): string => {
            
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Aplicar Filtro
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando estatísticas para o período: {getPeriodLabel(selectedPeriod)}</p>
            </div>
          ) : error ? (
            <div className={styles.noDataState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Erro ao carregar dados</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className={styles.filterButton}
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Tentar Novamente
              </button>
            </div>
          ) : chartData.users.length === 0 ? (
            <div className={styles.noDataState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8V16M12 11V16M8 14V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Sem dados para exibir</h3>
              <p>Não há dados disponíveis para o período selecionado. Tente selecionar outro período ou conectar a API de estatísticas.</p>
            </div>
          ) : (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Usuários Registrados</h3>
                    <button 
                      className={styles.infoButton} 
                      aria-label="Informações sobre usuários registrados"
                      title="Total de usuários cadastrados na plataforma"
                    >
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
                    {renderChart(chartData.users, "line", "Usuários", "users")}
                  </div>
                </div>
                
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Downloads de Componentes</h3>
                    <button 
                      className={styles.infoButton} 
                      aria-label="Informações sobre downloads de componentes"
                      title="Total de componentes baixados pelos usuários"
                    >
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
                    {renderChart(chartData.downloads, "line", "Downloads", "downloads")}
                  </div>
                </div>
                
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Receita Total</h3>
                    <button 
                      className={styles.infoButton} 
                      aria-label="Informações sobre receita total"
                      title="Receita total gerada no período"
                    >
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
                    {renderChart(chartData.revenue, "area", "Receita", "revenue")}
                  </div>
                </div>
                
                <div className={styles.statsCard}>
                  <div className={styles.statsCardHeader}>
                    <h3>Taxa de Conversão</h3>
                    <button 
                      className={styles.infoButton} 
                      aria-label="Informações sobre taxa de conversão"
                      title="Porcentagem de visitantes que se tornam assinantes"
                    >
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
                    {renderChart(chartData.conversion, "bar", "Taxa de Conversão", "conversion")}
                  </div>
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.wideStatsCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8V16M12 11V16M8 14V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Tendências de Downloads
                    </h3>
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
                        onClick={() => alert('Funcionalidade de exportação será implementada futuramente.')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Exportar
                      </button>
                    </div>
                  </div>
                  <div className={styles.largeChart}>
                    {renderChart(chartData.downloads, chartType, "Downloads de Componentes", "downloads")}
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
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Componentes Mais Populares
                    </h3>
                    <button 
                      className={styles.viewAllButton}
                      aria-label="Ver todos os componentes"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ver todos
                    </button>
                  </div>
                  <div className={styles.statsList}>
                    {topComponents.map((component, index) => (
                      <div className={styles.statsListItem} key={component.id}>
                        <div className={styles.statsListRank}>#{index + 1}</div>
                        <div className={styles.statsListItemContent}>
                          <div 
                            className={styles.componentPreview} 
                            style={{backgroundColor: component.color}}
                            title={component.name}
                          ></div>
                          <div className={styles.statsListItemName}>{component.name}</div>
                        </div>
                        <div className={styles.statsListItemValue}>{component.downloads.toLocaleString()} downloads</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.halfStatsCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Usuários por Plano
                    </h3>
                    <button 
                      className={styles.viewAllButton}
                      aria-label="Ver detalhes de usuários por plano"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Detalhes
                    </button>
                  </div>
                  <div className={styles.donutChartContainer}>
                    {renderDonutChart()}
                    <div className={styles.donutLegend}>
                      {planDistribution.map((plan, index) => (
                        <div className={styles.legendItem} key={index} tabIndex={0}>
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

          {/* Tooltip for chart interactions */}
          {activeTooltip.visible && (
            <div 
              ref={tooltipRef}
              className={`${styles.chartTooltip} ${styles.visible}`}
              style={{
                left: `${activeTooltip.x}px`,
                top: `${activeTooltip.y - 40}px`,
              }}
            >
              <div className={styles.tooltipLabel}>{activeTooltip.label}</div>
              <div className={styles.tooltipValue}>{activeTooltip.value}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
