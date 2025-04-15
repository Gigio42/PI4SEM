'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SettingsService, { SettingsData, SettingsItem } from '../services/SettingsService';

// Interface for the context
interface SettingsContextType {
  settings: SettingsData;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (newSettings: SettingsData) => void;
  applySettings: () => void;
}

// Creating the context with initial value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<SettingsData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch settings from API
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await SettingsService.getAllSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Failed to load settings, using defaults:', err);
      // Default settings are already provided by the service
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Function to update settings
  const updateSettings = (newSettings: SettingsData) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Function to apply settings to DOM/CSS
  const applySettings = () => {
    // Convert flat settings object to array of SettingsItem
    const settingsArray: SettingsItem[] = [];
    
    Object.entries(settings).forEach(([section, sectionValues]) => {
      Object.entries(sectionValues).forEach(([key, value]) => {
        settingsArray.push({ section, key, value });
      });
    });
    
    // Use the service's method to apply settings to UI
    SettingsService.applySettingsToUI(settingsArray);
  };

  // Apply settings whenever they change
  useEffect(() => {
    if (!isLoading && Object.keys(settings).length > 0) {
      applySettings();
    }
  }, [settings, isLoading]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error, updateSettings, applySettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use the context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
