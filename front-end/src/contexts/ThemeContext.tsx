'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { settings } = useSettings();
  const [theme, setTheme] = useState<ThemeType>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from settings when they load
  useEffect(() => {
    if (settings?.appearance?.theme) {
      setTheme(settings.appearance.theme as ThemeType);
    }
  }, [settings]);

  // Apply theme changes and detect system preference
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let shouldUseDark = false;

      // Check if user selected a theme or if we should use system preference
      if (theme === 'dark') {
        shouldUseDark = true;
      } else if (theme === 'system') {
        // Check system preference
        shouldUseDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }      // Apply dark mode if needed
      if (shouldUseDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }

      setIsDarkMode(shouldUseDark);
    };

    applyTheme();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    // Add listener with compatibility for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      // Clean up listener with compatibility
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
