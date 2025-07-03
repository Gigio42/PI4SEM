"use client";

import React from 'react';
import { Box, Typography } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SearchIcon from '@mui/icons-material/Search';
import DataUsageIcon from '@mui/icons-material/DataUsage';

interface EmptyStateMessageProps {
  title?: string;
  message?: string;
  icon?: 'chart' | 'search' | 'data' | React.ReactNode;
  height?: number | string;
}

/**
 * Componente que exibe uma mensagem visualmente atraente quando não há dados disponíveis
 */
const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
  title = "Dados insuficientes para exibir o gráfico",
  message = "Tente selecionar um período diferente ou aguarde mais dados serem coletados",
  icon = 'chart',
  height = '100%',
}) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    
    switch (icon) {
      case 'chart':
        return <ShowChartIcon sx={{ fontSize: 48, color: 'var(--text-tertiary)' }} />;
      case 'search':
        return <SearchIcon sx={{ fontSize: 48, color: 'var(--text-tertiary)' }} />;
      case 'data':
        return <DataUsageIcon sx={{ fontSize: 48, color: 'var(--text-tertiary)' }} />;
      default:
        return <ShowChartIcon sx={{ fontSize: 48, color: 'var(--text-tertiary)' }} />;
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      flexDirection="column"
      height={height}
      sx={{
        background: 'var(--surface-secondary)',
        borderRadius: 'var(--radius-sm)',
        border: '1px dashed var(--border)',
        p: 'var(--spacing-md)'
      }}
    >
      <Box sx={{ mb: 'var(--spacing-sm)' }}>
        {renderIcon()}
      </Box>
      <Typography 
        sx={{ 
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 500,
          mb: 'var(--spacing-xs)',
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      <Typography 
        sx={{ 
          color: 'var(--text-tertiary)',
          fontSize: 'var(--font-size-sm)',
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyStateMessage;
