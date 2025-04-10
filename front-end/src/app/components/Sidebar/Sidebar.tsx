"use client";

import Link from "next/link";
import styles from "./Sidebar.module.css";
import { useState, useEffect } from "react";

// Definindo os itens de navegação do menu lateral
const navItems = [
  { 
    name: "Dashboard", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6C4 4.89543 4.89543 4 6 4H8C9.10457 4 10 4.89543 10 6V8C10 9.10457 9.10457 10 8 10H6C4.89543 10 4 9.10457 4 8V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 6C14 4.89543 14.8954 4 16 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H16C14.8954 10 14 9.10457 14 8V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 16C4 14.8954 4.89543 14 6 14H8C9.10457 14 10 14.8954 10 16V18C10 19.1046 9.10457 20 8 20H6C4.89543 20 4 19.1046 4 18V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 16C14 14.8954 14.8954 14 16 14H18C19.1046 14 20 14.8954 20 16V18C20 19.1046 19.1046 20 18 20H16C14.8954 20 14 19.1046 14 18V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/home" 
  },
  { 
    name: "Componentes", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/components" 
  },
  { 
    name: "Estilos", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6.5C12 8.433 10.433 10 8.5 10C6.567 10 5 8.433 5 6.5C5 4.567 6.567 3 8.5 3C10.433 3 12 4.567 12 6.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 21V19C5 16.7909 6.79086 15 9 15H16C18.2091 15 20 16.7909 20 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 8L16 11M16 8L19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/styles" 
  },
  { 
    name: "Templates", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H10V10H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 4H20V10H14V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 14H10V20H4V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 17C14 17 14.7333 19 17 19C19.2667 19 20 17 20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 13.5C14.5 13.5 15 15 17 15C19 15 19.5 13.5 19.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/templates" 
  },
  { 
    name: "Configurações", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.4 15C19.1277 15.8031 19.2583 16.6718 19.7484 17.3915L19.8115 17.4797C20.212 18.0083 20.3438 18.6891 20.1635 19.3279C19.9832 19.9667 19.5094 20.4793 18.89 20.7028C18.2706 20.9263 17.5905 20.8341 17.05 20.4497L16.9656 20.3919C16.2573 19.9212 15.3917 19.8165 14.6001 20.1039C13.8085 20.3912 13.1982 21.0343 12.975 21.85L12.9483 21.9556C12.7842 22.5894 12.3514 23.1226 11.7656 23.4265C11.1798 23.7305 10.4936 23.7742 9.87462 23.5466C9.25566 23.319 8.76005 22.842 8.5183 22.2333C8.27656 21.6246 8.30248 20.9378 8.59 20.35L8.64 20.2358C8.91242 19.4259 8.76909 18.5327 8.26 17.85C7.7509 17.1673 6.94189 16.7775 6.1 16.8L5.99 16.8039C5.35938 16.8193 4.74975 16.5747 4.30085 16.1294C3.85194 15.6841 3.60168 15.076 3.61323 14.4453C3.62478 13.8147 3.89711 13.216 4.3605 12.786C4.8239 12.3559 5.4409 12.1314 6.07 12.17L6.2 12.18C7.0388 12.2373 7.85332 11.8637 8.35 11.18C8.84667 10.4963 8.99338 9.60336 8.73 8.8L8.68 8.69387C8.46949 8.08442 8.53673 7.41078 8.86725 6.859C9.19777 6.30722 9.75485 5.9305 10.39 5.83113C11.0252 5.73176 11.6726 5.91786 12.1553 6.33405C12.6381 6.75024 12.907 7.35695 12.89 7.998L12.884 8.11971C12.8527 8.96065 13.2522 9.75748 13.94 10.25C14.6279 10.7425 15.5125 10.8841 16.31 10.63L16.4314 10.5892C17.0401 10.4094 17.6861 10.5153 18.2098 10.877C18.7335 11.2386 19.0729 11.8187 19.1372 12.4638C19.2014 13.1088 18.9847 13.7463 18.5476 14.2124C18.1105 14.6786 17.4957 14.9258 16.85 14.89L16.7265 14.8813C15.8866 14.8204 15.0721 15.1643 14.55 15.83C14.0347 16.4859 13.8908 17.3522 14.15 18.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/settings" 
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Adiciona evento para ouvir toggle da sidebar vindo do header
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent<boolean>) => {
      if (window.innerWidth <= 768) {
        setMobileOpen(event.detail);
      }
    };

    // Tipagem customizada para o evento
    const customEventListener = (e: Event) => {
      handleToggleSidebar(e as CustomEvent<boolean>);
    };

    document.addEventListener('toggleSidebar', customEventListener);
    
    // Detectar mudanças no tamanho da tela
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('toggleSidebar', customEventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {mobileOpen && <div className={styles.sidebarOverlay} onClick={() => setMobileOpen(false)} />}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        {!collapsed && <h3 className={styles.sidebarTitle}>Menu</h3>}
        <button 
          className={styles.collapseBtn} 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 20L7 12L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 20L17 12L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      <nav className={styles.sidebarNav}>
        <ul className={styles.navItems}>
          {navItems.map((item) => (
            <li key={item.name} className={styles.navItem}>
              <Link href={item.href} className={styles.navLink}>
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navText}>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sidebarFooter}>
        {!collapsed && (
          <div className={styles.upgradeSection}>
            <div className={styles.upgradeIcon}>✨</div>
            <div className={styles.upgradeText}>
              <h4>Upgrade para Pro</h4>
              <p>Acesse todos os recursos</p>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
