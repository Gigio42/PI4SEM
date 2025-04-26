'use client';

import { useEffect, useState } from 'react';
import SettingsService from '@/services/SettingsService';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeLoaded, setThemeLoaded] = useState(false);

  async function loadTheme() {
    try {
      // Carregar configurações de cores
      const mainColor = await SettingsService.getSetting('general', 'mainColor', '#663399');
      const accentColor = await SettingsService.getSetting('general', 'accentColor', '#ff6b6b');
      
      // Aplicar cores às variáveis CSS
      document.documentElement.style.setProperty('--primary', mainColor);
      document.documentElement.style.setProperty('--primary-rgb', hexToRgb(mainColor));
      document.documentElement.style.setProperty('--primary-light', adjustBrightness(mainColor, 20));
      document.documentElement.style.setProperty('--primary-dark', adjustBrightness(mainColor, -20));
      document.documentElement.style.setProperty('--accent', accentColor);
      
      setThemeLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setThemeLoaded(true); // Continuar mesmo com erro
    }
  }

  useEffect(() => {
    loadTheme();
    
    // Opcional: criar um evento para recarregar o tema quando as configurações forem alteradas
    window.addEventListener('settings-updated', loadTheme);
    return () => window.removeEventListener('settings-updated', loadTheme);
  }, []);

  return (
    <>
      {children}
    </>
  );
}

// Função helper para converter hex para rgb
function hexToRgb(hex: string): string {
  // Remover # se presente
  hex = hex.replace(/^#/, '');
  
  // Parse os componentes de cor
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// Função helper para ajustar o brilho de uma cor (percentual positivo ou negativo)
function adjustBrightness(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '');
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  r = Math.min(255, Math.max(0, r + (r * percent / 100)));
  g = Math.min(255, Math.max(0, g + (g * percent / 100)));
  b = Math.min(255, Math.max(0, b + (b * percent / 100)));
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}
