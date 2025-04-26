'use client';

import { ThemeProvider } from '@/app/context/ThemeContext';
import SettingsProvider from '@/app/context/SettingsContext';

export default function ClientThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SettingsProvider>
  );
}
