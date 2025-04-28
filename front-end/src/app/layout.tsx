import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { AuthProvider } from "../contexts/AuthContext";
import SetAdminUser from "./components/SetAdminUser";
import BypassAuth from './components/BypassAuth';
import { FavoriteProvider } from '@/contexts/FavoriteContext';

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
      <body>
        <FavoriteProvider>
          <AuthProvider>
            {/* BypassAuth will now handle proper authentication */}
            <BypassAuth />
            
              <ThemeProvider>
                <NotificationProvider>
                  <SetAdminUser />
                  {children}
                </NotificationProvider>
              </ThemeProvider>
            
          </AuthProvider>
        </FavoriteProvider>
      </body>
    </html>
  );
}

