"use client";

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
  trend?: number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  loading = false,
  trend,
  icon,
}) => {
  // Formata o número com separador de milhares
  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') return num;
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Determina o ícone e a cor com base na tendência
  const renderTrend = () => {
    if (trend === undefined) return null;
    
    if (trend > 0) {
      return (
        <Chip
          icon={<TrendingUpIcon />}
          label={`+${trend.toFixed(1)}%`}
          color="success"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    } else if (trend < 0) {
      return (
        <Chip
          icon={<TrendingDownIcon />}
          label={`${trend.toFixed(1)}%`}
          color="error"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    } else {
      return (
        <Chip
          icon={<TrendingFlatIcon />}
          label="0%"
          color="default"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    }
  };

  return (
    <Card sx={{ 
      minWidth: 220, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--surface)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
      transition: 'var(--transition)',
      '&:hover': {
        boxShadow: 'var(--shadow-md)',
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1, padding: 'var(--spacing-md)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              mb: 'var(--spacing-sm)'
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: 'var(--primary)' }}>
              {icon}
            </Box>
          )}
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
          </Box>
        ) : (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography 
              variant="h4" 
              component="div"
              sx={{ 
                fontSize: 'var(--font-size-xl)',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}
            >
              {formatNumber(value)}
            </Typography>
            {renderTrend()}
          </Box>
        )}
        
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1,
              color: 'var(--text-tertiary)',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            {subtitle}          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
