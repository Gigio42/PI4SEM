/**
 * Formata um valor para o formato de moeda brasileira (R$)
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

/**
 * Formata um número com separadores de milhar
 * @param value Valor a ser formatado
 * @returns String formatada (ex: 1.234)
 */
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR').format(numValue);
};

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param dateString String de data ou objeto Date
 * @returns String formatada (ex: 01/01/2023)
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata uma porcentagem
 * @param value Valor a ser formatado (ex: 0.1234)
 * @param decimals Número de casas decimais
 * @returns String formatada (ex: 12,34%)
 */
export const formatPercent = (value: number, decimals = 2): string => {
  return value.toLocaleString('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
