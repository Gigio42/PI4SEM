"use client";

import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TimeSeriesData {
  date: string;
  [key: string]: any;
}

interface TimeChartProps {
  data: TimeSeriesData[];
  title: string;
  dataKeys: {
    key: string;
    color?: string;
    name?: string;
  }[];
  type?: 'line' | 'area';
  height?: number;
}

const TimeChart: React.FC<TimeChartProps> = ({ 
  data, 
  title, 
  dataKeys,
  type = 'area',
  height = 300
}) => {
  const theme = useTheme();

  // Formatar data para exibição no eixo X
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
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
      <Box sx={{ flexGrow: 1, height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                {dataKeys.map((item, index) => (
                  <linearGradient key={`${item.key}-gradient`} id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={item.color || `var(--primary)`} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={item.color || `var(--primary)`} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                minTickGap={30}
                tick={{ fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
                labelFormatter={(label) => {
                  if (typeof label === 'string') {
                    return new Date(label).toLocaleDateString('pt-BR');
                  }
                  return label;
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: 'var(--spacing-sm)',
                  color: 'var(--text-secondary)'
                }}
              />
              {dataKeys.map((item, index) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={item.key}
                  name={item.name || item.key}
                  stroke={item.color || `var(--primary)`}
                  fill={`url(#color-${item.key})`}
                  activeDot={{ r: 8, stroke: 'var(--surface)', strokeWidth: 2 }}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                minTickGap={30}
                tick={{ fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
                labelFormatter={(label) => {
                  if (typeof label === 'string') {
                    return new Date(label).toLocaleDateString('pt-BR');
                  }
                  return label;
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: 'var(--spacing-sm)',
                  color: 'var(--text-secondary)'
                }}
              />
              {dataKeys.map((item, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={item.key}
                  name={item.name || item.key}
                  stroke={item.color || `var(--primary)`}
                  activeDot={{ r: 8, stroke: 'var(--surface)', strokeWidth: 2 }}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TimeChart;

