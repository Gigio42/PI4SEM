import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import SetAdminUser from "./components/SetAdminUser";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UXperiment Labs",
  description: "Plataforma de desenvolvimento e experimentação de componentes UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
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
