'use client';

import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeLoaded, setThemeLoaded] = useState(false);

  function loadTheme() {
    try {
      // Default theme colors
      const mainColor = '#663399';
      const accentColor = '#ff6b6b';
      
      // Apply colors to CSS variables
      document.documentElement.style.setProperty('--primary', mainColor);
      document.documentElement.style.setProperty('--primary-rgb', hexToRgb(mainColor));
      document.documentElement.style.setProperty('--primary-light', adjustBrightness(mainColor, 20));
      document.documentElement.style.setProperty('--primary-dark', adjustBrightness(mainColor, -20));
      document.documentElement.style.setProperty('--accent', accentColor);
      
      setThemeLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setThemeLoaded(true); // Continue even with error
    }
  }

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <>
      {children}
    </>
  );
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse color components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// Helper function to adjust brightness of a color (positive or negative percentage)
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
