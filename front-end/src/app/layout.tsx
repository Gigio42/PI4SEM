import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import SetAdminUser from "./components/SetAdminUser";
import BypassAuth from './components/BypassAuth';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UXperiment Labs",
  description: "Plataforma de desenvolvimento e experimentação de componentes UI",
};
export default function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="en">
      <body>
        {/* Add this component to bypass authentication */}
        <BypassAuth />
        <SettingsProvider>
          <ThemeProvider>
            <NotificationProvider>
              <SetAdminUser />
              {children}
            </NotificationProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

