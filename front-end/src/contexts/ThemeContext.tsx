'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [theme, setTheme] = useState<ThemeType>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

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
      }
      
      // Apply dark mode if needed
      if (shouldUseDark) {
        root.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
      } else {
        root.removeAttribute('data-theme');
        document.body.classList.remove('dark-theme');
      }

      // Store theme preference
      localStorage.setItem('theme', shouldUseDark ? 'dark' : 'light');
      
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
      // Clean up listener
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  // Function to toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'light';
      // If system, set according to current dark mode state but inverted
      return isDarkMode ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
