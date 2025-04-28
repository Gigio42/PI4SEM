'use client';

import React, { createContext, useContext } from 'react';

// Simple interface just to satisfy component dependencies
interface SettingsContextType {
  settings: any;
  isLoading: boolean;
  error: Error | null;
  getSettingValue: <T>(section: string, key: string, defaultValue: T) => T;
}

// Create context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: getDefaultSettings(),
  isLoading: false,
  error: null,
  getSettingValue: (section, key, defaultValue) => defaultValue,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  // Simple implementation that just provides default values
  const getSettingValue = <T,>(section: string, key: string, defaultValue: T): T => {
    const settings = getDefaultSettings();
    return settings[section]?.[key] ?? defaultValue;
  };

  return (
    <SettingsContext.Provider value={{ 
      settings: getDefaultSettings(),
      isLoading: false, 
      error: null,
      getSettingValue
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use the context
export const useSettings = () => {
  return useContext(SettingsContext);
};

// Default settings
function getDefaultSettings(): any {
  return {
    general: {
      siteName: 'UXperiment Labs',
      siteDescription: 'Plataforma de desenvolvimento e experimentação de componentes UI',
      contactEmail: 'contato@uxperiment.com',
    },
    appearance: {
      theme: 'system',
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      sidebarCollapsed: false
    }
  };
}
