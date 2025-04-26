"use client";

import { useSettings } from '../context/SettingsContext';
import { useEffect, useState } from 'react';

export default function SiteMetadata() {
  const { getSettingValue, loading } = useSettings();
  const [mounted, setMounted] = useState(false);
  
  // Só executa no cliente para evitar erros de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Não renderiza nada durante SSR
  if (!mounted) return null;
  
  // Aguarda o carregamento das configurações
  if (loading) return null;
  
  // Obtém as configurações do site
  const siteName = getSettingValue<string>('general', 'siteName', 'UXperiment Labs');
  const siteDescription = getSettingValue<string>('general', 'siteDescription', 'Plataforma de componentes UX/UI para desenvolvedores');
  
  // Atualiza o título e a descrição da página dinamicamente
  if (typeof document !== 'undefined') {
    document.title = siteName;
    // Atualiza a meta description se existir
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', siteDescription);
    }
  }
  
  return null;
}
