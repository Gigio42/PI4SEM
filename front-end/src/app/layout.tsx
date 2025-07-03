import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import React, { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { AuthProvider } from '@/contexts/AuthContext';
import SetAdminUser from "./components/SetAdminUser";
import BypassAuth from './components/BypassAuth';
import { FavoriteProvider } from '@/contexts/FavoriteContext';

// Suppress useLayoutEffect warning for SSR
if (typeof window === 'undefined') {
  // @ts-ignore - useLayoutEffect doesn't exist on server
  React.useLayoutEffect = React.useEffect;
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UXperiment Labs",
  description: "Plataforma de desenvolvimento e experimentação de componentes UI",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <FavoriteProvider>
                {/* BypassAuth will now handle proper authentication */}
                <BypassAuth />
                
                  <SetAdminUser />
                  {children}
                
              </FavoriteProvider>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

