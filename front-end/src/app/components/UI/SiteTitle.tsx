"use client";

import { useSettings } from '../../context/SettingsContext';

interface SiteTitleProps {
  className?: string;
}

export default function SiteTitle({ className = '' }: SiteTitleProps) {
  const { getSettingValue, loading } = useSettings();
  
  // Obtém o título do site das configurações
  const siteName = getSettingValue<string>('general', 'siteName', 'UXperiment Labs');
  
  // Enquanto carrega, mostra um valor padrão ou um espaço reservado
  if (loading) {
    return <span className={className}>Carregando...</span>;
  }
  
  return (
    <span className={className}>{siteName}</span>
  );
}
