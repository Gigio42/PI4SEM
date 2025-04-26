"use client";

import React from 'react';
import styles from './ThemeToggle.module.css';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { toggleTheme, currentTheme } = useTheme();

  return (
    <button 
      className={styles.toggleButton}
      onClick={toggleTheme}
      aria-label={currentTheme === 'dark' ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      <div className={styles.iconContainer}>
        {/* Sun icon for light mode */}
        <svg 
          className={styles.sunIcon} 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >          <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor" />
          <path d="M12 1V3M12 21V23M23 12H21M3 12H1M20.485 3.515L19.071 4.929M4.929 19.071L3.515 20.485M20.485 20.485L19.071 19.071M4.929 4.929L3.515 3.515" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        
        {/* Moon icon for dark mode - more detailed with craters */}
        <svg 
          className={styles.moonIcon} 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path 
            d="M21.9548 12.9566C20.5987 15.3719 17.5147 17.5996 13.9998 17.5996C9.39996 17.5996 5.59998 14.3996 5.59998 10.3996C5.59998 7.79965 7.59997 5.19967 8.79997 4.39967C5.57848 5.73729 3 9.17588 3 13.1997C3 18.0997 7.3 21.9997 12.2 21.9997C16.6 21.9997 20.3 19.3997 21.9 15.5997C22.15 14.7997 22.05 13.7996 21.9548 12.9566Z" 
            fill="currentColor" 
          />
          {/* Moon craters */}
          <circle cx="9.5" cy="10.5" r="1.5" fill="rgba(0,0,0,0.2)" />
          <circle cx="13" cy="15" r="1" fill="rgba(0,0,0,0.15)" />
          <circle cx="15" cy="9" r="0.8" fill="rgba(0,0,0,0.1)" />
        </svg>
        
        {/* Glow effect for the moon */}
        <div className={styles.moonGlow}></div>
      </div>
    </button>
  );
};

export default ThemeToggle;
