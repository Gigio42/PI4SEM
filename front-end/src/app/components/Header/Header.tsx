"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { useTheme } from "../../../contexts/ThemeContext";

// Define the SiteTitle component
const SiteTitle = ({ className }: { className?: string }) => {
  return <span className={className}>UXperiment Labs</span>;
};

export default function Header() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current && 
        userButtonRef.current && 
        !userMenuRef.current.contains(event.target as Node) && 
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSearchFocused && searchInputRef.current) {
          searchInputRef.current.blur();
          setIsSearchFocused(false);
        }
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSearchFocused]);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    
    if (href === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    
    return pathname.startsWith(href);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/' && document.activeElement !== searchInputRef.current) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSearchKeyDown as any);
    return () => {
      window.removeEventListener('keydown', handleSearchKeyDown as any);
    };
  }, []);
  
  if (!mounted) {
    return <header className={styles.header} aria-hidden="true"></header>;
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <button 
          className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={handleMenuToggle}
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
        </button>

        <div className={styles.logoContainer}>
          <Link href="/home" aria-label="Ir para página inicial">
            <div className={styles.logoWrapper}>
              <Image 
                src="/ux-components-logo.svg" 
                alt="UXperiment Labs Logo"
                width={150}
                height={36}
                priority // Add priority for LCP optimization
                style={{ height: 'auto' }} // Ensure proper scaling
              />
              <SiteTitle className={styles.siteTitle} />
            </div>
          </Link>
        </div>
        
        <nav className={`${styles.mainNav} ${mobileMenuOpen ? styles.open : ''}`}>
          <ul className={styles.navList}>
            <li className={`${styles.navItem} ${isActive('/home') ? styles.active : ''}`}>
              <Link href="/home">
                Componentes
              </Link>
            </li>
            <li className={`${styles.navItem} ${isActive('/templates') ? styles.active : ''}`}>
              <Link href="/templates">
                Templates
              </Link>
            </li>
            <li className={`${styles.navItem} ${isActive('/docs') ? styles.active : ''}`}>
              <Link href="/docs">
                Documentação
              </Link>
            </li>
          </ul>
        </nav>
    
        <div className={styles.rightContent}>
          <div className={`${styles.searchBar} ${isSearchFocused ? styles.focused : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Buscar componentes... (/ para focar)"
              className={styles.searchInput}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              aria-label="Buscar componentes"
            />
            {isSearchFocused && (
              <kbd className={styles.searchShortcut}>
                ESC
              </kbd>
            )}
          </div>
          
          <div className={styles.userControls}>
            <div className={styles.notificationBell} aria-label="Notificações" role="button" tabIndex={0}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="currentColor"/>
              </svg>
              <span className={styles.notificationIndicator} aria-hidden="true"></span>
            </div>
            
            <button 
              onClick={toggleTheme} 
              className={styles.themeToggle}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.92999 4.93L6.33999 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.92999 19.07L6.33999 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <div className={styles.userProfile}>
              <button 
                ref={userButtonRef}
                className={styles.userAvatar} 
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Menu de usuário"
                aria-expanded={showUserMenu}
                aria-controls="user-menu"
              >
                <span>JD</span>
              </button>
              
              {showUserMenu && (
                <div 
                  id="user-menu" 
                  className={styles.userMenu} 
                  ref={userMenuRef}
                  role="menu"
                >
                  <ul className={styles.userMenuList}>
                    <li role="menuitem">
                      <Link href="/profile">
                        Meu Perfil
                      </Link>
                    </li>
                    <li role="menuitem">
                      <Link href="/settings">
                        Configurações
                      </Link>
                    </li>
                    <li role="menuitem">
                      <Link href="/login">
                        <span className={styles.logoutLink}>Sair</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
