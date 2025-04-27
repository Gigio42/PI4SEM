"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useState, useEffect, ReactNode } from "react";

// Defining the navigation item type
export interface NavItem {
  name: string;
  icon: ReactNode;
  href: string;
  highlight?: boolean; // For highlighting important items
  badge?: string | number; // For showing notifications or counters
  alwaysActive?: boolean; // To keep an item always active
}

// Modular Sidebar component that accepts different navigation items based on user type
interface SidebarProps {
  items?: NavItem[];
  isAdmin?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

// Default navigation items for regular users
const userNavItems: NavItem[] = [
  { 
    name: "Componentes",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    href: "/components"
  },
  { 
    name: "Favoritos", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/favoritos" 
  },
  { 
    name: "Estilos", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 13L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    name: "Assinatura", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/subscription" 
  }
];

// Navigation items for admins
const adminNavItems: NavItem[] = [
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
    href: "/adm"
  },
  { 
    name: "Gerenciar Componentes", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/components"
  },
  { 
    name: "Gerenciar Usuários", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C17.7699 3.58317 19.0078 5.17798 19.0078 7.005C19.0078 8.83202 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/users",
    badge: 2
  },
  { 
    name: "Gerenciar Assinaturas", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C14 2 12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C10 2 12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/subscriptions" 
  },
  { 
    name: "Estatísticas", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/stats" 
  },
  { 
    name: "Configurações", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.4 15C19.1277 15.8031 19.2583 16.6718 19.7484 17.3915L19.8115 17.4797C20.212 18.0083 20.3438 18.6891 20.1635 19.3279C19.9832 19.9667 19.5094 20.4793 18.89 20.7028C18.2706 20.9263 17.5905 20.8341 17.05 20.4497L16.9656 20.3919C16.2573 19.9212 15.3917 19.8165 14.6001 20.1039C13.8085 20.3912 13.1982 21.0343 12.975 21.85L12.9483 21.9556C12.7842 22.5894 12.3514 23.1226 11.7656 23.4265C11.1798 23.7305 10.4936 23.7742 9.87462 23.5466C9.25566 23.319 8.76005 22.842 8.5183 22.2333C8.27656 21.6246 8.30248 20.9378 8.59 20.35L8.64 20.2358C8.91242 19.4259 8.76909 18.5327 8.26 17.85C7.7509 17.1673 6.94189 16.7775 6.1 16.8L5.99 16.8039C5.35938 16.8193 4.74975 16.5747 4.30085 16.1294C3.85194 15.6841 3.60168 15.076 3.61323 14.4453C3.62478 13.8147 3.89711 13.216 4.3605 12.786C4.8239 12.3559 5.4409 12.1314 6.07 12.17L6.2 12.18C7.0388 12.2373 7.85332 11.8637 8.35 11.18C8.84667 10.4963 8.99338 9.60336 8.73 8.8L8.68 8.69387C8.46949 8.08442 8.53673 7.41078 8.86725 6.859C9.19777 6.30722 9.75485 5.9305 10.39 5.83113C11.0252 5.73176 11.6726 5.91786 12.1553 6.33405C12.6381 6.75024 12.907 7.35695 12.89 7.998L12.884 8.11971C12.8527 8.96065 13.2522 9.75748 13.94 10.25C14.6279 10.7425 15.5125 10.8841 16.31 10.63L16.4314 10.5892C17.0401 10.4094 17.6861 10.5153 18.2098 10.877C18.7335 11.2386 19.0729 11.8187 19.1372 12.4638C19.2014 13.1088 18.9847 13.7463 18.5476 14.2124C18.1105 14.6786 17.4957 14.9258 16.85 14.89L16.7265 14.8813C15.8866 14.8204 15.0721 15.1643 14.55 15.83C14.0347 16.4859 13.8908 17.3522 14.15 18.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    href: "/adm/settings" 
  }
];

export default function Sidebar({ items, isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  
  // Determine which navigation items to use
  const navItemsToUse = items || (isAdmin ? adminNavItems : userNavItems);
  
  // Check if an item is active based on the current route
  const isActive = (href: string, alwaysActive?: boolean, index?: number) => {
    if (alwaysActive) return true;
    if (pathname === null) return false;
    if (href === "/home" && pathname === "/") return true;
    
    // If we're on the home page and this is the first item in the menu (Components)
    if ((pathname === "/" || pathname === "/home") && href === "/components" && !isAdmin) return true;
    
    // Special logic for admin dashboard
    if (href === "/adm") {
      // If we're exactly on the /adm page, mark as active
      return pathname === "/adm";
    }
    
    // For other items, check for exact match or if it's a subpath
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Add event to listen for sidebar toggle from header
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent<boolean>) => {
      if (window.innerWidth <= 768) {
        setMobileOpen(event.detail);
      }
    };

    // Custom typing for the event
    const customEventListener = (e: Event) => {
      handleToggleSidebar(e as CustomEvent<boolean>);
    };

    document.addEventListener('toggleSidebar', customEventListener);
    
    // Detect screen size changes
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
      {mobileOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setMobileOpen(false)} 
        />
      )}
      <aside 
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          {!collapsed && <h3 className={styles.sidebarTitle}>{isAdmin ? "Administração" : "Menu"}</h3>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={styles.collapseButton}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              : 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItemsToUse.map((item, index) => {
              const active = isActive(item.href, item.alwaysActive, index);
              
              return (
                <li 
                  key={index} 
                  className={`${styles.navItem} ${active ? styles.active : ''} ${item.highlight ? styles.highlight : ''}`}
                  onMouseEnter={() => collapsed && setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link href={item.href}>
                    <div className={`${styles.navLink} ${active ? styles.activeLink : ''}`}>
                      <span className={styles.navIcon}>{item.icon}</span>
                      {!collapsed && (
                        <span className={styles.navText}>
                          {item.name}
                          {item.badge && <span className={styles.badge}>{item.badge}</span>}
                        </span>
                      )}
                    </div>
                    
                    {/* Tooltip for collapsed mode */}
                    {collapsed && hoveredItem === item.name && (
                      <div className={styles.tooltip}>
                        {item.name}
                        {item.badge && <span className={styles.tooltipBadge}>{item.badge}</span>}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}