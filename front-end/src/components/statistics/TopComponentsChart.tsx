"use client";

import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface DataItem {
  name: string;
  value: number;
}

interface TopComponentsChartProps {
  data: DataItem[];
  title: string;
  color?: string;
  dataKey?: string;
  horizontal?: boolean;
}

const TopComponentsChart: React.FC<TopComponentsChartProps> = ({
  data,
  title,
  color,
  dataKey = 'value',
  horizontal = true,
}) => {
  const theme = useTheme();
  const chartColor = color || 'var(--primary)';
  
  // Limite o número de componentes exibidos para melhor visualização
  const limitedData = data.slice(0, 7);
  
  // Gerar cores com base na quantidade de dados
  const getColor = (index: number) => {
    const colors = [
      'var(--primary)',
      'var(--action-topup)',
      'var(--action-send)',
      'var(--action-payment)',
      'var(--action-withdraw)',
      'var(--action-packages)',
      'var(--primary-light)',
    ];
    
    return colors[index % colors.length];
  };

  return (
    <Paper sx={{ 
      p: 'var(--spacing-md)', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--surface)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
      overflow: 'hidden',
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          color: 'var(--text-primary)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          mb: 'var(--spacing-md)'
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1, height: 300, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          {horizontal ? (
            <BarChart
              layout="vertical"
              data={limitedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                type="number" 
                tick={{ fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}`, dataKey === 'value' ? 'Quantidade' : dataKey]}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
              />
              <Bar 
                dataKey={dataKey} 
                radius={[0, 4, 4, 0]}
              >
                {limitedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={limitedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}`, dataKey === 'value' ? 'Quantidade' : dataKey]}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
              />
              <Bar 
                dataKey={dataKey} 
                radius={[4, 4, 0, 0]}
              >
                {limitedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
        
        {data.length === 0 && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              backgroundColor: 'rgba(var(--background), 0.7)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Typography 
              sx={{ 
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-base)',
                textAlign: 'center'
              }}
            >
              Nenhum dado disponível para exibição
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TopComponentsChart;
