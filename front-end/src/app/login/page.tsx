"use client";

import { useState, useEffect } from "react";
import styles from "./login.module.css";
import LoginForm from "./form";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import Image from "next/image";

export default function LoginPage() {
  const [loaded, setLoaded] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
    useEffect(() => {
    setLoaded(true);
    
    // Check if login logo should be displayed from localStorage
    const shouldShowLogo = localStorage.getItem('showLoginLogo') === 'true';
    
    // Also check for the appearance.showLoginLogo setting
    try {
      // First try the individual setting
      if (localStorage.getItem('showLoginLogo') === 'true') {
        setShowLogo(true);
      } else {
        // Try getting the site name to confirm settings are loaded
        const siteName = localStorage.getItem('siteName');
        if (siteName) {
          // Default to showing logo if settings exist but showLoginLogo isn't explicitly false
          const explicitlyHidden = localStorage.getItem('showLoginLogo') === 'false';
          if (!explicitlyHidden) {
            setShowLogo(true);
          }
        } else {
          // If no settings are loaded yet, default to true
          setShowLogo(true);
        }
      }
    } catch (error) {
      console.error('Error checking stored settings:', error);
      // Default to showing logo if there's an error
      setShowLogo(true);
    }
    
    // Add event listener for settings changes
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.settings) {
        // Check if showLoginLogo setting was updated
        const logoSetting = customEvent.detail.settings.find(
          (s: any) => s.section === 'appearance' && s.key === 'showLoginLogo'
        );
        if (logoSetting !== undefined) {
          setShowLogo(!!logoSetting.value);
        }
      }
    };
    
    document.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      document.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return (
    <div className={`${styles.container} ${loaded ? styles.loaded : ""}`}>
      <div className={styles.themeToggleContainer}>
        <ThemeToggle />
      </div>
      
      <div className={styles.loginCard}>
        {showLogo && (
          <div className={styles.logoContainer}>
            <Image 
              src="/logo.png" 
              alt="UXperiment Labs Logo" 
              width={120} 
              height={120} 
              className={styles.logo}
              priority
            />
          </div>
        )}
        
        <h1 className={styles.title}>Bem-vindo</h1>
        <p className={styles.subtitle}>Entre em sua conta para continuar</p>
        
        <LoginForm />
      </div>
      
      <div className={styles.bgGradient}></div>
    </div>
  );
}