'use client';

import { ThemeProvider } from '@/app/context/ThemeContext';

export default function ClientThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
