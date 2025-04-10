"use client";

import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { theme } = useTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fecha o menu mobile ao clicar em um link
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Toggle para o sidebar em dispositivos móveis
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Dispara um evento personalizado para comunicar com a Sidebar
    const event = new CustomEvent('toggleSidebar', { detail: !isMobileMenuOpen });
    document.dispatchEvent(event);
  };

  return (
    <header className={styles.header} role="banner">      <div className={styles.headerContent}>
        <button 
          className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.active : ''}`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
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
                width={140} 
                height={36} 
                className={styles.logo}
                priority
              />
            </div>
          </Link>
        </div>
        
        <nav className={styles.mainNav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/home" className={`${styles.navLink} ${styles.active}`}>
                Componentes
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/templates" className={styles.navLink}>
                Templates
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/docs" className={styles.navLink}>
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
              type="text" 
              placeholder="Buscar componentes, estilos..." 
              className={styles.searchInput}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              aria-label="Buscar componentes"
            />
            {isSearchFocused && (
              <kbd className={styles.searchShortcut}>
                ESC para cancelar
              </kbd>
            )}
          </div>
          <div className={styles.userControls}>
            <div className={styles.notificationBell}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="currentColor"/>
              </svg>
              <span className={styles.notificationIndicator}></span>
            </div>
            <ThemeToggle />
            <div className={styles.userProfile}>
              <button 
                className={styles.userAvatar} 
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Menu de usuário"
                aria-expanded={showUserMenu}
                aria-controls="user-menu"
              >
                <span>JD</span>
              </button>
              {showUserMenu && (
                <div id="user-menu" className={styles.userMenu}>
                  <ul className={styles.userMenuList}>
                    <li><a href="/profile">Meu Perfil</a></li>
                    <li><a href="/settings">Configurações</a></li>
                    <li><a href="/login" className={styles.logoutLink}>Sair</a></li>
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
