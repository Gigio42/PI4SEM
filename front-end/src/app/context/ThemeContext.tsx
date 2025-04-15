"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "system" | "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  currentTheme: "light" | "dark"; // Tema efetivamente aplicado
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  
  // Carrega tema do armazenamento local
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    }
  }, []);

  // Monitora mudanças no sistema e atualiza tema
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === 'system') {
        setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    // Inicializa o tema com base na preferência do sistema
    handleChange();
    
    // Adiciona listener para mudanças na preferência do sistema
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Aplicar o tema no documento
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Update to use data-theme attribute instead of class
    if (theme === 'system') {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';
      setCurrentTheme(systemTheme);
      document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
      setCurrentTheme(theme === 'dark' ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light'; // system -> light
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
